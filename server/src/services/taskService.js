import pool from '../config/db.js';
import { AppError } from '../utils/appError.js';
import { findUserById } from '../models/userModel.js';
import { findDonationWithOwner } from '../models/donationModel.js';
import { createNotification } from '../models/notificationModel.js';
import { IMPACT_FACTORS } from '../config/impactFactors.js';
import { createImpactRecord, findImpactByDonationId } from '../models/impactModel.js';
import {
  assignVolunteerTask,
  findTaskByDonationId,
  findTaskById,
  findTaskDetailsById,
  listTasksByVolunteer,
  updateTaskStatus
} from '../models/taskModel.js';

const VALID_ACCEPTABLE_TASK_STATUSES = new Set(['ASSIGNED']);
const VALID_PICKUP_TASK_STATUSES = new Set(['ACCEPTED']);
const VALID_DELIVERY_TASK_STATUSES = new Set(['PICKED_UP']);

function requireVolunteer(user) {
  if (user.role !== 'VOLUNTEER') {
    throw new AppError('Only volunteers can perform this action', 403);
  }
}

function requireAssignableManager(user) {
  if (!['ADMIN', 'NGO', 'SHELTER'].includes(user.role)) {
    throw new AppError('Only admin, NGO, or shelter users can assign volunteers', 403);
  }
}

async function createPickupNotifications(connection, donation, task) {
  await createNotification({
    user_id: donation.donor_id,
    title: 'Food picked up',
    message: 'Your donation has been picked up by a volunteer.'
  }, connection);

  if (task.ngo_id) {
    await createNotification({
      user_id: task.ngo_id,
      title: 'Food picked up',
      message: 'A volunteer has picked up the donation you claimed.'
    }, connection);
  }
}

async function createDeliveryNotifications(connection, donation, task) {
  await createNotification({
    user_id: donation.donor_id,
    title: 'Food delivered',
    message: 'Your donation has been delivered.'
  }, connection);

  if (task.ngo_id) {
    await createNotification({
      user_id: task.ngo_id,
      title: 'Food delivered',
      message: 'The claimed donation has been delivered.'
    }, connection);
  }
}

export function createTaskService(dependencies = {}) {
  const userRepository = dependencies.userModel || { findUserById };
  const donationRepository = dependencies.donationModel || { findDonationWithOwner };
  const database = dependencies.db || pool;
  const taskRepository = dependencies.taskModel || {
    createTask: assignVolunteerTask,
    findTaskById,
    findTaskDetailsById,
    listTasksByVolunteer,
    findTaskByDonationId,
    updateTaskStatus
  };

  return {
    async listTasks(user) {
      if (user.role === 'VOLUNTEER') {
        return taskRepository.listTasksByVolunteer(user.id);
      }

      if (!['ADMIN', 'NGO', 'SHELTER'].includes(user.role)) {
        throw new AppError('Forbidden', 403);
      }

      return [];
    },

    async getTask(user, taskId) {
      const task = await taskRepository.findTaskDetailsById(taskId);
      if (!task) {
        throw new AppError('Task not found', 404);
      }

      if (user.role === 'VOLUNTEER' && task.volunteer_id !== user.id) {
        throw new AppError('Forbidden', 403);
      }

      return task;
    },

    async assignTask(user, payload) {
      requireAssignableManager(user);

      const volunteer = await userRepository.findUserById(payload.volunteer_id);
      if (!volunteer || !volunteer.is_active || volunteer.role !== 'VOLUNTEER') {
        throw new AppError('Volunteer not found or inactive', 404);
      }

      const donation = await donationRepository.findDonationWithOwner(payload.donation_id);
      if (!donation) {
        throw new AppError('Donation not found', 404);
      }

      if (donation.status !== 'CLAIMED' && donation.status !== 'PICKUP_ASSIGNED') {
        throw new AppError('Donation must be claimed before assignment', 409);
      }

      const existingTask = await taskRepository.findTaskByDonationId(payload.donation_id);
      if (existingTask && existingTask.volunteer_id) {
        throw new AppError('Task already assigned to a volunteer', 409);
      }

      const taskId = await taskRepository.createTask({
        donation_id: payload.donation_id,
        claim_id: payload.claim_id,
        volunteer_id: payload.volunteer_id
      });

      const task = await taskRepository.findTaskById(taskId);
      return task;
    },

    async acceptTask(user, taskId) {
      requireVolunteer(user);

      const task = await taskRepository.findTaskById(taskId);
      if (!task) {
        throw new AppError('Task not found', 404);
      }

      if (task.volunteer_id !== user.id) {
        throw new AppError('Forbidden', 403);
      }

      if (!VALID_ACCEPTABLE_TASK_STATUSES.has(task.status)) {
        throw new AppError('Task cannot be accepted in its current status', 409);
      }

      return taskRepository.updateTaskStatus(taskId, { status: 'ACCEPTED', accepted_at: new Date() });
    },

    async pickupTask(user, taskId) {
      requireVolunteer(user);

      const task = await taskRepository.findTaskDetailsById(taskId);
      if (!task) {
        throw new AppError('Task not found', 404);
      }

      if (task.volunteer_id !== user.id) {
        throw new AppError('Forbidden', 403);
      }

      if (!VALID_PICKUP_TASK_STATUSES.has(task.status)) {
        throw new AppError('Task cannot be picked up in its current status', 409);
      }

      const connection = await database.getConnection();
      try {
        await connection.beginTransaction();

        const updatedTask = await taskRepository.updateTaskStatus(taskId, { status: 'PICKED_UP', picked_up_at: new Date() }, connection);
        await connection.execute('UPDATE donations SET status = ? WHERE id = ?', ['PICKED_UP', task.donation_id]);
        const donation = await donationRepository.findDonationWithOwner(task.donation_id);
        await createPickupNotifications(connection, donation, task);

        await connection.commit();
        return updatedTask;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },

    async deliverTask(user, taskId) {
      requireVolunteer(user);

      const task = await taskRepository.findTaskDetailsById(taskId);
      if (!task) {
        throw new AppError('Task not found', 404);
      }

      if (task.volunteer_id !== user.id) {
        throw new AppError('Forbidden', 403);
      }

      if (!VALID_DELIVERY_TASK_STATUSES.has(task.status)) {
        throw new AppError('Task cannot be delivered in its current status', 409);
      }

      const connection = await database.getConnection();
      try {
        await connection.beginTransaction();

        const updatedTask = await taskRepository.updateTaskStatus(taskId, { status: 'DELIVERED', delivered_at: new Date() }, connection);
        await connection.execute('UPDATE donations SET status = ? WHERE id = ?', ['DELIVERED', task.donation_id]);

        const existingImpact = await findImpactByDonationId(task.donation_id, connection);
        if (!existingImpact) {
          await createImpactRecord(
            {
              donation_id: task.donation_id,
              meals_saved: task.estimated_meals,
              co2_offset_kg: Number((task.estimated_meals * IMPACT_FACTORS.MEAL_CO2_FACTOR).toFixed(2)),
              calculation_method: `meals_saved = estimated_meals; co2_offset_kg = meals_saved * ${IMPACT_FACTORS.MEAL_CO2_FACTOR}`
            },
            connection
          );
        }

        const donation = await donationRepository.findDonationWithOwner(task.donation_id);
        await createDeliveryNotifications(connection, donation, task);

        await connection.commit();
        return updatedTask;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }
  };
}

export const taskService = createTaskService();
