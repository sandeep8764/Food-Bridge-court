import { authService as defaultAuthService } from '../services/authService.js';

export function createUserController(dependencies = {}) {
  const authService = dependencies.authService || defaultAuthService;

  return {
    async getProfile(req, res, next) {
      try {
        const user = await authService.getCurrentUser(req.user.id);
        res.status(200).json({ success: true, data: { user } });
      } catch (error) {
        next(error);
      }
    },

    async updateProfile(req, res, next) {
      try {
        const user = await authService.updateProfile(req.user.id, req.body);
        res.status(200).json({ success: true, data: { user } });
      } catch (error) {
        next(error);
      }
    }
  };
}

export const userController = createUserController();
