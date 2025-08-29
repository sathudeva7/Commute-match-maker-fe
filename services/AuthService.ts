import { apiClient } from './ApiClient';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../constants/ApiConfig';
import { 
  LoginRequest, 
  RegisterRequest, 
  CreateProfileRequest,
  AuthResponse, 
  User,
  ApiResponse,
  UserProfileResponse
} from './types/api';

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('login');
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      console.log('res', response);
      if (response.success) {
        // Store tokens
        console.log('response.result.token', response.result.token)
        await this.storeTokens(response.result.token);
        return response.result;
      }

      throw new Error(response.error || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );

      if (response.success) {
        await this.storeTokens(response.result.token);
        return response.data;
      }

      throw new Error(response.error || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Create user profile
  async createProfile(profileData: CreateProfileRequest): Promise<User> {
    try {
      const response = await apiClient.post<User>(
        API_CONFIG.ENDPOINTS.USER.CREATE_PROFILE,
        profileData
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.error || 'Profile creation failed');
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  }

  // update user profile
  async updateProfile(profileData: CreateProfileRequest): Promise<User> {
    try {
      const response = await apiClient.put<User>(
        API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE,
        profileData
      );

      if (response.success) {
        return response.data;
      }

      throw new Error(response.error || 'Profile creation failed');
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local tokens
      await this.clearTokens();
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<UserProfileResponse>(API_CONFIG.ENDPOINTS.USER.PROFILE);
    console.log('sdasdas', response.result)
    return response.result;
    
    
  }

  // Get user profile (alias for getCurrentUser)
  async getProfile(): Promise<User> {
    return this.getCurrentUser();
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('accessToken');
    return !!token;
  }

  // Store tokens securely
  private async storeTokens(token: string) {
    await SecureStore.setItemAsync('accessToken', token);
  }

  // Clear stored tokens
  private async clearTokens() {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to send reset email');
    }
  }
}

export const authService = new AuthService(); 