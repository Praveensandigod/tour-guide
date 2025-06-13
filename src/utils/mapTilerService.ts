
import { MAPTILER_API_KEY, OPENROUTE_API_KEY } from '@/config/apiConfig';

const MAPTILER_BASE_URL = 'https://api.maptiler.com';
const OPENROUTE_BASE_URL = 'https://api.openrouteservice.org';

interface MapTilerGeocodingResponse {
  features: Array<{
    id: string;
    place_name: string;
    properties: {
      name?: string;
      category?: string;
      address?: string;
    };
    geometry: {
      coordinates: [number, number];
    };
    context?: Array<{
      id: string;
      text: string;
    }>;
    text: string;
    place_type: string[];
  }>;
}

interface OpenRouteDirectionsResponse {
  features: Array<{
    properties: {
      segments: Array<{
        distance: number;
        duration: number;
        steps: Array<{
          distance: number;
          duration: number;
          instruction: string;
          type: number;
          way_points: [number, number];
        }>;
      }>;
      summary: {
        distance: number;
        duration: number;
      };
    };
    geometry: {
      coordinates: [number, number][];
    };
  }>;
}

class MapTilerService {
  private apiKey: string = MAPTILER_API_KEY;
  private openRouteKey: string = OPENROUTE_API_KEY;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  setOpenRouteKey(key: string) {
    this.openRouteKey = key;
  }

  async searchPlaces(query: string): Promise<any> {
    try {
      console.log('Searching places with MapTiler:', query);
      
      // Enhanced search for tourist attractions
      const touristQuery = `${query} tourist attraction monument temple museum park`;
      
      const response = await fetch(
        `${MAPTILER_BASE_URL}/geocoding/${encodeURIComponent(touristQuery)}.json?key=${this.apiKey}&types=poi&limit=20`
      );
      
      console.log('MapTiler search response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('MapTiler API error:', response.status, errorText);
        throw new Error(`MapTiler API error: ${response.status} - ${errorText}`);
      }
      
      const data: MapTilerGeocodingResponse = await response.json();
      console.log('MapTiler search results:', data);
      
      return {
        results: data.features.map(feature => ({
          place_id: feature.id,
          name: feature.properties?.name || feature.text,
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
            photo_reference: `maptiler_${feature.id}`,
            width: 400,
            height: 300
          }]
        }))
      };
    } catch (error) {
      console.error('Error searching places with MapTiler:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    try {
      console.log('Getting place details for:', placeId);
      
      // For MapTiler, we'll use reverse geocoding if we have coordinates
      // or search if we have a place name
      const response = await fetch(
        `${MAPTILER_BASE_URL}/geocoding/${encodeURIComponent(placeId)}.json?key=${this.apiKey}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('MapTiler API error:', response.status, errorText);
        throw new Error(`MapTiler API error: ${response.status} - ${errorText}`);
      }
      
      const data: MapTilerGeocodingResponse = await response.json();
      const feature = data.features[0];
      
      if (!feature) {
        throw new Error('Place not found');
      }
      
      return {
        place_id: feature.id,
        name: feature.properties?.name || feature.text,
        formatted_address: feature.place_name,
        geometry: {
          location: {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0]
          }
        },
        rating: Math.random() * 2 + 3,
        photos: [{
          photo_reference: `maptiler_${feature.id}`,
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

  async getDirections(origin: string, destination: string): Promise<any> {
    try {
      console.log('Getting directions with OpenRouteService from', origin, 'to', destination);
      
      // First geocode the origin and destination
      const [originCoords, destCoords] = await Promise.all([
        this.geocodeAddress(origin),
        this.geocodeAddress(destination)
      ]);

      const response = await fetch(
        `${OPENROUTE_BASE_URL}/v2/directions/driving-car/geojson`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            'Authorization': this.openRouteKey,
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify({
            coordinates: [
              [originCoords.lng, originCoords.lat],
              [destCoords.lng, destCoords.lat]
            ],
            instructions: true,
            format: 'geojson'
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouteService API error:', response.status, errorText);
        throw new Error(`OpenRouteService API error: ${response.status} - ${errorText}`);
      }
      
      const data: OpenRouteDirectionsResponse = await response.json();
      console.log('OpenRouteService directions response:', data);
      
      // Convert to expected format
      const feature = data.features[0];
      if (!feature) {
        throw new Error('No route found');
      }

      return {
        routes: [{
          distance: feature.properties.summary.distance,
          duration: feature.properties.summary.duration,
          geometry: {
            coordinates: feature.geometry.coordinates
          },
          legs: [{
            distance: feature.properties.summary.distance,
            duration: feature.properties.summary.duration,
            steps: feature.properties.segments[0]?.steps.map(step => ({
              distance: step.distance,
              duration: step.duration,
              instruction: step.instruction,
              maneuver: {
                type: step.type.toString(),
                location: step.way_points
              }
            })) || []
          }]
        }]
      };
    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      console.log('Geocoding address with MapTiler:', address);
      const response = await fetch(
        `${MAPTILER_BASE_URL}/geocoding/${encodeURIComponent(address)}.json?key=${this.apiKey}&limit=1`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('MapTiler Geocoding API error:', response.status, errorText);
        throw new Error(`MapTiler Geocoding API error: ${response.status} - ${errorText}`);
      }
      
      const data: MapTilerGeocodingResponse = await response.json();
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
        `${MAPTILER_BASE_URL}/geocoding/${lng},${lat}.json?key=${this.apiKey}&limit=1`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('MapTiler Reverse Geocoding API error:', response.status, errorText);
        throw new Error(`MapTiler Reverse Geocoding API error: ${response.status} - ${errorText}`);
      }
      
      const data: MapTilerGeocodingResponse = await response.json();
      const feature = data.features[0];
      
      return feature ? feature.place_name : 'Unknown location';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Unknown location';
    }
  }

  async getPhotoUrl(photoReference: string): Promise<string> {
    try {
      const placeName = photoReference.replace('maptiler_', '');
      const searchTerms = `${placeName} landmark architecture building tourist attraction`;
      return `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerms)}`;
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return 'https://source.unsplash.com/400x300/?landmark';
    }
  }
}

export const mapTilerService = new MapTilerService();
