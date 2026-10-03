import { taskService as defaultTaskService } from '../services/taskService.js';

export function createTaskController(dependencies = {}) {
  const taskService = dependencies.taskService || defaultTaskService;

  return {
    async assign(req, res, next) {
      try {
        const task = await taskService.assignTask(req.user, req.body);
        res.status(201).json({ success: true, data: { task } });
      } catch (error) {
        next(error);
      }
    },

    async list(req, res, next) {
      try {
        const tasks = await taskService.listTasks(req.user);
        res.status(200).json({ success: true, data: tasks });
      } catch (error) {
        next(error);
      }
    },

    async details(req, res, next) {
      try {
        const task = await taskService.getTask(req.user, req.params.id);
        res.status(200).json({ success: true, data: { task } });
      } catch (error) {
        next(error);
      }
    },

    async accept(req, res, next) {
      try {
        const task = await taskService.acceptTask(req.user, req.params.id);
        res.status(200).json({ success: true, data: { task } });
      } catch (error) {
        next(error);
      }
    },

    async pickup(req, res, next) {
      try {
        const task = await taskService.pickupTask(req.user, req.params.id);
        res.status(200).json({ success: true, data: { task } });
      } catch (error) {
        next(error);
      }
    },

    async deliver(req, res, next) {
      try {
        const task = await taskService.deliverTask(req.user, req.params.id);
        res.status(200).json({ success: true, data: { task } });
      } catch (error) {
        next(error);
      }
    }
  };
}

export const taskController = createTaskController();
