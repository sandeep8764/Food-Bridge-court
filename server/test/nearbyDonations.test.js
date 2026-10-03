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
        donor_id: donation.donor_id || 1,
        food_name: donation.food_name,
        food_category: donation.food_category,
        description: donation.description || null,
        quantity: donation.quantity,
        quantity_unit: donation.quantity_unit || 'kg',
        estimated_meals: donation.estimated_meals,
        preparation_time: donation.preparation_time || null,
        expiry_time: donation.expiry_time,
        pickup_start_time: donation.pickup_start_time || null,
        pickup_end_time: donation.pickup_end_time || null,
        address: donation.address || 'Delhi',
        city: donation.city || 'Delhi',
        state: donation.state || 'Delhi',
        latitude: donation.latitude,
        longitude: donation.longitude,
        status: donation.status || 'AVAILABLE',
        image_url: donation.image_url || null,
        created_at: donation.created_at || new Date().toISOString(),
        updated_at: donation.updated_at || new Date().toISOString()
      };
      donations.set(id, record);
      nextId = Math.max(nextId, id + 1);
      return record;
    },
    async findNearbyDonations({ latitude, longitude, radiusKm, page, limit }) {
      const distanceKm = (donation) => haversine(latitude, longitude, Number(donation.latitude), Number(donation.longitude));
      const now = new Date();

      const filtered = [...donations.values()]
        .filter((donation) => donation.status === 'AVAILABLE')
        .filter((donation) => new Date(donation.expiry_time) > now)
        .map((donation) => ({ ...clone(donation), distance_km: Number(distanceKm(donation).toFixed(2)) }))
        .filter((donation) => donation.distance_km <= radiusKm)
        .sort((a, b) => new Date(a.expiry_time) - new Date(b.expiry_time) || a.distance_km - b.distance_km);

      const total = filtered.length;
      const offset = (page - 1) * limit;

      return {
        data: filtered.slice(offset, offset + limit),
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

function haversine(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const toRadians = (value) => (value * Math.PI) / 180;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function buildApp() {
  const userModel = createInMemoryUserModel();
  userModel.seed({ id: 1, name: 'Ngo User', email: 'ngo@test.com', role: 'NGO', is_active: true });
  userModel.seed({ id: 2, name: 'Volunteer User', email: 'vol@test.com', role: 'VOLUNTEER', is_active: true });
  const donationModel = createInMemoryDonationModel();

  const now = Date.now();
  const futureHour = (hours) => new Date(now + hours * 60 * 60 * 1000).toISOString();
  const pastHour = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString();

  donationModel.seed({
    id: 1,
    food_name: 'Soon Expiring Meal',
    food_category: 'Cooked Meals',
    quantity: 20,
    quantity_unit: 'boxes',
    estimated_meals: 60,
    expiry_time: futureHour(24),
    address: 'Delhi',
    latitude: 28.615,
    longitude: 77.21,
    status: 'AVAILABLE'
  });

  donationModel.seed({
    id: 2,
    food_name: 'Farther But Urgent Meal',
    food_category: 'Bakery',
    quantity: 30,
    quantity_unit: 'packs',
    estimated_meals: 90,
    expiry_time: futureHour(12),
    address: 'Noida',
    latitude: 28.70,
    longitude: 77.30,
    status: 'AVAILABLE'
  });

  donationModel.seed({
    id: 3,
    food_name: 'Expired Meal',
    food_category: 'Fruits',
    quantity: 10,
    quantity_unit: 'kg',
    estimated_meals: 20,
    expiry_time: pastHour(24),
    address: 'Delhi',
    latitude: 28.614,
    longitude: 77.209,
    status: 'AVAILABLE'
  });

  for (let index = 4; index <= 1003; index += 1) {
    donationModel.seed({
      id: index,
      food_name: `Seed Donation ${index}`,
      food_category: 'Cooked Meals',
      quantity: 10,
      quantity_unit: 'boxes',
      estimated_meals: 30,
      expiry_time: futureHour(48 + (index % 24)),
      address: 'Delhi',
      latitude: 28.60 + (index % 20) * 0.001,
      longitude: 77.20 + (index % 20) * 0.001,
      status: 'AVAILABLE'
    });
  }

  const donationService = createDonationService({ userModel, donationModel });
  const donationController = createDonationController({ donationService });
  const authMiddleware = createAuthMiddleware({ userModel, jwtSecret: process.env.JWT_SECRET });
  const donationRoutes = createDonationRoutes({ donationController, authMiddleware });

  const app = express();
  app.use(express.json());
  app.use('/api/donations', donationRoutes);
  app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' }));

  return {
    app,
    signToken(userId, role) {
      return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    }
  };
}

test('nearby search returns urgent donations first and includes distances', async () => {
  const { app, signToken } = buildApp();
  const token = signToken(1, 'NGO');

  const response = await request(app)
    .get('/api/donations/nearby?latitude=28.6139&longitude=77.2090&radius=20&page=1&limit=10')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.ok(response.body.data.length > 0);
  assert.equal(response.body.data[0].food_name, 'Farther But Urgent Meal');
  assert.ok(typeof response.body.data[0].distance_km === 'number');
  assert.equal(response.body.data.some((donation) => donation.food_name === 'Expired Meal'), false);
});

test('different radius changes the number of nearby results', async () => {
  const { app, signToken } = buildApp();
  const token = signToken(2, 'VOLUNTEER');

  const smallRadius = await request(app)
    .get('/api/donations/nearby?latitude=28.6139&longitude=77.2090&radius=1&page=1&limit=10')
    .set('Authorization', `Bearer ${token}`);

  const largerRadius = await request(app)
    .get('/api/donations/nearby?latitude=28.6139&longitude=77.2090&radius=20&page=1&limit=10')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(smallRadius.status, 200);
  assert.equal(largerRadius.status, 200);
  assert.ok(largerRadius.body.data.length >= smallRadius.body.data.length);
});

test('nearby search validates invalid coordinates and radius', async () => {
  const { app, signToken } = buildApp();
  const token = signToken(1, 'NGO');

  const invalidCoordinates = await request(app)
    .get('/api/donations/nearby?latitude=200&longitude=77.2090&radius=10')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(invalidCoordinates.status, 422);

  const invalidRadius = await request(app)
    .get('/api/donations/nearby?latitude=28.6139&longitude=77.2090&radius=3')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(invalidRadius.status, 422);
});

test('nearby search supports pagination on a large dataset', async () => {
  const { app, signToken } = buildApp();
  const token = signToken(2, 'VOLUNTEER');

  const pageOne = await request(app)
    .get('/api/donations/nearby?latitude=28.6139&longitude=77.2090&radius=50&page=1&limit=10')
    .set('Authorization', `Bearer ${token}`);

  const pageTwo = await request(app)
    .get('/api/donations/nearby?latitude=28.6139&longitude=77.2090&radius=50&page=2&limit=10')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(pageOne.status, 200);
  assert.equal(pageTwo.status, 200);
  assert.equal(pageOne.body.data.length, 10);
  assert.equal(pageTwo.body.data.length, 10);
  assert.ok(pageOne.body.pagination.total > 10);
});

test('nearby search returns no results outside radius', async () => {
  const { app, signToken } = buildApp();
  const token = signToken(1, 'NGO');

  const response = await request(app)
    .get('/api/donations/nearby?latitude=12.9716&longitude=77.5946&radius=1&page=1&limit=10')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.length, 0);
  assert.equal(response.body.pagination.total, 0);
});