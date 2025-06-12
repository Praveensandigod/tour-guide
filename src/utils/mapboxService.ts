
import { MAPBOX_API_KEY } from '@/config/apiConfig';

const MAPBOX_BASE_URL = 'https://api.mapbox.com';

interface MapboxGeocodingResponse {
  features: Array<{
    id: string;
    place_name: string;
    properties: {
      address?: string;
      category?: string;
      short_code?: string;
    };
    geometry: {
      coordinates: [number, number];
    };
    context?: Array<{
      id: string;
      text: string;
      short_code?: string;
    }>;
    text: string;
    place_type: string[];
  }>;
}

interface MapboxDirectionsResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
    };
    legs: Array<{
      distance: number;
      duration: number;
      steps: Array<{
        distance: number;
        duration: number;
        instruction: string;
        maneuver: {
          type: string;
          modifier?: string;
          location: [number, number];
        };
      }>;
    }>;
  }>;
}

class MapboxService {
  private apiKey: string = MAPBOX_API_KEY;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async searchPlaces(query: string): Promise<any> {
    try {
      console.log('Searching places with query:', query);
      const response = await fetch(
        `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.apiKey}&types=poi,place&limit=10`
      );
      
      console.log('Mapbox search response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mapbox API error:', response.status, errorText);
        throw new Error(`Mapbox API error: ${response.status} - ${errorText}`);
      }
      
      const data: MapboxGeocodingResponse = await response.json();
      console.log('Mapbox search results:', data);
      
      return {
        results: data.features.map(feature => ({
          place_id: feature.id,
          name: feature.text,
          formatted_address: feature.place_name,
          geometry: {
            location: {
              lat: feature.geometry.coordinates[1],
              lng: feature.geometry.coordinates[0]
            }
          },
          rating: Math.random() * 2 + 3, // Random rating between 3-5
          types: feature.place_type,
          photos: [{
            photo_reference: `mapbox_${feature.id}`,
            width: 400,
            height: 300
          }]
        }))
      };
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    try {
      console.log('Getting place details for:', placeId);
      const response = await fetch(
        `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(placeId)}.json?access_token=${this.apiKey}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mapbox API error:', response.status, errorText);
        throw new Error(`Mapbox API error: ${response.status} - ${errorText}`);
      }
      
      const data: MapboxGeocodingResponse = await response.json();
      const feature = data.features[0];
      
      if (!feature) {
        throw new Error('Place not found');
      }
      
      return {
        place_id: feature.id,
        name: feature.text,
        formatted_address: feature.place_name,
        geometry: {
          location: {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0]
          }
        },
        rating: Math.random() * 2 + 3,
        photos: [{
          photo_reference: `mapbox_${feature.id}`,
          width: 400,
          height: 300
        }],
        website: feature.properties?.address || '',
        types: feature.place_type
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  }

  async getPhotoUrl(photoReference: string): Promise<string> {
    try {
      const placeName = photoReference.replace('mapbox_', '');
      const searchTerms = `${placeName} landmark architecture building tourist attraction`;
      return `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerms)}`;
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return 'https://source.unsplash.com/400x300/?landmark';
    }
  }

  async getDirections(origin: string, destination: string): Promise<MapboxDirectionsResponse> {
    try {
      console.log('Getting directions from', origin, 'to', destination);
      
      // First geocode the origin and destination
      const [originCoords, destCoords] = await Promise.all([
        this.geocodeAddress(origin),
        this.geocodeAddress(destination)
      ]);

      const response = await fetch(
        `${MAPBOX_BASE_URL}/directions/v5/mapbox/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?access_token=${this.apiKey}&steps=true&geometries=geojson`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mapbox Directions API error:', response.status, errorText);
        throw new Error(`Mapbox Directions API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Directions response:', data);
      return data;
    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      console.log('Geocoding address:', address);
      const response = await fetch(
        `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.apiKey}&limit=1`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mapbox Geocoding API error:', response.status, errorText);
        throw new Error(`Mapbox Geocoding API error: ${response.status} - ${errorText}`);
      }
      
      const data: MapboxGeocodingResponse = await response.json();
      const feature = data.features[0];
      
      if (!feature) {
        throw new Error('Address not found');
      }
      
      return {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0]
      };
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.apiKey}&limit=1`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mapbox Reverse Geocoding API error:', response.status, errorText);
        throw new Error(`Mapbox Reverse Geocoding API error: ${response.status} - ${errorText}`);
      }
      
      const data: MapboxGeocodingResponse = await response.json();
      const feature = data.features[0];
      
      return feature ? feature.place_name : 'Unknown location';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Unknown location';
    }
  }
}

export const mapboxService = new MapboxService();
