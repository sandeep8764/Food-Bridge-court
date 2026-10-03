import { AppError } from '../utils/appError.js';
import {
  getCategoryAnalytics,
  getDonorAnalytics,
  getDonorAnalyticsById,
  getLeaderboard,
  getMonthlyAnalytics,
  getNgAnalyticsByOrg,
  getOverviewAnalytics,
  getStatusAnalytics
} from '../models/analyticsModel.js';

const CO2_FACTOR = 2.5;

function withConfiguredCo2(value) {
  return Number((Number(value || 0)).toFixed(2));
}

export function createAnalyticsService(dependencies = {}) {
  const analyticsRepository = dependencies.analyticsModel || {
    getOverviewAnalytics,
    getMonthlyAnalytics,
    getCategoryAnalytics,
    getStatusAnalytics,
    getDonorAnalytics,
    getDonorAnalyticsById,
    getNgAnalyticsByOrg,
    getLeaderboard
  };

  return {
    async getOverview(user) {
      if (!['ADMIN', 'NGO', 'SHELTER', 'DONOR', 'VOLUNTEER'].includes(user.role)) {
        throw new AppError('Forbidden', 403);
      }

      const overview = await analyticsRepository.getOverviewAnalytics();
      return {
        total_donations: Number(overview.total_donations || 0),
        available_donations: Number(overview.available_donations || 0),
        claimed_donations: Number(overview.claimed_donations || 0),
        active_donations: Number(overview.active_donations || (
          Number(overview.available_donations || 0) +
          Number(overview.claimed_donations || 0) +
          Number(overview.assigned_donations || 0) +
          Number(overview.picked_up_donations || 0)
        )),
        delivered_donations: Number(overview.delivered_donations || 0),
        expired_donations: Number(overview.expired_donations || 0),
        cancelled_donations: Number(overview.cancelled_donations || 0),
        total_meals_saved: Number(overview.total_meals_saved || 0),
        total_co2_offset: withConfiguredCo2(overview.total_co2_offset)
      };
    },

    async getMonthly(user) {
      if (!['ADMIN', 'NGO', 'SHELTER', 'DONOR', 'VOLUNTEER'].includes(user.role)) {
        throw new AppError('Forbidden', 403);
      }

      return analyticsRepository.getMonthlyAnalytics();
    },

    async getCategories(user) {
      if (!['ADMIN', 'NGO', 'SHELTER', 'DONOR', 'VOLUNTEER'].includes(user.role)) {
        throw new AppError('Forbidden', 403);
      }

      return analyticsRepository.getCategoryAnalytics();
    },

    async getStatus(user) {
      if (!['ADMIN', 'NGO', 'SHELTER', 'DONOR', 'VOLUNTEER'].includes(user.role)) {
        throw new AppError('Forbidden', 403);
      }

      return analyticsRepository.getStatusAnalytics();
    },

    async getDonorAnalytics(user) {
      if (user.role !== 'DONOR') {
        throw new AppError('Forbidden', 403);
      }

      return analyticsRepository.getDonorAnalyticsById(user.id);
    },

    async getAdminAnalytics(user) {
      if (user.role !== 'ADMIN') {
        throw new AppError('Forbidden', 403);
      }

      const [overview, monthly, categories, status, donors] = await Promise.all([
        analyticsRepository.getOverviewAnalytics(),
        analyticsRepository.getMonthlyAnalytics(),
        analyticsRepository.getCategoryAnalytics(),
        analyticsRepository.getStatusAnalytics(),
        analyticsRepository.getDonorAnalytics()
      ]);

      return { overview, monthly, categories, status, donors };
    },

    async getNgoAnalytics(user) {
      if (!['NGO', 'SHELTER', 'ADMIN'].includes(user.role)) {
        throw new AppError('Forbidden', 403);
      }

      return analyticsRepository.getNgAnalyticsByOrg(user.id);
    },

    async getLeaderboard(limit = 10) {
      return analyticsRepository.getLeaderboard(limit);
    }
  };
}

export const analyticsService = createAnalyticsService();