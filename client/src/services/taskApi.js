import api from './api';

export function listTasks() {
  return api.get('/tasks');
}

export function getTask(id) {
  return api.get(`/tasks/${id}`);
}

export function acceptTask(id) {
  return api.post(`/tasks/${id}/accept`);
}

export function pickupTask(id) {
  return api.put(`/tasks/${id}/pickup`);
}

export function deliverTask(id) {
  return api.put(`/tasks/${id}/deliver`);
}
