import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const allowedPublicRoles = ['DONOR', 'NGO', 'SHELTER', 'VOLUNTEER'];

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('role').trim().isIn(allowedPublicRoles).withMessage('Role must be DONOR, NGO, SHELTER, or VOLUNTEER'),
  body('organization_name').trim().notEmpty().withMessage('Organization name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('country').trim().optional({ nullable: true, checkFalsy: true }).isLength({ min: 2 }).withMessage('Country is required')
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

export function createAuthRoutes(dependencies = {}) {
  const controller = dependencies.authController || authController;
  const middleware = dependencies.authMiddleware || authMiddleware;

  const router = Router();

  router.post('/register', registerValidation, validateRequest, controller.register);
  router.post('/login', loginValidation, validateRequest, controller.login);
  router.get('/me', middleware, controller.me);
  router.post('/logout', middleware, controller.logout);

  return router;
}

export default createAuthRoutes();
