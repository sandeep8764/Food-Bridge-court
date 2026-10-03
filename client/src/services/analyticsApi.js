import api from './api';

export function getAnalyticsOverview() {
  return api.get('/analytics/overview');
}

export function getAnalyticsMonthly() {
  return api.get('/analytics/monthly');
}

export function getAnalyticsCategories() {
  return api.get('/analytics/categories');
}

export function getAnalyticsStatus() {
  return api.get('/analytics/status');
}

export function getDonorAnalytics() {
  return api.get('/analytics/donor');
}

export function getAdminAnalytics() {
  return api.get('/analytics/admin');
}

export function getNgoAnalytics() {
  return api.get('/analytics/ngo');
}

export function getLeaderboard(limit = 10) {
  return api.get('/analytics/leaderboard', { params: { limit } });
}