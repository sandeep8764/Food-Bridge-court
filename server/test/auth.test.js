import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret-key';

const {
  createAuthService
} = await import('../src/services/authService.js');
const {
  createAuthController
} = await import('../src/controllers/authController.js');
const {
  createUserController
} = await import('../src/controllers/userController.js');
const {
  createAuthMiddleware
} = await import('../src/middleware/authMiddleware.js');
const {
  authorizeRoles
} = await import('../src/middleware/roleMiddleware.js');
const {
  createAuthRoutes
} = await import('../src/routes/authRoutes.js');
const {
  createUserRoutes
} = await import('../src/routes/userRoutes.js');

function createInMemoryUserModel() {
  const users = new Map();
  let nextId = 1;

  return {
    async findUserByEmail(email) {
      return [...users.values()].find((user) => user.email === email) || null;
    },
    async findUserById(id) {
      return users.get(Number(id)) || null;
    },
    async createUser(userData) {
      const id = nextId;
      nextId += 1;
      const user = {
        id,
        ...userData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      users.set(id, user);
      return id;
    },
    async updateUserProfile(id, updates) {
      const existing = users.get(Number(id));
      if (!existing) {
        return null;
      }
      const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
      users.set(Number(id), updated);
      return updated;
    },
    seed(user) {
      users.set(user.id, user);
      nextId = Math.max(nextId, user.id + 1);
      return user;
    },
    clear() {
      users.clear();
      nextId = 1;
    }
  };
}

function createTestApp({ authRoutes, userRoutes, authMiddleware, userModel }) {
  const app = express();
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  if (userRoutes) {
    app.use('/api/users', userRoutes);
  }

  app.get('/api/protected/donor', authMiddleware, authorizeRoles('DONOR'), (req, res) => {
    res.json({ success: true, data: { role: req.user.role } });
  });

  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' });
  });

  return app;
}

function createInMemoryOtpStore() {
  const otpEntries = new Map();

  return {
    async create({ phone, otpCode, expiresAt }) {
      otpEntries.set(phone, { phone, otpCode, expiresAt, createdAt: new Date().toISOString(), attempts: 0 });
      return otpEntries.get(phone);
    },
    async findByPhone(phone) {
      const entry = otpEntries.get(phone);
      if (!entry) {
        return null;
      }
      if (new Date(entry.expiresAt).getTime() < Date.now()) {
        otpEntries.delete(phone);
        return null;
      }
      return { ...entry };
    },
    async deleteByPhone(phone) {
      otpEntries.delete(phone);
      return true;
    },
    async updateAttempts(phone, attempts) {
      const entry = otpEntries.get(phone);
      if (!entry) {
        return null;
      }
      entry.attempts = attempts;
      otpEntries.set(phone, entry);
      return entry;
    }
  };
}

test('otp flow is required before registration', async () => {
  const userModel = createInMemoryUserModel();
  const otpStore = createInMemoryOtpStore();
  const authService = createAuthService({
    userModel,
    otpStore,
    jwtSecret: process.env.JWT_SECRET,
    tokenExpiresIn: '7d'
  });
  const authController = createAuthController({ authService });
  const authMiddleware = createAuthMiddleware({ userModel, jwtSecret: process.env.JWT_SECRET });
  const authRoutes = createAuthRoutes({ authController, authMiddleware });
  const app = createTestApp({ authRoutes, userRoutes: [], authMiddleware, userModel });

  const sendOtpResponse = await request(app)
    .post('/api/auth/send-otp')
    .send({ phone: '9876543210', email: 'newuser@example.com' });

  assert.equal(sendOtpResponse.status, 200);
  assert.match(String(sendOtpResponse.body.data.otp), /^\d{6}$/);

  const verifyOtpResponse = await request(app)
    .post('/api/auth/verify-otp')
    .send({ phone: '9876543210', otp: sendOtpResponse.body.data.otp });

  assert.equal(verifyOtpResponse.status, 200);

  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Verified User',
      email: 'newuser@example.com',
      password: 'Password123',
      phone: '9876543210',
      role: 'DONOR',
      organization_name: 'Fresh Food Org',
      address: 'Test Address',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      otp: sendOtpResponse.body.data.otp
    });

  assert.equal(registerResponse.status, 201);
  assert.equal(registerResponse.body.data.user.email, 'newuser@example.com');
});

test('register, login, me, and profile update work with token-based auth', async () => {
  const userModel = createInMemoryUserModel();
  const authService = createAuthService({ userModel, jwtSecret: process.env.JWT_SECRET, tokenExpiresIn: '7d' });
  const authController = createAuthController({ authService });
  const userController = createUserController({ authService });
  const authMiddleware = createAuthMiddleware({ userModel, jwtSecret: process.env.JWT_SECRET });
  const authRoutes = createAuthRoutes({ authController, authMiddleware });
  const userRoutes = createUserRoutes({ userController, authMiddleware });
  const app = createTestApp({ authRoutes, userRoutes, authMiddleware, userModel });

  const otpResponse = await request(app)
    .post('/api/auth/send-otp')
    .send({ phone: '9999999999', email: 'donor@test.com' });

  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Donor',
      email: 'donor@test.com',
      password: 'Password123',
      phone: '9999999999',
      role: 'DONOR',
      organization_name: 'Test Org',
      address: 'Test Address',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      otp: otpResponse.body.data.otp
    });

  assert.equal(registerResponse.status, 201);
  assert.equal(registerResponse.body.success, true);
  assert.equal(registerResponse.body.data.user.email, 'donor@test.com');
  assert.equal(registerResponse.body.data.user.password_hash, undefined);

  const duplicateOtpResponse = await request(app)
    .post('/api/auth/send-otp')
    .send({ phone: '8888888888', email: 'donor@test.com' });

  const duplicateResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Donor 2',
      email: 'donor@test.com',
      password: 'Password123',
      phone: '8888888888',
      role: 'DONOR',
      organization_name: 'Test Org 2',
      address: 'Test Address 2',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      otp: duplicateOtpResponse.body.data.otp
    });

  assert.equal(duplicateResponse.status, 409);

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'donor@test.com', password: 'Password123' });

  assert.equal(loginResponse.status, 200);
  assert.equal(loginResponse.body.data.user.email, 'donor@test.com');
  assert.match(loginResponse.body.data.token, /^[^.]+\.[^.]+\.[^.]+$/);

  const invalidPasswordResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'donor@test.com', password: 'WrongPassword' });

  assert.equal(invalidPasswordResponse.status, 401);

  const meResponse = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${loginResponse.body.data.token}`);

  assert.equal(meResponse.status, 200);
  assert.equal(meResponse.body.data.user.email, 'donor@test.com');

  const profileUpdateResponse = await request(app)
    .put('/api/users/profile')
    .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
    .send({
      name: 'Updated Donor',
      phone: '9000000000',
      organization_name: 'Updated Org',
      address: 'Updated Address',
      city: 'Noida',
      state: 'Uttar Pradesh',
      profile_image: 'https://example.com/profile.png'
    });

  assert.equal(profileUpdateResponse.status, 200);
  assert.equal(profileUpdateResponse.body.data.user.name, 'Updated Donor');
  assert.equal(profileUpdateResponse.body.data.user.profile_image, 'https://example.com/profile.png');
});

test('invalid token is rejected with 401', async () => {
  const userModel = createInMemoryUserModel();
  const authMiddleware = createAuthMiddleware({ userModel, jwtSecret: process.env.JWT_SECRET });
  const app = express();
  app.use(express.json());
  app.get('/protected', authMiddleware, (req, res) => res.json({ success: true }));
  app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' }));

  const response = await request(app)
    .get('/protected')
    .set('Authorization', 'Bearer invalid.token.value');

  assert.equal(response.status, 401);
});

test('role restriction blocks non-donor access', async () => {
  const userModel = createInMemoryUserModel();
  const donor = userModel.seed({
    id: 1,
    name: 'Donor User',
    email: 'donor@example.com',
    password_hash: 'hash',
    phone: '9999999999',
    role: 'DONOR',
    organization_name: 'Org',
    address: 'Address',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    is_active: true
  });
  userModel.seed({
    id: 2,
    name: 'Ngo User',
    email: 'ngo@example.com',
    password_hash: 'hash',
    phone: '8888888888',
    role: 'NGO',
    organization_name: 'Ngo Org',
    address: 'Address',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    is_active: true
  });

  const token = jwt.sign({ userId: 2, role: 'NGO' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const authMiddleware = createAuthMiddleware({ userModel, jwtSecret: process.env.JWT_SECRET });
  const app = express();
  app.use(express.json());
  app.get('/donor-only', authMiddleware, authorizeRoles('DONOR'), (req, res) => res.json({ success: true }));
  app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' }));

  const response = await request(app)
    .get('/donor-only')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 403);
  assert.equal(donor.role, 'DONOR');
});
