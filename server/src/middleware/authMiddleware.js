import jwt from 'jsonwebtoken';
import { sanitizeUser } from '../utils/userSerializer.js';
import { AppError } from '../utils/appError.js';
import { findUserById } from '../models/userModel.js';


function unauthorizedResponse(res, message = 'Unauthorized') {
  return res.status(401).json({ success: false, message });
}

export function createAuthMiddleware(dependencies = {}) {
  const repository = dependencies.userModel || { findUserById };
  const jwtSecret = dependencies.jwtSecret || process.env.JWT_SECRET;
  const verifyToken = dependencies.verifyToken || jwt.verify;

  // if (!jwtSecret) {
  //   throw new AppError('JWT secret is not configured', 500);
  // }

  return async function authMiddleware(req, res, next) {
    try {
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return unauthorizedResponse(res);
      }

      const token = authorizationHeader.slice(7).trim();
      const secret = dependencies.jwtSecret || process.env.JWT_SECRET || 'foodbridge_default_secure_jwt_secret_2026';
      let decoded;

      try {
        decoded = verifyToken(token, secret);
      } catch (error) {
        return unauthorizedResponse(res);
      }

      const user = await repository.findUserById(decoded.userId);
      if (!user || user.is_active === false) {
        return unauthorizedResponse(res);
      }

      req.user = sanitizeUser(user);
      req.auth = decoded;
      return next();
    } catch (error) {
      return unauthorizedResponse(res);
    }
  };
}

export const authMiddleware = createAuthMiddleware();
