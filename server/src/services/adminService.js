import { AppError } from '../utils/appError.js';
import { findUserById, getUserRoleCounts, getUserRoleDistribution, listUsers, updateUserActiveStatus } from '../models/userModel.js';
import {
  cancelDonation,
  findDonationDetailsById,
  listDonations,
  updateDonation
} from '../models/donationModel.js';
import {
  getCategoryAnalytics,
  getMonthlyAnalytics,
  getOverviewAnalytics,
  getStatusAnalytics
} from '../models/analyticsModel.js';
import { createAuditLog, listAuditLogs } from '../models/auditLogModel.js';

export function createAdminService(dependencies = {}) {
  const userRepo = dependencies.userModel || {
    findUserById,
    listUsers,
    updateUserActiveStatus,
    getUserRoleCounts,
    getUserRoleDistribution
  };
  const donationRepo = dependencies.donationModel || {
    findDonationDetailsById,
    listDonations,
    updateDonation,
    cancelDonation
  };
  const analyticsRepo = dependencies.analyticsModel || {
    getOverviewAnalytics,
    getMonthlyAnalytics,
    getCategoryAnalytics,
    getStatusAnalytics
  };
  const auditRepo = dependencies.auditLogModel || {
    createAuditLog,
    listAuditLogs
  };

  function requireAdmin(user) {
    if (!user || user.role !== 'ADMIN') {
      throw new AppError('Forbidden: Admin privileges required', 403);
    }
  }

  return {
    async getDashboardSummary(user) {
      requireAdmin(user);

      const [userCounts, donationOverview, usersByRole] = await Promise.all([
        userRepo.getUserRoleCounts(),
        analyticsRepo.getOverviewAnalytics(),
        userRepo.getUserRoleDistribution()
      ]);

      const activeDonations = Number(donationOverview?.active_donations ?? (
        Number(donationOverview?.available_donations || 0) +
        Number(donationOverview?.claimed_donations || 0) +
        Number(donationOverview?.assigned_donations || 0) +
        Number(donationOverview?.picked_up_donations || 0)
      ));

      return {
        // User metrics
        total_users: Number(userCounts?.total_users || 0),
        total_donors: Number(userCounts?.total_donors || 0),
        total_ngos: Number(userCounts?.total_ngos || 0),
        total_shelters: Number(userCounts?.total_shelters || 0),
        total_volunteers: Number(userCounts?.total_volunteers || 0),
        total_admins: Number(userCounts?.total_admins || 0),
        active_users: Number(userCounts?.active_users || 0),
        inactive_users: Number(userCounts?.inactive_users || 0),

        // Donation metrics
        total_donations: Number(donationOverview?.total_donations || 0),
        available_donations: Number(donationOverview?.available_donations || 0),
        claimed_donations: Number(donationOverview?.claimed_donations || 0),
        active_donations: activeDonations,
        delivered_donations: Number(donationOverview?.delivered_donations || 0),
        expired_donations: Number(donationOverview?.expired_donations || 0),
        cancelled_donations: Number(donationOverview?.cancelled_donations || 0),

        // Impact metrics
        total_meals_saved: Number(donationOverview?.total_meals_saved || 0),
        total_co2_offset: Number(Number(donationOverview?.total_co2_offset || 0).toFixed(2)),

        users_by_role: usersByRole || []
      };
    },

    async getAnalytics(user) {
      requireAdmin(user);

      const [overview, monthly, categories, status, usersByRole] = await Promise.all([
        analyticsRepo.getOverviewAnalytics(),
        analyticsRepo.getMonthlyAnalytics(),
        analyticsRepo.getCategoryAnalytics(),
        analyticsRepo.getStatusAnalytics(),
        userRepo.getUserRoleDistribution()
      ]);

      return {
        overview,
        monthly,
        categories,
        status,
        users_by_role: usersByRole
      };
    },

    async getUsers(user, query = {}) {
      requireAdmin(user);
      return userRepo.listUsers({
        page: Math.max(Number.parseInt(query.page || '1', 10), 1),
        limit: Math.min(Math.max(Number.parseInt(query.limit || '20', 10), 1), 100),
        role: query.role?.trim() || undefined,
        is_active: query.is_active,
        search: query.search?.trim() || undefined
      });
    },

    async updateUserStatus(adminUser, targetUserId, isActive, reason = '') {
      requireAdmin(adminUser);

      const userIdNum = Number(targetUserId);
      if (Number(adminUser.id) === userIdNum) {
        throw new AppError('Administrators cannot deactivate their own account', 400);
      }

      const targetUser = await userRepo.findUserById(userIdNum);
      if (!targetUser) {
        throw new AppError('Target user not found', 404);
      }

      const updatedUser = await userRepo.updateUserActiveStatus(userIdNum, isActive);

      const action = isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
      await auditRepo.createAuditLog({
        user_id: adminUser.id,
        action,
        entity_type: 'USER',
        entity_id: userIdNum,
        details: {
          target_email: targetUser.email,
          target_name: targetUser.name,
          target_role: targetUser.role,
          previous_status: targetUser.is_active,
          new_status: Boolean(isActive),
          reason: reason || null
        }
      });

      return updatedUser;
    },

    async getDonations(user, query = {}) {
      requireAdmin(user);
      return donationRepo.listDonations({
        page: Math.max(Number.parseInt(query.page || '1', 10), 1),
        limit: Math.min(Math.max(Number.parseInt(query.limit || '20', 10), 1), 100),
        status: query.status?.trim() || undefined,
        category: query.category?.trim() || undefined,
        city: query.city?.trim() || undefined,
        search: query.search?.trim() || undefined
      });
    },

    async getDonationDetails(user, donationId) {
      requireAdmin(user);
      const donation = await donationRepo.findDonationDetailsById(donationId);
      if (!donation) {
        throw new AppError('Donation not found', 404);
      }
      return donation;
    },

    async updateDonationStatus(adminUser, donationId, status, reason = '') {
      requireAdmin(adminUser);

      const donation = await donationRepo.findDonationDetailsById(donationId);
      if (!donation) {
        throw new AppError('Donation not found', 404);
      }

      const validAdminStatuses = ['AVAILABLE', 'CANCELLED', 'EXPIRED'];
      if (!validAdminStatuses.includes(status)) {
        throw new AppError(`Admin can only set status to one of: ${validAdminStatuses.join(', ')}`, 400);
      }

      const updatedDonation = await donationRepo.updateDonation(donationId, { status });

      await auditRepo.createAuditLog({
        user_id: adminUser.id,
        action: 'ADMIN_DONATION_STATUS_CHANGE',
        entity_type: 'DONATION',
        entity_id: donationId,
        details: {
          previous_status: donation.status,
          new_status: status,
          reason: reason || 'Administrative intervention'
        }
      });

      return updatedDonation;
    },

    async getAuditLogs(user, query = {}) {
      requireAdmin(user);
      return auditRepo.listAuditLogs({
        page: Math.max(Number.parseInt(query.page || '1', 10), 1),
        limit: Math.min(Math.max(Number.parseInt(query.limit || '20', 10), 1), 100),
        action: query.action?.trim() || undefined,
        entity_type: query.entity_type?.trim() || undefined,
        search: query.search?.trim() || undefined
      });
    }
  };
}

export const adminService = createAdminService();
