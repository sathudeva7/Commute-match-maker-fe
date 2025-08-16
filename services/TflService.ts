import { apiClient } from './ApiClient';
import { API_CONFIG } from '../constants/ApiConfig';
import { TflPlace, TflArrival } from './types/api';

class TflService {
  // Search for bus stops, stations, etc.
  async searchPlaces(query: string): Promise<TflPlace[]> {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.TFL.SEARCH_STOPS}/${encodeURIComponent(query)}`;
      const data = await apiClient.tflRequest<{ matches: TflPlace[] }>(endpoint);
      return data.matches || [];
    } catch (error) {
      console.error('TfL search error:', error);
      return [];
    }
  }

  // Get arrivals for a specific stop
  async getStopArrivals(stopId: string): Promise<TflArrival[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.TFL.STOP_ARRIVALS.replace('{id}', stopId);
      const data = await apiClient.tflRequest<TflArrival[]>(endpoint);
      return data || [];
    } catch (error) {
      console.error('TfL arrivals error:', error);
      return [];
    }
  }

  // Get nearby stops
  async getNearbyStops(
    latitude: number, 
    longitude: number, 
    radius: number = 300
  ): Promise<TflPlace[]> {
    try {
      const params = {
        lat: latitude.toString(),
        lon: longitude.toString(),
        stopTypes: 'NaptanPublicBusCoachTram',
        radius: radius.toString(),
      };
      
      const data = await apiClient.tflRequest<{ stopPoints: TflPlace[] }>(
        API_CONFIG.ENDPOINTS.TFL.NEARBY_STOPS,
        params
      );
      
      return data.stopPoints || [];
    } catch (error) {
      console.error('TfL nearby stops error:', error);
      return [];
    }
  }

  // Get journey options between two points
  async getJourneyOptions(fromId: string, toId: string): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.TFL.JOURNEY_PLANNER
        .replace('{from}', fromId)
        .replace('{to}', toId);
      
      const data = await apiClient.tflRequest<any>(endpoint);
      return data.journeys || [];
    } catch (error) {
      console.error('TfL journey planner error:', error);
      return [];
    }
  }

  // Get routes for a specific transport mode
  async getRoutesByMode(mode: 'bus' | 'tube' | 'overground'): Promise<any[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.TFL.LINE_ROUTES.replace('{mode}', mode);
      const data = await apiClient.tflRequest<any[]>(endpoint);
      return data || [];
    } catch (error) {
      console.error('TfL routes error:', error);
      return [];
    }
  }

  // Get stations for a specific line
  async getLineStations(lineId: string, direction: 'inbound' | 'outbound' = 'inbound'): Promise<any[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.TFL.LINE_SEQUENCE
        .replace('{id}', lineId)
        .replace('{direction}', direction);
      
      const data = await apiClient.tflRequest<any>(endpoint);
      return data.stopPointSequences?.[0]?.stopPoint || [];
    } catch (error) {
      console.error('TfL line stations error:', error);
      return [];
    }
  }
}

export const tflService = new TflService(); 