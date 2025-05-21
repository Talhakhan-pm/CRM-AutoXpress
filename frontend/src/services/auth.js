import axios from 'axios';
import api from './api';

// Auth API service
export const authApi = {
  // Login user and get token
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email); // OAuth2 expects 'username' field
    formData.append('password', password);
    
    const { data } = await axios.post(
      `${api.defaults.baseURL}/auth/login`, 
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    // Store token in localStorage
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      api.defaults.headers.Authorization = `Bearer ${data.access_token}`;
    }
    
    return data;
  },
  
  // Sign up a new user
  signup: async (userData) => {
    const { data } = await api.post('/auth/signup', userData);
    return data;
  },
  
  // Get current user info
  getCurrentUser: async () => {
    const { data } = await api.get('/users/me');
    return data;
  },
  
  // Update current user
  updateProfile: async (userData) => {
    const { data } = await api.put('/users/me', userData);
    return data;
  },
  
  // Logout user (client-side only - just remove the token)
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.Authorization;
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Set token from storage on app init
  initializeAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      return true;
    }
    return false;
  },
};

// Interceptor to handle 401 errors (expired or invalid tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, logout user
      authApi.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default authApi;