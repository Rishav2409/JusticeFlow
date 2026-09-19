import axios from 'axios';
import { getToken, logout } from './auth';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// =====================================================
// REQUEST INTERCEPTOR
// Attaches JWT token to every outgoing request.
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================================
// RESPONSE INTERCEPTOR
// Handles 401 responses by clearing auth and redirecting.
// =====================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired — clear auth state
      logout();
      // Redirect to login (only if not already there)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const offenceService = {
  getAll: () => api.get('/offences').then(r => r.data),
  search: (query) =>
    api.get(`/offences/search?q=${encodeURIComponent(query)}`).then(r => r.data),
};

export const caseService = {
  create: (data) => api.post('/cases', data).then(r => r.data),
  getAll: () => api.get('/cases').then(r => r.data),
  getById: (id) => api.get(`/cases/${id}`).then(r => r.data),
};

export const eligibilityService = {
  calculate: (data) => api.post('/eligibility/calculate', data).then(r => r.data),
};

export default api;