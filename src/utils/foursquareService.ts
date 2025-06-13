
import { FOURSQUARE_API_KEY } from '@/config/apiConfig';

const FOURSQUARE_BASE_URL = 'https://api.foursquare.com/v3';

interface FoursquarePlace {
  fsq_id: string;
  name: string;
  location: {
    formatted_address: string;
    locality?: string;
    region?: string;
    country?: string;
  };
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    };
  };
  categories: Array<{
    id: number;
    name: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }>;
  rating?: number;
  price?: number;
  photos?: Array<{
    id: string;
    prefix: string;
    suffix: string;
    width: number;
    height: number;
  }>;
  website?: string;
  tel?: string;
  hours?: {
    display: string;
    is_local_holiday: boolean;
    open_now: boolean;
  };
}

interface FoursquareSearchResponse {
  results: FoursquarePlace[];
}

class FoursquareService {
  private apiKey: string = FOURSQUARE_API_KEY;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  private getHeaders() {
    return {
      'Accept': 'application/json',
      'Authorization': this.apiKey
    };
  }

  async searchPlaces(query: string, location?: string): Promise<any> {
    try {
      console.log('Searching places with Foursquare:', query);
      
      let searchQuery = query;
      if (location) {
        searchQuery = `tourist attractions in ${location}`;
      } else {
        // Extract city name from query and search for tourist attractions
        const cityMatch = query.match(/^([^,]+)/);
        if (cityMatch) {
          const cityName = cityMatch[1].trim();
          searchQuery = `tourist attractions in ${cityName}`;
        }
      }
      
      const params = new URLSearchParams({
        query: searchQuery,
        categories: '10000,12000,16000,17000,18000,19000', // Tourist attractions, Arts, Landmarks, Outdoors, Sports, Travel
        limit: '20'
      });
      
      const response = await fetch(
        `${FOURSQUARE_BASE_URL}/places/search?${params.toString()}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );
      
      console.log('Foursquare search response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Foursquare API error:', response.status, errorText);
        throw new Error(`Foursquare API error: ${response.status} - ${errorText}`);
      }
      
      const data: FoursquareSearchResponse = await response.json();
      console.log('Foursquare search results:', data);
      
      return {
        results: data.results.map(place => ({
          place_id: place.fsq_id,
          name: place.name,
          formatted_address: place.location.formatted_address,
          geometry: {
            location: {
              lat: place.geocodes.main.latitude,
              lng: place.geocodes.main.longitude
            }
          },
          rating: place.rating || (Math.random() * 2 + 3),
          photos: place.photos?.map(photo => ({
            photo_reference: `${photo.prefix}${photo.width}x${photo.height}${photo.suffix}`,
            width: photo.width,
            height: photo.height
          })) || [],
          types: place.categories.map(cat => cat.name.toLowerCase()),
          website: place.website,
          phone: place.tel,
          opening_hours: place.hours
        }))
      };
    } catch (error) {
      console.error('Error searching places with Foursquare:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    try {
      console.log('Getting place details for:', placeId);
      
      const response = await fetch(
        `${FOURSQUARE_BASE_URL}/places/${placeId}?fields=fsq_id,name,location,geocodes,categories,rating,price,photos,website,tel,hours`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Foursquare API error:', response.status, errorText);
        throw new Error(`Foursquare API error: ${response.status} - ${errorText}`);
      }
      
      const place: FoursquarePlace = await response.json();
      
      return {
        place_id: place.fsq_id,
        name: place.name,
        formatted_address: place.location.formatted_address,
        geometry: {
          location: {
            lat: place.geocodes.main.latitude,
            lng: place.geocodes.main.longitude
          }
        },
        rating: place.rating || (Math.random() * 2 + 3),
        photos: place.photos?.map(photo => ({
          photo_reference: `${photo.prefix}${photo.width}x${photo.height}${photo.suffix}`,
          width: photo.width,
          height: photo.height,
          url: `${photo.prefix}400x300${photo.suffix}`
        })) || [],
        website: place.website,
        international_phone_number: place.tel,
        opening_hours: place.hours,
        types: place.categories.map(cat => cat.name.toLowerCase())
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  }

  async getPhotoUrl(photoReference: string): Promise<string> {
    // For Foursquare, the photo reference is already a complete URL
    return photoReference;
  }
}

export const foursquareService = new FoursquareService();
