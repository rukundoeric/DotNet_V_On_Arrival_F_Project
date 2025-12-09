import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5262/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const visaApplicationsApi = {
  getAll: () => api.get('/VisaApplications'),
  getById: (id) => api.get(`/VisaApplications/${id}`),
  create: (data) => api.post('/VisaApplications', data),
  update: (id, data) => api.put(`/VisaApplications/${id}`, data),
  delete: (id) => api.delete(`/VisaApplications/${id}`),
};

export const arrivalRecordsApi = {
  getAll: () => api.get('/ArrivalRecords'),
  getById: (id) => api.get(`/ArrivalRecords/${id}`),
  create: (data) => api.post('/ArrivalRecords', data),
  update: (id, data) => api.put(`/ArrivalRecords/${id}`, data),
  delete: (id) => api.delete(`/ArrivalRecords/${id}`),
};

export const usersApi = {
  getAll: () => api.get('/Users'),
  getById: (id) => api.get(`/Users/${id}`),
  create: (data) => api.post('/Users', data),
  update: (id, data) => api.put(`/Users/${id}`, data),
  delete: (id) => api.delete(`/Users/${id}`),
};

export default api;
