
// Updated maps service that uses our new free map service
import { freeMapService } from '@/services/freeMapService';

export const mapsService = {
  searchPlaces: async (query: string) => {
    console.log('Searching places with free map service:', query);
    const results = await freeMapService.searchPlaces(query);
    return {
      results: results.map(place => ({
        place_id: place.id,
        name: place.name,
        formatted_address: place.address,
        geometry: {
          location: {
            lat: place.lat,
            lng: place.lng
          }
        },
        photos: [place.imageUrl],
        rating: place.rating,
        types: [place.category]
      })),
      status: 'OK'
    };
  },

  searchTouristPlaces: async (cityName: string) => {
    console.log('Searching tourist places with free map service:', cityName);
    const results = await freeMapService.searchTouristPlaces(cityName);
    return {
      results: results.map(place => ({
        place_id: place.id,
        name: place.name,
        formatted_address: place.address,
        geometry: {
          location: {
            lat: place.lat,
            lng: place.lng
          }
        },
        photos: [place.imageUrl],
        rating: place.rating,
        types: [place.category]
      })),
      status: 'OK'
    };
  },

  getPlaceDetails: async (placeId: string) => {
    console.log('Getting place details with free map service:', placeId);
    // For now, return basic details - could be enhanced later
    return {
      place_id: placeId,
      name: 'Place',
      formatted_address: 'Address',
      geometry: {
        location: { lat: 0, lng: 0 }
      },
      rating: 4.0,
      photos: ['https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop']
    };
  },

  getNearbyTouristAttractions: async (lat: number, lng: number, radius: number = 5000) => {
    console.log('Getting nearby attractions with free map service:', lat, lng);
    const results = await freeMapService.searchPlaces(`tourist attractions near ${lat},${lng}`);
    return {
      results: results.map(place => ({
        place_id: place.id,
        name: place.name,
        formatted_address: place.address,
        geometry: {
          location: {
            lat: place.lat,
            lng: place.lng
          }
        },
        photos: [place.imageUrl],
        rating: place.rating,
        types: [place.category]
      }))
    };
  },

  getDirections: async (origin: string, destination: string) => {
    console.log('Getting directions with free map service:', origin, destination);
    const originCoords = await freeMapService.geocode(origin);
    const destCoords = await freeMapService.geocode(destination);
    
    if (!originCoords || !destCoords) {
      return { routes: [], status: 'ZERO_RESULTS' };
    }

    const route = await freeMapService.getDirections(originCoords, destCoords);
    
    if (!route) {
      return { routes: [], status: 'ZERO_RESULTS' };
    }

    return {
      routes: [{
        legs: [{
          distance: { text: route.distance, value: 0 },
          duration: { text: route.duration, value: 0 },
          steps: route.steps.map(step => ({
            instructions: step.instruction,
            distance: { text: step.distance, value: 0 },
            duration: { text: step.duration, value: 0 }
          }))
        }],
        overview_polyline: {
          points: route.coordinates
        }
      }],
      status: 'OK'
    };
  },

  getPhotoUrl: async (photoReference: string, maxWidth: number = 400) => {
    // Return the photo reference directly (it's already a URL from Unsplash)
    return photoReference;
  },

  autocomplete: async (input: string) => {
    console.log('Autocomplete with free map service:', input);
    const results = await freeMapService.searchPlaces(input, 5);
    return {
      predictions: results.map(place => ({
        description: place.address,
        place_id: place.id,
        structured_formatting: {
          main_text: place.name,
          secondary_text: place.address
        }
      }))
    };
  },

  geocodeAddress: async (address: string) => {
    console.log('Geocoding address with free map service:', address);
    const coords = await freeMapService.geocode(address);
    
    if (coords) {
      return {
        results: [{
          geometry: {
            location: coords
          },
          formatted_address: address
        }],
        status: 'OK'
      };
    }
    
    return { results: [], status: 'ZERO_RESULTS' };
  }
};

// Enhanced geocoding service
export const getCoordinatesFromPlace = async (placeName: string) => {
  try {
    const coords = await freeMapService.geocode(placeName);
    return coords;
  } catch (error) {
    console.error("Error getting coordinates:", error);
    return null;
  }
};

// Enhanced directions service
export const getDirectionsWithDetails = async (
  start: { lat: number; lng: number } | string, 
  end: { lat: number; lng: number } | string
) => {
  try {
    let startCoords: { lat: number; lng: number };
    let endCoords: { lat: number; lng: number };

    if (typeof start === 'string') {
      const coords = await freeMapService.geocode(start);
      if (!coords) return null;
      startCoords = coords;
    } else {
      startCoords = start;
    }

    if (typeof end === 'string') {
      const coords = await freeMapService.geocode(end);
      if (!coords) return null;
      endCoords = coords;
    } else {
      endCoords = end;
    }

    const route = await freeMapService.getDirections(startCoords, endCoords);
    return route;
  } catch (error) {
    console.error("Error getting directions:", error);
    return null;
  }
};
