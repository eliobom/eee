import { API_BASE_URL } from './config';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  }

  // Classes
  async getClasses() {
    return this.request('/classes');
  }

  // Tasks
  async getTasks() {
    return this.request('/tasks');
  }

  // Live Classes
  async getLiveClasses() {
    return this.request('/live-classes');
  }

  // Profile
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(profileData) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Measurements
  async getMeasurements(userId = null) {
    const endpoint = userId ? `/measurements/${userId}` : '/measurements';
    return this.request(endpoint);
  }

  async createMeasurement(measurementData) {
    return this.request('/measurements', {
      method: 'POST',
      body: JSON.stringify(measurementData),
    });
  }

  // Achievements
  async getAchievements() {
    return this.request('/achievements');
  }

  async getUserAchievements(userId = null) {
    const endpoint = userId ? `/user-achievements/${userId}` : '/user-achievements';
    return this.request(endpoint);
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Progress Reports
  async getProgressReports(userId = null) {
    const endpoint = userId ? `/progress-reports/${userId}` : '/progress-reports';
    return this.request(endpoint);
  }

  // Recommendations
  async getRecommendations(userId = null) {
    const endpoint = userId ? `/recommendations/${userId}` : '/recommendations';
    return this.request(endpoint);
  }

  // Subscriptions
  async createSubscription(subscriptionData) {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  // Push Notifications
  async registerPushToken(tokenData) {
    return this.request('/notifications/register-token', {
      method: 'POST',
      body: JSON.stringify(tokenData),
    });
  }

  async sendPushNotification(notificationData) {
    return this.request('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }
}

export const apiClient = new ApiClient();