import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const profileValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('phone').optional().trim().isLength({ min: 6 }).withMessage('Phone is invalid'),
  body('organization_name').optional().trim().notEmpty().withMessage('Organization name cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('profile_image').optional().trim().isURL().withMessage('Profile image must be a valid URL')
];

export function createUserRoutes(dependencies = {}) {
  const controller = dependencies.userController || userController;
  const middleware = dependencies.authMiddleware || authMiddleware;

  const router = Router();

  router.get('/profile', middleware, controller.getProfile);
  router.put('/profile', middleware, profileValidation, validateRequest, controller.updateProfile);

  return router;
}

export default createUserRoutes();
