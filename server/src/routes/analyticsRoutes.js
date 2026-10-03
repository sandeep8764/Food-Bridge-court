import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

export function createAnalyticsRoutes(dependencies = {}) {
  const controller = dependencies.analyticsController || analyticsController;
  const middleware = dependencies.authMiddleware || authMiddleware;
  const roles = dependencies.authorizeRoles || authorizeRoles;

  const router = Router();

  router.get('/leaderboard', controller.leaderboard);
  router.get('/overview', middleware, roles('ADMIN', 'NGO', 'SHELTER', 'DONOR', 'VOLUNTEER'), controller.overview);
  router.get('/monthly', middleware, roles('ADMIN', 'NGO', 'SHELTER', 'DONOR', 'VOLUNTEER'), controller.monthly);
  router.get('/categories', middleware, roles('ADMIN', 'NGO', 'SHELTER', 'DONOR', 'VOLUNTEER'), controller.categories);
  router.get('/status', middleware, roles('ADMIN', 'NGO', 'SHELTER', 'DONOR', 'VOLUNTEER'), controller.status);
  router.get('/donor', middleware, roles('DONOR'), controller.donor);
  router.get('/admin', middleware, roles('ADMIN'), controller.admin);
  router.get('/ngo', middleware, roles('NGO', 'SHELTER', 'ADMIN'), controller.ngo);

  return router;
}

export default createAnalyticsRoutes();