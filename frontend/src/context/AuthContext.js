import React, { createContext, useState, useContext, useEffect } from 'react';
import authApi from '../services/auth';

// Create auth context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if token exists and initialize axios headers
        const isAuthenticated = authApi.initializeAuth();
        
        if (isAuthenticated) {
          // Fetch current user data
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Failed to initialize authentication:', err);
        authApi.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.login(email, password);
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      return { success: false, error: err.response?.data?.detail || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.signup(userData);
      // After signup, log the user in
      return await login(userData.email, userData.password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
      return { success: false, error: err.response?.data?.detail || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await authApi.updateProfile(userData);
      setUser(updatedUser);
      
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.detail || 'Profile update failed');
      return { success: false, error: err.response?.data?.detail || 'Profile update failed' };
    } finally {
      setLoading(false);
    }
  };

  // Value object for the context provider
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;