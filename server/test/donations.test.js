import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret-key';

const { createAuthMiddleware } = await import('../src/middleware/authMiddleware.js');
const { createDonationService } = await import('../src/services/donationService.js');
const { createDonationController } = await import('../src/controllers/donationController.js');
const { createDonationRoutes } = await import('../src/routes/donationRoutes.js');

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
  let nextId = 1;

  const clone = (value) => JSON.parse(JSON.stringify(value));

  return {
    seed(donation) {
      const id = donation.id || nextId++;
      const record = {
        id,
        donor_id: donation.donor_id,
        food_name: donation.food_name,
        food_category: donation.food_category,
        description: donation.description || null,
        quantity: donation.quantity,
        quantity_unit: donation.quantity_unit,
        estimated_meals: donation.estimated_meals,
        preparation_time: donation.preparation_time || null,
        expiry_time: donation.expiry_time,
        pickup_start_time: donation.pickup_start_time || null,
        pickup_end_time: donation.pickup_end_time || null,
        address: donation.address,
        city: donation.city || null,
        state: donation.state || null,
        latitude: donation.latitude,
        longitude: donation.longitude,
        status: donation.status || 'AVAILABLE',
        image_url: donation.image_url || null,
        created_at: donation.created_at || new Date().toISOString(),
        updated_at: donation.updated_at || new Date().toISOString(),
        donor_name: donation.donor_name || 'Seed Donor',
        donor_email: donation.donor_email || 'donor@test.com',
        donor_phone: donation.donor_phone || '9999999999',
        donor_organization_name: donation.donor_organization_name || 'Seed Org',
        donor_city: donation.donor_city || 'Delhi',
        donor_state: donation.donor_state || 'Delhi',
        claim_id: donation.claim_id || null,
        ngo_id: donation.ngo_id || null,
        claimed_at: donation.claimed_at || null,
        claim_status: donation.claim_status || null
      };
      donations.set(id, record);
      nextId = Math.max(nextId, id + 1);
      return record;
    },
    async createDonation(payload) {
      const id = nextId++;
      this.seed({ id, ...payload });
      return id;
    },
    async findDonationById(id) {
      const donation = donations.get(Number(id));
      return donation ? clone(donation) : null;
    },
    async findDonationDetailsById(id) {
      return this.findDonationById(id);
    },
    async findDonationWithOwner(id) {
      return this.findDonationById(id);
    },
    async updateDonation(id, updates) {
      const current = donations.get(Number(id));
      if (!current) {
        return null;
      }
      const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
      donations.set(Number(id), updated);
      return clone(updated);
    },
    async cancelDonation(id) {
      return this.updateDonation(id, { status: 'CANCELLED' });
    },
    async listDonations(filters = {}) {
      return this._list(filters, null);
    },
    async listDonationsByDonor(donorId, filters = {}) {
      return this._list(filters, donorId);
    },
    _list(filters, donorId) {
      const page = Math.max(Number.parseInt(filters.page || '1', 10), 1);
      const limit = Math.min(Math.max(Number.parseInt(filters.limit || '20', 10), 1), 100);
      const offset = (page - 1) * limit;

      let data = [...donations.values()];
      if (donorId !== null) {
        data = data.filter((donation) => donation.donor_id === donorId);
      }
      if (filters.status) {
        data = data.filter((donation) => donation.status === filters.status);
      }
      if (filters.category) {
        data = data.filter((donation) => donation.food_category === filters.category);
      }
      if (filters.city) {
        data = data.filter((donation) => donation.city === filters.city);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        data = data.filter((donation) => [donation.food_name, donation.description, donation.address].filter(Boolean).some((value) => value.toLowerCase().includes(search)));
      }
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const total = data.length;
      return {
        data: data.slice(offset, offset + limit).map(clone),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }
  };
}

function buildApp() {
  const userModel = createInMemoryUserModel();
  userModel.seed({ id: 1, name: 'Donor One', email: 'donor@test.com', role: 'DONOR', is_active: true });
  userModel.seed({ id: 2, name: 'Donor Two', email: 'donor2@test.com', role: 'DONOR', is_active: true });
  userModel.seed({ id: 3, name: 'Ngo One', email: 'ngo@test.com', role: 'NGO', is_active: true });
  userModel.seed({ id: 4, name: 'Volunteer One', email: 'vol@test.com', role: 'VOLUNTEER', is_active: true });

  const donationModel = createInMemoryDonationModel();
  donationModel.seed({
    id: 1,
    donor_id: 1,
    food_name: 'Veg Thali',
    food_category: 'Cooked Meals',
    description: 'Fresh meal boxes',
    quantity: 25,
    quantity_unit: 'boxes',
    estimated_meals: 75,
    expiry_time: '2026-09-23 10:00:00',
    address: 'Delhi',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.61,
    longitude: 77.21,
    status: 'AVAILABLE',
    created_at: '2026-09-21T10:00:00.000Z'
  });
  donationModel.seed({
    id: 2,
    donor_id: 1,
    food_name: 'Bakery Pack',
    food_category: 'Bakery',
    description: 'Bread and buns',
    quantity: 10,
    quantity_unit: 'packs',
    estimated_meals: 30,
    expiry_time: '2026-09-24 10:00:00',
    address: 'Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    latitude: 28.54,
    longitude: 77.39,
    status: 'AVAILABLE',
    created_at: '2026-09-22T10:00:00.000Z'
  });
  donationModel.seed({
    id: 3,
    donor_id: 1,
    food_name: 'Fruit Pack',
    food_category: 'Fruits',
    quantity: 15,
    quantity_unit: 'kg',
    estimated_meals: 40,
    expiry_time: '2026-09-22 10:00:00',
    address: 'Delhi',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.6,
    longitude: 77.2,
    status: 'DELIVERED',
    created_at: '2026-09-20T10:00:00.000Z'
  });

  const donationService = createDonationService({
    userModel,
    donationModel
  });
  const donationController = createDonationController({ donationService });
  const authMiddleware = createAuthMiddleware({ userModel, jwtSecret: process.env.JWT_SECRET });
  const donationRoutes = createDonationRoutes({ donationController, authMiddleware });

  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    return next();
  });
  app.use('/api/donations', donationRoutes);
  app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' }));

  return {
    app,
    signToken(userId, role) {
      return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    },
    donationModel
  };
}

test('donor can create, view, update, and cancel own donation', async () => {
  const { app, signToken } = buildApp();
  const token = signToken(1, 'DONOR');

  const createResponse = await request(app)
    .post('/api/donations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      food_name: 'Test Meals',
      food_category: 'Cooked Meals',
      description: 'Freshly prepared',
      quantity: 12,
      quantity_unit: 'boxes',
      estimated_meals: 36,
      preparation_time: '2026-09-22T08:00:00',
      expiry_time: '2026-09-22T18:00:00',
      pickup_start_time: '2026-09-22T09:00:00',
      pickup_end_time: '2026-09-22T17:00:00',
      address: 'Delhi',
      city: 'Delhi',
      state: 'Delhi',
      latitude: 28.61,
      longitude: 77.21,
      image_url: 'https://example.com/image.jpg'
    });

  assert.equal(createResponse.status, 201);
  assert.equal(createResponse.body.data.donation.donor_id, 1);

  const listResponse = await request(app)
    .get('/api/donations?page=1&limit=2&status=AVAILABLE&category=Cooked%20Meals&city=Delhi&search=Test')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(listResponse.status, 200);
  assert.equal(listResponse.body.pagination.page, 1);
  assert.ok(listResponse.body.data.length >= 1);

  const detailResponse = await request(app)
    .get('/api/donations/1')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(detailResponse.status, 200);
  assert.equal(detailResponse.body.data.donation.food_name, 'Veg Thali');

  const updateResponse = await request(app)
    .put('/api/donations/1')
    .set('Authorization', `Bearer ${token}`)
    .send({
      food_name: 'Updated Veg Thali',
      food_category: 'Cooked Meals',
      quantity: 30,
      quantity_unit: 'boxes',
      estimated_meals: 90,
      expiry_time: '2026-09-23T10:00:00',
      address: 'Delhi',
      latitude: 28.61,
      longitude: 77.21
    });

  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.data.donation.food_name, 'Updated Veg Thali');

  const cancelResponse = await request(app)
    .delete('/api/donations/1')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(cancelResponse.status, 200);
  assert.equal(cancelResponse.body.data.donation.status, 'CANCELLED');
});

test('donor cannot modify another donor donation or create invalid payloads', async () => {
  const { app, signToken } = buildApp();
  const donorToken = signToken(1, 'DONOR');
  const otherDonorToken = signToken(2, 'DONOR');

  const forbiddenResponse = await request(app)
    .put('/api/donations/1')
    .set('Authorization', `Bearer ${otherDonorToken}`)
    .send({
      food_name: 'Illegal Update',
      food_category: 'Cooked Meals',
      quantity: 5,
      quantity_unit: 'boxes',
      estimated_meals: 10,
      expiry_time: '2026-09-23T10:00:00',
      address: 'Delhi',
      latitude: 28.61,
      longitude: 77.21
    });

  assert.equal(forbiddenResponse.status, 403);

  const invalidDonationResponse = await request(app)
    .post('/api/donations')
    .set('Authorization', `Bearer ${donorToken}`)
    .send({
      food_name: '',
      food_category: 'Cooked Meals'
    });

  assert.equal(invalidDonationResponse.status, 422);
});

test('available donation cannot be overwritten with invalid status flow and donor-only access is enforced', async () => {
  const { app, signToken, donationModel } = buildApp();
  const donorToken = signToken(1, 'DONOR');
  const ngoToken = signToken(3, 'NGO');
  const volunteerToken = signToken(4, 'VOLUNTEER');

  const ngoCreateResponse = await request(app)
    .post('/api/donations')
    .set('Authorization', `Bearer ${ngoToken}`)
    .send({
      food_name: 'Not Allowed',
      food_category: 'Cooked Meals',
      quantity: 10,
      quantity_unit: 'boxes',
      estimated_meals: 20,
      expiry_time: '2026-09-23T10:00:00',
      address: 'Delhi',
      latitude: 28.61,
      longitude: 77.21
    });

  assert.equal(ngoCreateResponse.status, 403);

  donationModel.seed({
    id: 10,
    donor_id: 1,
    food_name: 'Locked Donation',
    food_category: 'Bakery',
    quantity: 10,
    quantity_unit: 'packs',
    estimated_meals: 20,
    expiry_time: '2026-09-24 10:00:00',
    address: 'Delhi',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.61,
    longitude: 77.21,
    status: 'DELIVERED'
  });

  const invalidUpdateResponse = await request(app)
    .put('/api/donations/10')
    .set('Authorization', `Bearer ${donorToken}`)
    .send({
      food_name: 'Should Fail',
      food_category: 'Bakery',
      quantity: 12,
      quantity_unit: 'packs',
      estimated_meals: 24,
      expiry_time: '2026-09-24T10:00:00',
      address: 'Delhi',
      latitude: 28.61,
      longitude: 77.21
    });

  assert.equal(invalidUpdateResponse.status, 409);

  const volunteerListResponse = await request(app)
    .get('/api/donations?page=1&limit=1')
    .set('Authorization', `Bearer ${volunteerToken}`);

  assert.equal(volunteerListResponse.status, 200);
});
