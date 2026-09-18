import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

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