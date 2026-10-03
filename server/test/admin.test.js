import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-admin-secret-key';

const { createAuthMiddleware } = await import('../src/middleware/authMiddleware.js');
const { createAdminService } = await import('../src/services/adminService.js');
const { createAdminController } = await import('../src/controllers/adminController.js');
const { createAdminRoutes } = await import('../src/routes/adminRoutes.js');
const { createDonationService } = await import('../src/services/donationService.js');
const { createDonationController } = await import('../src/controllers/donationController.js');
const { createDonationRoutes } = await import('../src/routes/donationRoutes.js');
const { createAnalyticsService } = await import('../src/services/analyticsService.js');
const { createAnalyticsController } = await import('../src/controllers/analyticsController.js');
const { createAnalyticsRoutes } = await import('../src/routes/analyticsRoutes.js');

function createInMemoryDatabase() {
  const users = new Map();
  const donations = new Map();
  const claims = new Map();
  const auditLogs = [];
  let nextUserId = 1;
  let nextDonationId = 1;
  let nextClaimId = 1;
  let nextAuditId = 1;

  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  const userModel = {
    seed(user) {
      const id = user.id || nextUserId++;
      const record = { id, is_active: true, ...user };
      users.set(id, record);
      nextUserId = Math.max(nextUserId, id + 1);
      return record;
    },
    async findUserById(id) {
      return users.get(Number(id)) || null;
    },
    async updateUserActiveStatus(id, isActive) {
      const user = users.get(Number(id));
      if (!user) return null;
      user.is_active = Boolean(isActive);
      return clone(user);
    },
    async listUsers({ page = 1, limit = 20, role, is_active, search } = {}) {
      let list = [...users.values()];
      if (role) list = list.filter((u) => u.role === role);
      if (is_active !== undefined) list = list.filter((u) => u.is_active === (is_active === 'true' || is_active === true));
      if (search) {
        const s = search.toLowerCase();
        list = list.filter((u) => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s));
      }
      const total = list.length;
      const offset = (page - 1) * limit;
      return {
        data: list.slice(offset, offset + limit).map(clone),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      };
    },
    async getUserRoleCounts() {
      const all = [...users.values()];
      return {
        total_users: all.length,
        total_donors: all.filter((u) => u.role === 'DONOR').length,
        total_ngos: all.filter((u) => u.role === 'NGO').length,
        total_shelters: all.filter((u) => u.role === 'SHELTER').length,
        total_volunteers: all.filter((u) => u.role === 'VOLUNTEER').length,
        total_admins: all.filter((u) => u.role === 'ADMIN').length,
        active_users: all.filter((u) => u.is_active).length,
        inactive_users: all.filter((u) => !u.is_active).length
      };
    },
    async getUserRoleDistribution() {
      const all = [...users.values()];
      const counts = {};
      all.forEach((u) => { counts[u.role] = (counts[u.role] || 0) + 1; });
      return Object.entries(counts).map(([role, count]) => ({ role, count }));
    }
  };

  const donationModel = {
    seed(donation) {
      const id = donation.id || nextDonationId++;
      const record = { id, status: 'AVAILABLE', estimated_meals: 50, ...donation };
      donations.set(id, record);
      nextDonationId = Math.max(nextDonationId, id + 1);
      return record;
    },
    async findDonationById(id) {
      return donations.get(Number(id)) || null;
    },
    async findDonationDetailsById(id) {
      const d = donations.get(Number(id));
      if (!d) return null;
      const owner = users.get(Number(d.donor_id)) || {};
      return { ...clone(d), donor_name: owner.name, donor_email: owner.email, donor_id_user: owner.id };
    },
    async findDonationWithOwner(id) {
      return this.findDonationDetailsById(id);
    },
    async updateDonation(id, updates) {
      const d = donations.get(Number(id));
      if (!d) return null;
      Object.assign(d, updates);
      return clone(d);
    },
    async cancelDonation(id) {
      return this.updateDonation(id, { status: 'CANCELLED' });
    },
    async createDonationClaim({ donation_id, ngo_id }) {
      const id = nextClaimId++;
      claims.set(id, { id, donation_id, ngo_id, claimed_at: new Date().toISOString(), status: 'ACTIVE' });
      return id;
    },
    async findClaimByDonationId(donationId) {
      return [...claims.values()].find((c) => c.donation_id === Number(donationId) && c.status === 'ACTIVE') || null;
    },
    async listClaimsByNgo(ngoId, { page = 1, limit = 20 } = {}) {
      const list = [...claims.values()].filter((c) => c.ngo_id === Number(ngoId));
      const total = list.length;
      return {
        data: list.slice((page - 1) * limit, page * limit),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      };
    },
    async listDonations(filters = {}) {
      let list = [...donations.values()];
      if (filters.status) list = list.filter((d) => d.status === filters.status);
      if (filters.category) list = list.filter((d) => d.food_category === filters.category);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        list = list.filter((d) => d.food_name?.toLowerCase().includes(s));
      }
      const page = Math.max(Number(filters.page || 1), 1);
      const limit = Math.max(Number(filters.limit || 20), 1);
      const total = list.length;
      return {
        data: list.slice((page - 1) * limit, page * limit).map(clone),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      };
    },
    async listDonationsByDonor(donorId, filters = {}) {
      return this.listDonations({ ...filters, donor_id: donorId });
    }
  };

  const auditLogModel = {
    async createAuditLog(log) {
      const id = nextAuditId++;
      const record = { id, created_at: new Date().toISOString(), ...log };
      auditLogs.push(record);
      return id;
    },
    async listAuditLogs({ page = 1, limit = 20 } = {}) {
      const total = auditLogs.length;
      return {
        data: auditLogs.slice((page - 1) * limit, page * limit).map(clone),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      };
    }
  };

  const analyticsModel = {
    async getOverviewAnalytics() {
      const all = [...donations.values()];
      return {
        total_donations: all.length,
        available_donations: all.filter((d) => d.status === 'AVAILABLE').length,
        claimed_donations: all.filter((d) => d.status === 'CLAIMED').length,
        delivered_donations: all.filter((d) => d.status === 'DELIVERED').length,
        expired_donations: all.filter((d) => d.status === 'EXPIRED').length,
        cancelled_donations: all.filter((d) => d.status === 'CANCELLED').length,
        total_meals_saved: all.filter((d) => d.status === 'DELIVERED').reduce((sum, d) => sum + (d.estimated_meals || 0), 0),
        total_co2_offset: all.filter((d) => d.status === 'DELIVERED').reduce((sum, d) => sum + (d.estimated_meals || 0) * 2.5, 0)
      };
    },
    async getMonthlyAnalytics() {
      return [
        { month_start: '2026-09-01', month_name: 'Sep 2026', donations: 10, meals: 250, deliveries: 8 }
      ];
    },
    async getCategoryAnalytics() {
      return [
        { food_category: 'Cooked Meals', donation_count: 5, meals_saved: 150 }
      ];
    },
    async getStatusAnalytics() {
      return [
        { status: 'AVAILABLE', count: 3 },
        { status: 'DELIVERED', count: 7 }
      ];
    },
    async getDonorAnalytics() {
      return [];
    },
    async getLeaderboard(limit = 10) {
      return [
        { rank: 1, id: 1, name: 'Spice Garden', organization_name: 'Spice Garden Resto', total_donations: 50, total_meals_saved: 1200, completed_deliveries: 45, co2_offset_kg: 3000 }
      ].slice(0, limit);
    }
  };

  return { userModel, donationModel, auditLogModel, analyticsModel };
}

function buildTestApp() {
  const db = createInMemoryDatabase();

  // Seed sample users
  db.userModel.seed({ id: 1, name: 'Admin User', email: 'admin@test.com', role: 'ADMIN' });
  db.userModel.seed({ id: 2, name: 'Donor User', email: 'donor@test.com', role: 'DONOR' });
  db.userModel.seed({ id: 3, name: 'NGO User', email: 'ngo@test.com', role: 'NGO' });
  db.userModel.seed({ id: 4, name: 'Volunteer User', email: 'vol@test.com', role: 'VOLUNTEER' });

  // Seed sample donations
  db.donationModel.seed({
    id: 1,
    donor_id: 2,
    food_name: 'Hot Biryani Packs',
    food_category: 'Cooked Meals',
    status: 'AVAILABLE',
    expiry_time: new Date(Date.now() + 86400000).toISOString(),
    estimated_meals: 40
  });

  db.donationModel.seed({
    id: 2,
    donor_id: 2,
    food_name: 'Delivered Food Pack',
    food_category: 'Cooked Meals',
    status: 'DELIVERED',
    expiry_time: new Date(Date.now() + 86400000).toISOString(),
    estimated_meals: 60
  });

  const authMiddleware = createAuthMiddleware({ userModel: db.userModel, jwtSecret: process.env.JWT_SECRET });

  const adminService = createAdminService(db);
  const adminController = createAdminController({ adminService });
  const adminRoutes = createAdminRoutes({ adminController, authMiddleware });

  const donationService = createDonationService({ userModel: db.userModel, donationModel: db.donationModel, db: {} });
  const donationController = createDonationController({ donationService });
  const donationRoutes = createDonationRoutes({ donationController, authMiddleware });

  const analyticsService = createAnalyticsService({ analyticsModel: db.analyticsModel });
  const analyticsController = createAnalyticsController({ analyticsService });
  const analyticsRoutes = createAnalyticsRoutes({ analyticsController, authMiddleware });

  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Error' });
  });

  const signToken = (userId, role) => jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1d' });

  return { app, signToken, db };
}

test('Admin dashboard returns full summary of users, donations, and impact', async () => {
  const { app, signToken } = buildTestApp();
  const token = signToken(1, 'ADMIN');

  const res = await request(app)
    .get('/api/admin/dashboard')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.total_users, 4);
  assert.equal(res.body.data.total_donors, 1);
  assert.equal(res.body.data.total_ngos, 1);
  assert.equal(res.body.data.total_donations, 2);
  assert.equal(res.body.data.delivered_donations, 1);
  assert.equal(res.body.data.total_meals_saved, 60);
});

test('Non-admin users cannot access admin endpoints', async () => {
  const { app, signToken } = buildTestApp();
  const token = signToken(2, 'DONOR');

  const res = await request(app)
    .get('/api/admin/dashboard')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test('Admin can list, search, and filter users', async () => {
  const { app, signToken } = buildTestApp();
  const token = signToken(1, 'ADMIN');

  const res = await request(app)
    .get('/api/admin/users?role=DONOR')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.data.length, 1);
  assert.equal(res.body.data[0].role, 'DONOR');
});

test('Admin can deactivate and reactivate users with audit logs', async () => {
  const { app, signToken } = buildTestApp();
  const token = signToken(1, 'ADMIN');

  // Deactivate user 2
  const deactRes = await request(app)
    .put('/api/admin/users/2/status')
    .set('Authorization', `Bearer ${token}`)
    .send({ is_active: false, reason: 'Policy violation' });

  assert.equal(deactRes.status, 200);
  assert.equal(deactRes.body.data.user.is_active, false);

  // Check audit log
  const logRes = await request(app)
    .get('/api/admin/audit-logs')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(logRes.status, 200);
  assert.equal(logRes.body.data.length, 1);
  assert.equal(logRes.body.data[0].action, 'USER_DEACTIVATED');
});

test('Admin cannot deactivate their own account', async () => {
  const { app, signToken } = buildTestApp();
  const token = signToken(1, 'ADMIN');

  const res = await request(app)
    .put('/api/admin/users/1/status')
    .set('Authorization', `Bearer ${token}`)
    .send({ is_active: false });

  assert.equal(res.status, 400);
  assert.match(res.body.message, /cannot deactivate their own account/i);
});

test('NGO can claim an available donation and status updates to CLAIMED', async () => {
  const { app, signToken } = buildTestApp();
  const token = signToken(3, 'NGO');

  const res = await request(app)
    .post('/api/donations/1/claim')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.donation.status, 'CLAIMED');

  // Second claim should fail with 409
  const repeatRes = await request(app)
    .post('/api/donations/1/claim')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(repeatRes.status, 409);
});

test('Leaderboard endpoint returns top ranking donors', async () => {
  const { app } = buildTestApp();

  const res = await request(app).get('/api/analytics/leaderboard');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.length > 0);
  assert.equal(res.body.data[0].rank, 1);
  assert.equal(res.body.data[0].name, 'Spice Garden');
});
