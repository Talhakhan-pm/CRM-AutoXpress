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
  getCallback: async (id, userId = null) => {
    // Add userId as query param to log view activity
    const params = userId ? { user_id: userId } : {};
    const { data } = await api.get(`/callbacks/${id}`, { params });
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
  
  // Claim a callback
  claimCallback: async (id, userId) => {
    const { data } = await api.post(`/callbacks/${id}/claim`, { user_id: userId });
    return data;
  },
  
  // Unclaim a callback
  unclaimCallback: async (id, userId) => {
    const { data } = await api.post(`/callbacks/${id}/unclaim`, { user_id: userId });
    return data;
  },
};

// Activities API service
export const activitiesApi = {
  // Get activities for a callback
  getActivities: async (callbackId, limit = 100) => {
    const { data } = await api.get(`/activities/${callbackId}`, {
      params: { limit },
    });
    return data;
  },
  
  // Record a view activity
  recordView: async (callbackId, userId) => {
    const { data } = await api.post(`/activities/${callbackId}/view`, { user_id: userId });
    return data;
  },
};

export default api;