import { Router } from 'express';
import { body } from 'express-validator';
import { taskController } from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const assignValidation = [
  body('donation_id').isInt({ min: 1 }).withMessage('Donation id is required'),
  body('claim_id').isInt({ min: 1 }).withMessage('Claim id is required'),
  body('volunteer_id').isInt({ min: 1 }).withMessage('Volunteer id is required')
];

export function createTaskRoutes(dependencies = {}) {
  const controller = dependencies.taskController || taskController;
  const middleware = dependencies.authMiddleware || authMiddleware;
  const assigner = dependencies.authorizeRoles || authorizeRoles;

  const router = Router();

  router.post('/assign', middleware, assigner('ADMIN', 'NGO', 'SHELTER'), assignValidation, validateRequest, controller.assign);
  router.get('/', middleware, controller.list);
  router.get('/:id', middleware, controller.details);
  router.post('/:id/accept', middleware, controller.accept);
  router.put('/:id/pickup', middleware, controller.pickup);
  router.put('/:id/deliver', middleware, controller.deliver);

  return router;
}

export default createTaskRoutes();
