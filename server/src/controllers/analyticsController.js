import { analyticsService as defaultAnalyticsService } from '../services/analyticsService.js';

export function createAnalyticsController(dependencies = {}) {
  const analyticsService = dependencies.analyticsService || defaultAnalyticsService;

  return {
    async overview(req, res, next) {
      try {
        const overview = await analyticsService.getOverview(req.user);
        res.status(200).json({ success: true, data: overview });
      } catch (error) {
        next(error);
      }
    },

    async monthly(req, res, next) {
      try {
        const monthly = await analyticsService.getMonthly(req.user);
        res.status(200).json({ success: true, data: monthly });
      } catch (error) {
        next(error);
      }
    },

    async categories(req, res, next) {
      try {
        const categories = await analyticsService.getCategories(req.user);
        res.status(200).json({ success: true, data: categories });
      } catch (error) {
        next(error);
      }
    },

    async status(req, res, next) {
      try {
        const status = await analyticsService.getStatus(req.user);
        res.status(200).json({ success: true, data: status });
      } catch (error) {
        next(error);
      }
    },

    async donor(req, res, next) {
      try {
        const donor = await analyticsService.getDonorAnalytics(req.user);
        res.status(200).json({ success: true, data: donor });
      } catch (error) {
        next(error);
      }
    },

    async admin(req, res, next) {
      try {
        const analytics = await analyticsService.getAdminAnalytics(req.user);
        res.status(200).json({ success: true, data: analytics });
      } catch (error) {
        next(error);
      }
    },

    async ngo(req, res, next) {
      try {
        const analytics = await analyticsService.getNgoAnalytics(req.user);
        res.status(200).json({ success: true, data: analytics });
      } catch (error) {
        next(error);
      }
    },

    async leaderboard(req, res, next) {
      try {
        const limit = Number.parseInt(req.query.limit || '10', 10);
        const leaderboard = await analyticsService.getLeaderboard(limit);
        res.status(200).json({ success: true, data: leaderboard });
      } catch (error) {
        next(error);
      }
    }
  };
}

export const analyticsController = createAnalyticsController();