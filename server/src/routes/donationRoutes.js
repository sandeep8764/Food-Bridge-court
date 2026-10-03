import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { donationController } from '../controllers/donationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const donationValidation = [
  body('food_name').trim().notEmpty().withMessage('Food name is required'),
  body('food_category').trim().notEmpty().withMessage('Food category is required'),
  body('quantity').notEmpty().withMessage('Quantity is required'),
  body('quantity_unit').trim().notEmpty().withMessage('Quantity unit is required'),
  body('estimated_meals').notEmpty().withMessage('Estimated meals is required'),
  body('expiry_time').notEmpty().withMessage('Expiry time is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('latitude').optional({ nullable: true, checkFalsy: true }).isFloat().withMessage('Latitude must be a valid number'),
  body('longitude').optional({ nullable: true, checkFalsy: true }).isFloat().withMessage('Longitude must be a valid number')
];

const nearbyValidation = [
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  query('radius').optional().custom((value) => [1, 5, 10, 20, 50].includes(Number(value))).withMessage('Radius must be one of 1, 5, 10, 20, or 50 km'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

export function createDonationRoutes(dependencies = {}) {
  const controller = dependencies.donationController || donationController;
  const middleware = dependencies.authMiddleware || authMiddleware;
  const roleChecker = dependencies.authorizeRoles || authorizeRoles;

  const router = Router();

  router.post('/', middleware, roleChecker('DONOR'), donationValidation, validateRequest, controller.create);
  router.get('/', middleware, controller.list);
  router.get('/claims', middleware, roleChecker('NGO', 'SHELTER', 'ADMIN'), controller.listClaims);
  router.get('/nearby', middleware, roleChecker('NGO', 'SHELTER', 'VOLUNTEER', 'ADMIN'), nearbyValidation, validateRequest, controller.nearby);
  router.get('/donor/dashboard', middleware, roleChecker('DONOR'), controller.donorDashboard);
  router.get('/:id', middleware, param('id').isInt({ min: 1 }), validateRequest, controller.details);
  router.post('/:id/claim', middleware, roleChecker('NGO', 'SHELTER', 'ADMIN'), param('id').isInt({ min: 1 }), validateRequest, controller.claim);
  router.put('/:id', middleware, roleChecker('DONOR'), donationValidation, validateRequest, controller.update);
  router.delete('/:id', middleware, roleChecker('DONOR'), param('id').isInt({ min: 1 }), validateRequest, controller.remove);

  return router;
}

export default createDonationRoutes();
