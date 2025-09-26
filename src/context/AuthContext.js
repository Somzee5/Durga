import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false, // Start with false for faster loading
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app start
  useEffect(() => {
    // Add a small delay to ensure the app loads quickly
    const timer = setTimeout(() => {
      checkAuthState();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        // For faster startup, just set the token and assume it's valid
        // We'll verify it when the user tries to use the app
        apiService.setToken(token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: { name: 'User', email: 'user@example.com' }, // Placeholder
            token: token,
          },
        });
      } else {
        // No token, show login screen immediately
        console.log('No token found, showing login screen');
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('authToken');
      dispatch({ type: 'AUTH_FAILURE', payload: null });
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await apiService.registerUser(userData);
      
      // Store token
      await AsyncStorage.setItem('authToken', response.token);
      apiService.setToken(response.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await apiService.loginUser(credentials);
      
      // Store token
      await AsyncStorage.setItem('authToken', response.token);
      apiService.setToken(response.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token regardless of API call success
      await AsyncStorage.removeItem('authToken');
      apiService.setToken(null);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.updateUserProfile(profileData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.user,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const addEmergencyContact = async (contactData) => {
    try {
      const response = await apiService.addEmergencyContact(contactData);
      // Refresh user profile to get updated emergency contacts
      const profileResponse = await apiService.getUserProfile();
      dispatch({
        type: 'UPDATE_USER',
        payload: profileResponse.user,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateSafetyStats = async (type, increment = 1) => {
    try {
      const response = await apiService.updateSafetyStats(type, increment);
      return response;
    } catch (error) {
      console.error('Update safety stats error:', error);
      // Don't throw error for stats update failures
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    updateProfile,
    addEmergencyContact,
    updateSafetyStats,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
