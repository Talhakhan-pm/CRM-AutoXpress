import axios from 'axios';

// Create an instance of axios with base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callbacks API service
export const callbacksApi = {
  // Get all callbacks with optional filters
  getCallbacks: async (filters = {}) => {
    const { data } = await api.get('/callbacks', { params: filters });
    return data;
  },

  // Get a single callback by ID
  getCallback: async (id) => {
    const { data } = await api.get(`/callbacks/${id}`);
    return data;
  },

  // Create a new callback
  createCallback: async (callbackData) => {
    const { data } = await api.post('/callbacks', callbackData);
    return data;
  },

  // Update an existing callback
  updateCallback: async (id, callbackData) => {
    const { data } = await api.put(`/callbacks/${id}`, callbackData);
    return data;
  },

  // Delete a callback
  deleteCallback: async (id) => {
    const { data } = await api.delete(`/callbacks/${id}`);
    return data;
  },

  // Search callbacks
  searchCallbacks: async (query) => {
    const { data } = await api.get(`/callbacks/search?query=${encodeURIComponent(query)}`);
    return data;
  },
};

export default api;