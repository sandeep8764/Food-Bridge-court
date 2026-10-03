import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret-key';

const { createAuthMiddleware } = await import('../src/middleware/authMiddleware.js');
const { createAnalyticsService } = await import('../src/services/analyticsService.js');
const { createAnalyticsController } = await import('../src/controllers/analyticsController.js');
const { createAnalyticsRoutes } = await import('../src/routes/analyticsRoutes.js');

function createAnalyticsRepository() {
  return {
    async getOverviewAnalytics() {
      return {
        total_donations: 10,
        available_donations: 2,
        claimed_donations: 1,
        delivered_donations: 5,
        expired_donations: 1,
        cancelled_donations: 1,
        total_meals_saved: 300,
        total_co2_offset: 750
      };
    },
    async getMonthlyAnalytics() {
      return [
        { month_start: '2026-01-01', month_name: 'January', donations: 2, meals: 20, deliveries: 1 },
        { month_start: '2026-02-01', month_name: 'February', donations: 3, meals: 45, deliveries: 2 }
      ];
    },
    async getCategoryAnalytics() {
      return [
        { food_category: 'Cooked Meals', donation_count: 6, meals_saved: 150 },
        { food_category: 'Bakery', donation_count: 4, meals_saved: 90 }
      ];
    },
    async getStatusAnalytics() {
      return [
        { status: 'AVAILABLE', count: 2 },
        { status: 'DELIVERED', count: 5 }
      ];
    },
    async getDonorAnalyticsById() {
      return { total_donations: 4, meals_saved: 120, delivered_donations: 3, co2_offset: 300 };
    },
    async getDonorAnalytics() {
      return [
        { donor_id: 1, donor_name: 'Donor One', donor_email: 'donor@test.com', donation_count: 4, meals_saved: 120, successful_deliveries: 3 },
        { donor_id: 2, donor_name: 'Donor Two', donor_email: 'donor2@test.com', donation_count: 3, meals_saved: 90, successful_deliveries: 2 }
      ];
    },
    async getNgAnalyticsByOrg() {
      return { donations_claimed: 3, meals_received: 85, successful_deliveries: 2 };
    }
  };
}

function createUserModel() {
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

function buildApp(role) {
  const userModel = createUserModel();
  userModel.seed({ id: 1, name: 'User', email: 'user@test.com', role, is_active: true });

  const analyticsService = createAnalyticsService({ analyticsModel: createAnalyticsRepository() });
  const analyticsController = createAnalyticsController({ analyticsService });
  const authMiddleware = createAuthMiddleware({ userModel, jwtSecret: process.env.JWT_SECRET });
  const analyticsRoutes = createAnalyticsRoutes({ analyticsController, authMiddleware });

  const app = express();
  app.use(express.json());
  app.use('/api/analytics', analyticsRoutes);
  app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' }));

  return {
    app,
    signToken() {
      return jwt.sign({ userId: 1, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    }
  };
}

test('admin analytics overview returns aggregate values', async () => {
  const { app, signToken } = buildApp('ADMIN');

  const response = await request(app)
    .get('/api/analytics/overview')
    .set('Authorization', `Bearer ${signToken()}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.total_donations, 10);
  assert.equal(response.body.data.total_meals_saved, 300);
  assert.equal(response.body.data.total_co2_offset, 750);
});

test('monthly analytics and category analytics are returned for admin', async () => {
  const { app, signToken } = buildApp('ADMIN');

  const monthly = await request(app)
    .get('/api/analytics/monthly')
    .set('Authorization', `Bearer ${signToken()}`);

  const categories = await request(app)
    .get('/api/analytics/categories')
    .set('Authorization', `Bearer ${signToken()}`);

  assert.equal(monthly.status, 200);
  assert.equal(monthly.body.data.length, 2);
  assert.equal(monthly.body.data[0].month_name, 'January');
  assert.equal(categories.status, 200);
  assert.equal(categories.body.data[0].food_category, 'Cooked Meals');
});

test('status analytics returns all tracked statuses', async () => {
  const { app, signToken } = buildApp('ADMIN');

  const response = await request(app)
    .get('/api/analytics/status')
    .set('Authorization', `Bearer ${signToken()}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data[0].status, 'AVAILABLE');
});

test('donor analytics are restricted to donor role', async () => {
  const donorApp = buildApp('DONOR');
  const donorResponse = await request(donorApp.app)
    .get('/api/analytics/donor')
    .set('Authorization', `Bearer ${donorApp.signToken()}`);

  assert.equal(donorResponse.status, 200);
  assert.equal(donorResponse.body.data.total_donations, 4);

  const adminApp = buildApp('ADMIN');
  const forbiddenResponse = await request(adminApp.app)
    .get('/api/analytics/donor')
    .set('Authorization', `Bearer ${adminApp.signToken()}`);

  assert.equal(forbiddenResponse.status, 403);
});

test('ngo analytics are returned only for ngo roles', async () => {
  const ngoApp = buildApp('NGO');
  const response = await request(ngoApp.app)
    .get('/api/analytics/ngo')
    .set('Authorization', `Bearer ${ngoApp.signToken()}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.donations_claimed, 3);
});