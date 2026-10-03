import { authService as defaultAuthService, createAuthService } from '../services/authService.js';

export function createAuthController(dependencies = {}) {
  const authService = dependencies.authService || defaultAuthService;

  return {
    async register(req, res, next) {
      try {
        const result = await authService.register(req.body);
        res.status(201).json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },

    async login(req, res, next) {
      try {
        const result = await authService.login(req.body);
        res.status(200).json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },

    async me(req, res, next) {
      try {
        res.status(200).json({ success: true, data: { user: req.user } });
      } catch (error) {
        next(error);
      }
    },

    async logout(req, res, next) {
      try {
        const result = authService.logout();
        res.status(200).json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    }
  };
}

export const authController = createAuthController();
