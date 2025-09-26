// API Service for Durga Backend Integration
import { GEMINI_API_KEY } from '../config/apiConfig';

// Backend API Configuration
// Use your computer's IP address instead of localhost for mobile access
const API_BASE_URL = 'http://10.253.87.127:5000/api/v1'; // Your computer's IP from Expo

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers: this.getHeaders(),
      body: options.body
    });
    
    const config = {
      headers: this.getHeaders(),
      timeout: 30000, // 30 second timeout
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      console.log('API Response:', {
        status: response.status,
        data
      });

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User Registration
  async registerUser(userData) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User Login
  async loginUser(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Get User Profile
  async getUserProfile() {
    return this.request('/users/profile');
  }

  // Update User Profile
  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Add Emergency Contact
  async addEmergencyContact(contactData) {
    return this.request('/users/emergency-contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // Get Emergency Contacts
  async getEmergencyContacts() {
    return this.request('/users/emergency-contacts');
  }

  // Get Location-based Emergency Contacts
  async getLocationContacts(city, state, limit = 10) {
    return this.request(`/users/location/${city}/${state}?limit=${limit}`);
  }

  // Update Safety Statistics
  async updateSafetyStats(type, increment = 1) {
    return this.request('/users/safety-stats', {
      method: 'POST',
      body: JSON.stringify({ type, increment }),
    });
  }

  // Verify Token
  async verifyToken() {
    return this.request('/auth/verify-token');
  }

  // Change Password
  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Logout
  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Forgot Password
  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }

  // Test connectivity
  async testConnection() {
    return this.request('/test');
  }

  // SOS: send alert (server relays via SMS/MMS)
  async sendSosAlert(payload) {
    return this.request('/alerts/sos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // SOS: upload audio (multipart) -> returns audioUrl
  async uploadSosAudio(fileUri) {
    const formData = new FormData();
    formData.append('audio', {
      uri: fileUri,
      name: 'sos_audio.m4a',
      type: 'audio/m4a',
    });
    const url = `${this.baseURL}/alerts/sos-audio`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for convenience
export const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addEmergencyContact,
  getEmergencyContacts,
  getLocationContacts,
  updateSafetyStats,
  verifyToken,
  changePassword,
  logout,
  forgotPassword,
  healthCheck,
  testConnection,
  sendSosAlert,
  uploadSosAudio,
  setToken
} = apiService;
