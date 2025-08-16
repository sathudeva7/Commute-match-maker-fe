import { apiClient } from './ApiClient';
import { API_CONFIG } from '../constants/ApiConfig';
import { User, ApiResponse } from './types/api';

class UserService {
  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(
      API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE,
      userData
    );

    if (response.success) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to update profile');
  }

  // Update availability status
  async updateAvailability(isAvailable: boolean): Promise<void> {
    const response = await apiClient.patch(
      API_CONFIG.ENDPOINTS.USER.AVAILABILITY,
      { isAvailable }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to update availability');
    }
  }

  // Get user profile
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>(API_CONFIG.ENDPOINTS.USER.PROFILE);
    console.log('response', response);
    if (response.success) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to get profile');
  }
}

export const userService = new UserService(); 