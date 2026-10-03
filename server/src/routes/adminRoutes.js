import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { adminController } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const userStatusValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('is_active').isBoolean().withMessage('is_active must be a boolean')
];

const donationStatusValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid donation ID is required'),
  body('status').isIn(['AVAILABLE', 'CANCELLED', 'EXPIRED']).withMessage('Status must be AVAILABLE, CANCELLED, or EXPIRED')
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

export function createAdminRoutes(dependencies = {}) {
  const controller = dependencies.adminController || adminController;
  const middleware = dependencies.authMiddleware || authMiddleware;
  const roles = dependencies.authorizeRoles || authorizeRoles;

  const router = Router();

  // All admin routes require ADMIN role
  router.use(middleware, roles('ADMIN'));

  // Dashboard & Analytics
  router.get('/dashboard', controller.getDashboard);
  router.get('/analytics', controller.getAnalytics);

  // User Management
  router.get('/users', paginationValidation, validateRequest, controller.listUsers);
  router.put('/users/:id/status', userStatusValidation, validateRequest, controller.updateUserStatus);

  // Donation Management
  router.get('/donations', paginationValidation, validateRequest, controller.listDonations);
  router.get('/donations/:id', param('id').isInt({ min: 1 }), validateRequest, controller.getDonationDetails);
  router.put('/donations/:id/status', donationStatusValidation, validateRequest, controller.updateDonationStatus);

  // Audit Logs
  router.get('/audit-logs', paginationValidation, validateRequest, controller.listAuditLogs);

  return router;
}

export default createAdminRoutes();
