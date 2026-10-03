import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret-key';

const { createAuthMiddleware } = await import('../src/middleware/authMiddleware.js');
const { createTaskService } = await import('../src/services/taskService.js');
const { createTaskController } = await import('../src/controllers/taskController.js');
const { createTaskRoutes } = await import('../src/routes/taskRoutes.js');

function createInMemoryUserModel() {
  const users = new Map();
  return {
    seed(user) {
      users.set(user.id, user);
      return user;
    },
    async findUserById(id) {
      return users.get(Number(id)) || null;
    }
  };
}

function createInMemoryDonationModel() {
  const donations = new Map();
  return {
    seed(donation) {
      donations.set(donation.id, { ...donation });
    },
    async findDonationWithOwner(id) {
      return donations.get(Number(id)) || null;
    }
  };
}

function createFakeDb() {
  const fakeConnection = {
    async beginTransaction() {},
    async commit() {},
    async rollback() {},
    release() {},
    async query() {
      return [[], undefined];
    },
    async execute() {
      return [[], undefined];
    }
  };

  return {
    async getConnection() {
      return fakeConnection;
    }
  };
}

function createInMemoryTaskModel() {
  const tasks = new Map();
  let nextId = 1;

  return {
    seed(task) {
      tasks.set(task.id, { ...task });
      nextId = Math.max(nextId, task.id + 1);
      return task;
    },
    async createTask(taskData) {
      const id = nextId++;
      tasks.set(id, {
        id,
        donation_id: taskData.donation_id,
        volunteer_id: taskData.volunteer_id,
        claim_id: taskData.claim_id,
        assigned_at: new Date().toISOString(),
        accepted_at: null,
        picked_up_at: null,
        delivered_at: null,
        status: 'ASSIGNED'
      });
      return id;
    },
    async findTaskById(id) {
      return tasks.get(Number(id)) || null;
    },
    async findTaskDetailsById(id) {
      const task = tasks.get(Number(id));
      return task ? { ...task, food_name: task.food_name || 'Seed Meal', food_category: task.food_category || 'Cooked Meals', quantity: task.quantity || 20, quantity_unit: task.quantity_unit || 'boxes', estimated_meals: task.estimated_meals || 60, expiry_time: task.expiry_time || '2026-09-23 10:00:00', pickup_address: task.pickup_address || 'Delhi', donor_name: 'Donor One', donor_email: 'donor@test.com', donor_phone: '9999999999', donor_organization_name: 'Seed Org', ngo_organization_name: 'Ngo Org', volunteer_name: 'Volunteer One' } : null;
    },
    async listTasksByVolunteer(volunteerId) {
      return [...tasks.values()].filter((task) => task.volunteer_id === volunteerId);
    },
    async findTaskByDonationId(donationId) {
      return [...tasks.values()].find((task) => task.donation_id === donationId) || null;
    },
    async updateTaskStatus(id, updates) {
      const current = tasks.get(Number(id));
      if (!current) {
        return null;
      }
      const updated = { ...current, ...updates };
      tasks.set(Number(id), updated);
      return updated;
    }
  };
}

function buildApp({ userModel, donationModel, taskModel }) {
  const taskService = createTaskService({ userModel, donationModel, taskModel, db: createFakeDb() });
  const taskController = createTaskController({ taskService });
  const authMiddleware = createAuthMiddleware({ userModel, jwtSecret: process.env.JWT_SECRET });
  const taskRoutes = createTaskRoutes({ taskController, authMiddleware });

  const app = express();
  app.use(express.json());
  app.use('/api/tasks', taskRoutes);
  app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' }));
  return app;
}

function signToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

test('task assignment, accept, pickup, and delivery flow works', async () => {
  const userModel = createInMemoryUserModel();
  const donationModel = createInMemoryDonationModel();
  const taskModel = createInMemoryTaskModel();

  userModel.seed({ id: 1, name: 'Admin', email: 'admin@test.com', role: 'ADMIN', is_active: true });
  userModel.seed({ id: 2, name: 'Ngo', email: 'ngo@test.com', role: 'NGO', is_active: true });
  userModel.seed({ id: 3, name: 'Volunteer', email: 'vol@test.com', role: 'VOLUNTEER', is_active: true });

  donationModel.seed({ id: 1, donor_id: 10, status: 'CLAIMED', estimated_meals: 60 });
  donationModel.seed({ id: 2, donor_id: 10, status: 'CLAIMED', estimated_meals: 60 });
  taskModel.seed({ id: 1, donation_id: 1, claim_id: 5, volunteer_id: 3, status: 'ASSIGNED', assigned_at: new Date().toISOString() });

  const app = buildApp({ userModel, donationModel, taskModel });
  const volunteerToken = signToken(3, 'VOLUNTEER');
  const adminToken = signToken(1, 'ADMIN');

  const assignTaskResponse = await request(app)
    .post('/api/tasks/assign')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ donation_id: 2, claim_id: 6, volunteer_id: 3 });

  assert.equal(assignTaskResponse.status, 201);
  assert.equal(assignTaskResponse.body.data.task.status, 'ASSIGNED');

  const assignResponse = await request(app)
    .post('/api/tasks/1/accept')
    .set('Authorization', `Bearer ${volunteerToken}`);

  assert.equal(assignResponse.status, 200);
  assert.equal(assignResponse.body.data.task.status, 'ACCEPTED');

  const pickupResponse = await request(app)
    .put('/api/tasks/1/pickup')
    .set('Authorization', `Bearer ${volunteerToken}`);

  assert.equal(pickupResponse.status, 200);
  assert.equal(pickupResponse.body.data.task.status, 'PICKED_UP');

  const deliverResponse = await request(app)
    .put('/api/tasks/1/deliver')
    .set('Authorization', `Bearer ${volunteerToken}`);

  assert.equal(deliverResponse.status, 200);
  assert.equal(deliverResponse.body.data.task.status, 'DELIVERED');

  const listResponse = await request(app)
    .get('/api/tasks')
    .set('Authorization', `Bearer ${volunteerToken}`);

  assert.equal(listResponse.status, 200);

  const detailsResponse = await request(app)
    .get('/api/tasks/1')
    .set('Authorization', `Bearer ${volunteerToken}`);

  assert.equal(detailsResponse.status, 200);

  const adminAssign = await request(app)
    .post('/api/tasks/2/accept')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(adminAssign.status, 403);
});

test('unauthorized volunteer and invalid transitions are blocked', async () => {
  const userModel = createInMemoryUserModel();
  const donationModel = createInMemoryDonationModel();
  const taskModel = createInMemoryTaskModel();

  userModel.seed({ id: 1, name: 'Volunteer One', email: 'vol1@test.com', role: 'VOLUNTEER', is_active: true });
  userModel.seed({ id: 2, name: 'Volunteer Two', email: 'vol2@test.com', role: 'VOLUNTEER', is_active: true });
  donationModel.seed({ id: 10, donor_id: 20, status: 'CLAIMED' });
  taskModel.seed({ id: 10, donation_id: 10, claim_id: 6, volunteer_id: 1, status: 'ACCEPTED', assigned_at: new Date().toISOString() });

  const app = buildApp({ userModel, donationModel, taskModel });
  const otherVolunteerToken = signToken(2, 'VOLUNTEER');
  const assignedVolunteerToken = signToken(1, 'VOLUNTEER');

  const unauthorizedPickup = await request(app)
    .put('/api/tasks/10/pickup')
    .set('Authorization', `Bearer ${otherVolunteerToken}`);

  assert.equal(unauthorizedPickup.status, 403);

  const invalidTransition = await request(app)
    .put('/api/tasks/10/deliver')
    .set('Authorization', `Bearer ${assignedVolunteerToken}`);

  assert.equal(invalidTransition.status, 409);
});

test('assignment requires admin or ngo and active volunteer', async () => {
  const userModel = createInMemoryUserModel();
  const donationModel = createInMemoryDonationModel();
  const taskModel = createInMemoryTaskModel();

  userModel.seed({ id: 1, name: 'Admin', email: 'admin@test.com', role: 'ADMIN', is_active: true });
  userModel.seed({ id: 2, name: 'Ngo', email: 'ngo@test.com', role: 'NGO', is_active: true });
  userModel.seed({ id: 3, name: 'Inactive Volunteer', email: 'vol@test.com', role: 'VOLUNTEER', is_active: false });
  userModel.seed({ id: 4, name: 'Donor', email: 'donor@test.com', role: 'DONOR', is_active: true });
  donationModel.seed({ id: 20, donor_id: 30, status: 'CLAIMED' });

  const app = buildApp({ userModel, donationModel, taskModel });
  const ngoToken = signToken(2, 'NGO');
  const donorToken = signToken(4, 'DONOR');

  const assignResponse = await request(app)
    .post('/api/tasks/assign')
    .set('Authorization', `Bearer ${ngoToken}`)
    .send({ donation_id: 20, claim_id: 9, volunteer_id: 3 });

  assert.equal(assignResponse.status, 404);

  const forbiddenAssign = await request(app)
    .post('/api/tasks/assign')
    .set('Authorization', `Bearer ${donorToken}`)
    .send({ donation_id: 20, claim_id: 9, volunteer_id: 3 });

  assert.equal(forbiddenAssign.status, 403);
});

test('duplicate delivery is blocked', async () => {
  const userModel = createInMemoryUserModel();
  const donationModel = createInMemoryDonationModel();
  const taskModel = createInMemoryTaskModel();

  userModel.seed({ id: 1, name: 'Volunteer', email: 'vol@test.com', role: 'VOLUNTEER', is_active: true });
  donationModel.seed({ id: 11, donor_id: 30, status: 'PICKED_UP' });
  taskModel.seed({ id: 11, donation_id: 11, claim_id: 7, volunteer_id: 1, status: 'PICKED_UP', assigned_at: new Date().toISOString() });

  const app = buildApp({ userModel, donationModel, taskModel });
  const volunteerToken = signToken(1, 'VOLUNTEER');

  const firstDelivery = await request(app)
    .put('/api/tasks/11/deliver')
    .set('Authorization', `Bearer ${volunteerToken}`);

  assert.equal(firstDelivery.status, 200);

  const secondDelivery = await request(app)
    .put('/api/tasks/11/deliver')
    .set('Authorization', `Bearer ${volunteerToken}`);

  assert.equal(secondDelivery.status, 409);
});
