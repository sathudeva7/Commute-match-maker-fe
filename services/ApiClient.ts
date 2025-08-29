import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/ApiConfig';
import * as SecureStore from 'expo-secure-store';
import { ApiResponse } from '../types/api';

// Navigation event system for handling redirects from services
export type NavigationEvent = 'redirectToLogin' | 'redirectToOnboarding';

class NavigationEventEmitter {
  private listeners: Map<NavigationEvent, (() => void)[]> = new Map();

  addListener(event: NavigationEvent, callback: () => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  removeListener(event: NavigationEvent, callback: () => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: NavigationEvent) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }
}

export const navigationEventEmitter = new NavigationEventEmitter();

// Define ApiError class here instead of importing
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor({ message, status, code }: { message: string; status: number; code?: string }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
    
    // Debug logging
    console.log('ApiClient initialized with:', {
      baseURL: this.baseURL,
      timeout: this.timeout,
      defaultHeaders: this.defaultHeaders
    });
  }

  // Request interceptor - adds auth token and common headers
  private async getHeaders(customHeaders: Record<string, string> = {}) {
    const token = await SecureStore.getItemAsync('accessToken');
    console.log('token', token);
    
    return {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...customHeaders,
    };
  }

  // Response interceptor - handles common response logic
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    console.log('handleResponse', response);
	if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle token expiration and unauthorized access
      if (response.status === 401) {
        await this.handleUnauthorizedResponse();
      }
      
      throw new ApiError({
        message: errorData.message || 'An error occurred',
        status: response.status,
        code: errorData.code,
      });
    }

    const data = await response.json();
    return data;
  }

  // Handle unauthorized responses (401)
  private async handleUnauthorizedResponse() {
    console.log('Handling 401 unauthorized response');
    
    try {
      // First try to refresh the token
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        console.log('Attempting to refresh token...');
        try {
          const response = await this.post<{ accessToken: string }>(
            API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
            { refreshToken }
          );
          
          if (response.success) {
            console.log('Token refreshed successfully');
            await SecureStore.setItemAsync('accessToken', response.data.accessToken);
            return; // Token refreshed successfully, no need to redirect
          }
        } catch (refreshError) {
          console.log('Token refresh failed:', refreshError);
        }
      } else {
        console.log('No refresh token available');
      }
    } catch (error) {
      console.log('Error during token refresh:', error);
    }
    
    // If we reach here, either no refresh token or refresh failed
    console.log('Clearing tokens and redirecting to login');
    await this.clearTokens();
    navigationEventEmitter.emit('redirectToLogin');
  }

  // Handle token expiration (legacy method - kept for backward compatibility)
  private async handleTokenExpiration() {
    await this.handleUnauthorizedResponse();
  }

  // Clear stored tokens
  private async clearTokens() {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    await SecureStore.deleteItemAsync('accessToken');
  }

  // Core request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(options.headers as Record<string, string>);
    
    // Enhanced logging for debugging
    console.log('Making request to:', url);
    console.log('Request method:', options.method || 'GET');
    console.log('Request headers:', headers);
    console.log('Request body:', options.body);
    
    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
	
      return await this.handleResponse<T>(response);
    } catch (error) {
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      throw new ApiError({
        message: 'Network error. Please check your connection.',
        status: 0,
      });
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
	console.log('post', endpoint, data);
	return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // TfL API requests (external API)
  async tflRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = `${API_CONFIG.TFL_BASE_URL}${endpoint}`;
    const fullUrl = params ? `${url}?${new URLSearchParams(params)}` : url;
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new ApiError({
          message: 'TfL API request failed',
          status: response.status,
        });
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        message: 'TfL API network error',
        status: 0,
      });
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Utility function to manually redirect to login (can be called from anywhere)
export const redirectToLogin = () => {
  navigationEventEmitter.emit('redirectToLogin');
};

// Utility function to manually redirect to onboarding (can be called from anywhere)
export const redirectToOnboarding = () => {
  navigationEventEmitter.emit('redirectToOnboarding');
}; 