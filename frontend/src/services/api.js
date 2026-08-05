import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
});

// Get user ID from localStorage (we'll set this on login)
const getUserId = () => localStorage.getItem('userId') || '183ce3b1-5c1e-4dd5-a671-010b7b93db78';

// Deadline endpoints
export const deadlineAPI = {
  getAll: (status = 'pending', priority = null) => {
    const params = new URLSearchParams({
      user_id: getUserId(),
      status,
    });
    if (priority) params.append('priority', priority);
    return api.get(`/deadlines/?${params}`);
  },
  
  getUpcoming: () =>
    api.get(`/deadlines/upcoming?user_id=${getUserId()}`),
  
  getByPriority: () =>
    api.get(`/deadlines/by-priority?user_id=${getUserId()}`),
  
  getStats: () =>
    api.get(`/deadlines/stats?user_id=${getUserId()}`),
  
  updateStatus: (deadlineId, status) =>
    api.post(`/deadlines/${deadlineId}/status?status=${status}`),
};

// Task endpoints
export const taskAPI = {
  getAll: (deadlineId = null) => {
    const params = new URLSearchParams({ user_id: getUserId() });
    if (deadlineId) params.append('deadline_id', deadlineId);
    return api.get(`/tasks/?${params}`);
  },
  
  getByDeadline: (deadlineId) =>
    api.get(`/tasks/?user_id=${getUserId()}&deadline_id=${deadlineId}`),
  
  breakdownDeadline: (deadlineId) =>
    api.post(`/tasks/breakdown/${deadlineId}?user_id=${getUserId()}`),
  
  breakdownAll: () =>
    api.post(`/tasks/breakdown-all?user_id=${getUserId()}`),
  
  updateStatus: (taskId, status) =>
    api.post(`/tasks/${taskId}/status?status=${status}`),
  
  getProgress: (deadlineId) =>
    api.get(`/tasks/deadline/${deadlineId}/progress`),
  
  getAnalysis: (deadlineId) =>
    api.get(`/tasks/analysis/${deadlineId}?user_id=${getUserId()}`),
};

// Notification endpoints
export const notificationAPI = {
  getPreferences: () =>
    api.get(`/notifications/preferences?user_id=${getUserId()}`),
  
  updatePreferences: (prefs) =>
    api.post(`/notifications/preferences?user_id=${getUserId()}`, prefs),
  
  getHistory: () =>
    api.get(`/notifications/history?user_id=${getUserId()}`),
};

// Health check
export const healthCheck = () => api.get('/health');