import { adminService as defaultAdminService } from '../services/adminService.js';

export function createAdminController(dependencies = {}) {
  const adminService = dependencies.adminService || defaultAdminService;

  return {
    async getDashboard(req, res, next) {
      try {
        const summary = await adminService.getDashboardSummary(req.user);
        res.status(200).json({ success: true, data: summary });
      } catch (error) {
        next(error);
      }
    },

    async getAnalytics(req, res, next) {
      try {
        const analytics = await adminService.getAnalytics(req.user);
        res.status(200).json({ success: true, data: analytics });
      } catch (error) {
        next(error);
      }
    },

    async listUsers(req, res, next) {
      try {
        const result = await adminService.getUsers(req.user, req.query);
        res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
      } catch (error) {
        next(error);
      }
    },

    async updateUserStatus(req, res, next) {
      try {
        const { is_active, reason } = req.body;
        const user = await adminService.updateUserStatus(req.user, req.params.id, is_active, reason);
        res.status(200).json({ success: true, data: { user } });
      } catch (error) {
        next(error);
      }
    },

    async listDonations(req, res, next) {
      try {
        const result = await adminService.getDonations(req.user, req.query);
        res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
      } catch (error) {
        next(error);
      }
    },

    async getDonationDetails(req, res, next) {
      try {
        const donation = await adminService.getDonationDetails(req.user, req.params.id);
        res.status(200).json({ success: true, data: { donation } });
      } catch (error) {
        next(error);
      }
    },

    async updateDonationStatus(req, res, next) {
      try {
        const { status, reason } = req.body;
        const donation = await adminService.updateDonationStatus(req.user, req.params.id, status, reason);
        res.status(200).json({ success: true, data: { donation } });
      } catch (error) {
        next(error);
      }
    },

    async listAuditLogs(req, res, next) {
      try {
        const result = await adminService.getAuditLogs(req.user, req.query);
        res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
      } catch (error) {
        next(error);
      }
    }
  };
}

export const adminController = createAdminController();
