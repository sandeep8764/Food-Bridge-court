import api from './api';

export function getAdminDashboard() {
  return api.get('/admin/dashboard');
}

export function getAdminAnalyticsData() {
  return api.get('/admin/analytics');
}

export function listAdminUsers(params) {
  return api.get('/admin/users', { params });
}

export function updateUserStatus(userId, isActive, reason = '') {
  return api.put(`/admin/users/${userId}/status`, { is_active: isActive, reason });
}

export function listAdminDonations(params) {
  return api.get('/admin/donations', { params });
}

export function getAdminDonationDetails(donationId) {
  return api.get(`/admin/donations/${donationId}`);
}

export function updateAdminDonationStatus(donationId, status, reason = '') {
  return api.put(`/admin/donations/${donationId}/status`, { status, reason });
}

export function listAdminAuditLogs(params) {
  return api.get('/admin/audit-logs', { params });
}
