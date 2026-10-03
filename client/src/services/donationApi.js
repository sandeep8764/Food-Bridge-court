import api from './api';

export function listDonations(params) {
  return api.get('/donations', { params });
}

export function listNearbyDonations(params) {
  return api.get('/donations/nearby', { params });
}

export function getDonation(id) {
  return api.get(`/donations/${id}`);
}

export function createDonation(payload) {
  return api.post('/donations', payload);
}

export function updateDonation(id, payload) {
  return api.put(`/donations/${id}`, payload);
}

export function cancelDonation(id) {
  return api.delete(`/donations/${id}`);
}

export function claimDonation(id) {
  return api.post(`/donations/${id}/claim`);
}

export function listNgoClaims(params) {
  return api.get('/donations/claims', { params });
}
