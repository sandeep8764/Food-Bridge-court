import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';
import { sanitizeUser } from '../utils/userSerializer.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile
} from '../models/userModel.js';

const PUBLIC_ROLES = new Set(['DONOR', 'NGO', 'SHELTER', 'VOLUNTEER']);

function createToken(user, jwtSecret, expiresIn) {
  return jwt.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn });
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function pickProfileUpdates(input) {
  return {
    name: input.name,
    phone: input.phone,
    organization_name: input.organization_name,
    address: input.address,
    city: input.city,
    state: input.state,
    profile_image: input.profile_image
  };
}

export function createAuthService(dependencies = {}) {
  const repository = dependencies.userModel || {
    findUserByEmail,
    findUserById,
    createUser,
    updateUserProfile
  };
  const getJwtSecret = () => dependencies.jwtSecret || process.env.JWT_SECRET || 'foodbridge_default_secure_jwt_secret_2026';
  const tokenExpiresIn = dependencies.tokenExpiresIn || '7d';
  const passwordHasher = dependencies.passwordHasher || bcrypt;

  return {
    async register(payload) {
      const email = normalizeEmail(payload.email);
      const role = String(payload.role || '').toUpperCase();

      if (!PUBLIC_ROLES.has(role)) {
        throw new AppError('Invalid role for public registration', 400);
      }

      const existingUser = await repository.findUserByEmail(email);
      if (existingUser) {
        throw new AppError('Email already registered', 409);
      }

      const passwordHash = await passwordHasher.hash(payload.password, 10);
      const userId = await repository.createUser({
        name: payload.name.trim(),
        email,
        password_hash: passwordHash,
        phone: payload.phone?.trim() || null,
        role,
        organization_name: payload.organization_name?.trim() || null,
        address: payload.address?.trim() || null,
        city: payload.city?.trim() || null,
        state: payload.state?.trim() || null,
        country: payload.country?.trim() || 'India'
      });

      const createdUser = await repository.findUserById(userId);
      const token = createToken(createdUser, getJwtSecret(), tokenExpiresIn);

      return {
        user: sanitizeUser(createdUser),
        token
      };
    },

    async login(payload) {
      const email = normalizeEmail(payload.email);
      const user = await repository.findUserByEmail(email);

      if (!user || !user.password_hash) {
        throw new AppError('Invalid email or password', 401);
      }

      const isPasswordValid = await passwordHasher.compare(payload.password, user.password_hash);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = createToken(user, getJwtSecret(), tokenExpiresIn);

      return {
        user: sanitizeUser(user),
        token
      };
    },

    async getCurrentUser(userId) {
      const user = await repository.findUserById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      return sanitizeUser(user);
    },

    async updateProfile(userId, payload) {
      const updates = pickProfileUpdates(payload);
      const hasUpdates = Object.values(updates).some((value) => value !== undefined);

      if (!hasUpdates) {
        throw new AppError('At least one profile field must be provided', 400);
      }

      const updatedUser = await repository.updateUserProfile(userId, updates);
      if (!updatedUser) {
        throw new AppError('User not found', 404);
      }

      return sanitizeUser(updatedUser);
    },

    logout() {
      return { message: 'Logged out successfully' };
    }
  };
}

export const authService = createAuthService();
