// API Types and Interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateProfileRequest {
  // User Profile Fields (stored in User collection)
  full_name: string;
  phone_number: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  date_of_birth: string;
  bio: string;
  profile_image_url?: string;
  
  // Matching Preference Fields (stored in UserMatchingPreferences collection)
  profession: string;
  about_me: string;
  interests: string[];
  languages: string[];
  preferred_commute_time: {
    start: string;
    end: string;
  };
  preferred_commute_days: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[];
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface User {
  _id: string;
  full_name: string;
  email: string;
  date_of_birth: string;
  phone_number: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  role: string;
  oauth_provider?: string;
  oauth_id?: string;
  profile_image_url?: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
  matching_preferences?: {
    _id: string;
    user: string;
    matching_preferences: {
      profession: string;
      about_me: string;
      interests: string[];
      languages: string[];
      preferred_commute_time: {
        start: string;
        end: string;
      };
      preferred_commute_days: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[];
      preferred_commute_times?: string[];
      preferred_commute_radius?: number;
      preferred_route?: {
        start_location: {
          latitude: number;
          longitude: number;
          address: string;
        };
        end_location: {
          latitude: number;
          longitude: number;
          address: string;
        };
      };
      preferred_vehicle_type?: 'CAR' | 'BUS' | 'TRAIN' | 'WALKING' | 'CYCLING';
      preferred_gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
      preferred_age_range?: {
        min: number;
        max: number;
      };
      smoking_preference?: 'SMOKER' | 'NON_SMOKER' | 'PREFER_NOT_TO_SAY';
      music_preference?: 'YES' | 'NO' | 'PREFER_NOT_TO_SAY';
      max_distance?: number;
      embedding?: number[];
      embedding_version?: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface UserProfileResponse {
  success: boolean;
  result: User;
  message: string;
}

// For backward compatibility, keep the existing ApiResponse structure
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Journey Types
export interface Journey {
  id: string;
  userId: string;
  startLocation: Location;
  endLocation: Location;
  departureTime: string;
  mode: 'bus' | 'tube' | 'overground' | 'walking';
  routeId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

// TfL API Types
export interface TflPlace {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
}

export interface TflArrival {
  id: string;
  lineName: string;
  destinationName: string;
  expectedArrival: string;
  stationName: string;
}

// Chat Types
export interface Chat {
  _id: string;
  participants: string[];
  chatType: 'direct' | 'group';
  name?: string;
  description?: string;
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'location';
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatRequest {
  participantId: string;
  chatType: 'direct' | 'group';
  name?: string;
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'location';
}

export interface UpdateChatRequest {
  name?: string;
  description?: string;
}

export interface MarkAsReadRequest {
  messageId?: string;
}

export interface ChatResponse {
  success: boolean;
  result: Chat;
  message: string;
}

export interface ChatsResponse {
  success: boolean;
  result: {
    chats: Chat[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface MessagesResponse {
  success: boolean;
  result: {
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface MessageResponse {
  success: boolean;
  result: Message;
  message: string;
} 