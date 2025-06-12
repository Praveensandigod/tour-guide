
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
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async searchPlaces(query: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Mapbox API key not set');
    }

    try {
      const response = await fetch(
        `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.apiKey}&types=poi,place&limit=10`
      );
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data: MapboxGeocodingResponse = await response.json();
      
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
    if (!this.apiKey) {
      throw new Error('Mapbox API key not set');
    }

    try {
      // For place details, we'll use the place ID to get more information
      const response = await fetch(
        `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(placeId)}.json?access_token=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
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
    // Since Mapbox doesn't have a direct photo API like Google, 
    // we'll use Unsplash to get place-related images
    try {
      const placeName = photoReference.replace('mapbox_', '');
      const unsplashUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(placeName + ' landmark building architecture')}`;
      return unsplashUrl;
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return 'https://source.unsplash.com/400x300/?landmark';
    }
  }

  async getDirections(origin: string, destination: string): Promise<MapboxDirectionsResponse> {
    if (!this.apiKey) {
      throw new Error('Mapbox API key not set');
    }

    try {
      // First geocode the origin and destination
      const [originCoords, destCoords] = await Promise.all([
        this.geocodeAddress(origin),
        this.geocodeAddress(destination)
      ]);

      const response = await fetch(
        `${MAPBOX_BASE_URL}/directions/v5/mapbox/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?access_token=${this.apiKey}&steps=true&geometries=geojson`
      );
      
      if (!response.ok) {
        throw new Error(`Mapbox Directions API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    if (!this.apiKey) {
      throw new Error('Mapbox API key not set');
    }

    try {
      const response = await fetch(
        `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.apiKey}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error(`Mapbox Geocoding API error: ${response.status}`);
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
    if (!this.apiKey) {
      throw new Error('Mapbox API key not set');
    }

    try {
      const response = await fetch(
        `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.apiKey}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error(`Mapbox Reverse Geocoding API error: ${response.status}`);
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
