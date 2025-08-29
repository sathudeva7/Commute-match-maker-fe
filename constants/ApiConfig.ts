import { Platform } from 'react-native';

// Get the correct localhost URL based on platform
const getLocalApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000'; // Android emulator
  }
  return 'http://localhost:3000'; // iOS simulator
};

// API Configuration
export const API_CONFIG = {
  // Your backend server URL
  BASE_URL: 'https://commute-match-maker-829hh.ondigitalocean.app/api',
  
  // TfL API Configuration (for transport data)
  TFL_BASE_URL: 'https://api.tfl.gov.uk',
  
  // Request timeout
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/user/login',
      REGISTER: '/user/register',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh',
      FORGOT_PASSWORD: '/auth/forgot-password',
    },
    
    // User endpoints
    USER: {
      PROFILE: '/user/profile',
      CREATE_PROFILE: '/preferences',
      UPDATE_PROFILE: '/user/update-profile',
      AVAILABILITY: '/user/availability',
    },
    
    // Matching endpoints
    MATCHING: {
      FIND_MATCHES: '/matching/find',
      CREATE_MATCH: '/matching/create',
      ACCEPT_MATCH: '/matching/accept',
      REJECT_MATCH: '/matching/reject',
      SEMANTIC_MATCHES: '/preferences/semantic-matches',
    },
    
    // Journey endpoints
    JOURNEY: {
      CREATE: '/journey/create',
      MY_JOURNEYS: '/journey/my-journeys',
      UPDATE: '/journey/update',
      DELETE: '/journey/delete',
    },
    
    // Chat endpoints
    CHAT: {
      CREATE: '/chat',
      GET_CHATS: '/chat',
      GET_CHAT: '/chat/{chatId}',
      UPDATE_CHAT: '/chat/{chatId}',
      DELETE_CHAT: '/chat/{chatId}',
      SEND_MESSAGE: '/chat/messages',
      GET_MESSAGES: '/chat/{chatId}/messages',
      MARK_AS_READ: '/chat/{chatId}/read',
    },
    
    // TfL API endpoints (external)
    TFL: {
      SEARCH_STOPS: '/StopPoint/Search',
      STOP_ARRIVALS: '/StopPoint/{id}/Arrivals',
      JOURNEY_PLANNER: '/Journey/JourneyResults/{from}/to/{to}',
      NEARBY_STOPS: '/StopPoint',
      LINE_ROUTES: '/Line/Mode/{mode}',
      LINE_SEQUENCE: '/Line/{id}/Route/Sequence/{direction}',
    }
  }
}; 