
import { freeApiService } from './freeApiService';

// Free Maps service using OpenStreetMap, Nominatim, OpenRouteService, and Foursquare
export const mapsService = {
  searchPlaces: async (query: string) => {
    console.log('Searching places with free APIs:', query);
    return await freeApiService.searchPlaces(query);
  },

  searchTouristPlaces: async (cityName: string) => {
    console.log('Searching tourist places with free APIs:', cityName);
    return await freeApiService.searchTouristPlaces(cityName);
  },

  getPlaceDetails: async (placeId: string) => {
    console.log('Getting place details with free APIs:', placeId);
    return await freeApiService.getPlaceDetails(placeId);
  },

  getNearbyTouristAttractions: async (lat: number, lng: number, radius: number = 5000) => {
    console.log('Getting nearby attractions with free APIs:', lat, lng);
    return await freeApiService.searchPlaces(`tourist attractions near ${lat},${lng}`);
  },

  getDirections: async (origin: string, destination: string) => {
    console.log('Getting directions with free APIs:', origin, destination);
    return await freeApiService.getDirections(origin, destination);
  },

  getPhotoUrl: async (photoReference: string, maxWidth: number = 400) => {
    console.log('Getting photo URL with free APIs:', photoReference);
    return await freeApiService.getPhotoUrl(photoReference);
  },

  autocomplete: async (input: string) => {
    console.log('Autocomplete with free APIs:', input);
    const results = await freeApiService.autocomplete(input);
    return {
      predictions: results.results?.map((place: any) => ({
        description: place.formatted_address,
        place_id: place.place_id,
        structured_formatting: {
          main_text: place.name,
          secondary_text: place.formatted_address
        }
      })) || []
    };
  },

  geocodeAddress: async (address: string) => {
    console.log('Geocoding address with free APIs:', address);
    return await freeApiService.geocodeAddress(address);
  }
};

// Enhanced geocoding service
export const getCoordinatesFromPlace = async (placeName: string) => {
  try {
    const result = await freeApiService.geocodeAddress(placeName);
    
    if (result.results && result.results.length > 0) {
      const location = result.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  } catch (error) {
    console.error("Error getting coordinates:", error);
    return null;
  }
};

// Enhanced directions service with turn-by-turn instructions
export const getDirectionsWithDetails = async (
  start: { lat: number; lng: number } | string, 
  end: { lat: number; lng: number } | string
) => {
  try {
    const origin = typeof start === 'string' ? start : `${start.lat},${start.lng}`;
    const destination = typeof end === 'string' ? end : `${end.lat},${end.lng}`;
    
    const data = await freeApiService.getDirections(origin, destination);
    
    if (data && data.routes && data.routes.length > 0) {
      return {
        route: data.routes[0],
        steps: data.routes[0].legs[0].steps,
        distance: data.routes[0].legs[0].distance,
        duration: data.routes[0].legs[0].duration,
        polyline: data.routes[0].overview_polyline.points
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting directions:", error);
    return null;
  }
};
