
// Nominatim API for geocoding and search
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Foursquare API with your key
const FOURSQUARE_BASE_URL = 'https://api.foursquare.com/v3';
const FOURSQUARE_API_KEY = 'fsq3ZQ214FTWR46oluj4T5lE3FK0lQjU+kancYbVa3hLZY4=';

// OpenRouteService API with your key
const OPENROUTE_BASE_URL = 'https://api.openrouteservice.org';
const OPENROUTE_API_KEY = '5b3ce3597851110001cf6248953e793ca59140e9b20953797ecb4f89';

// Generate random budget based on place type and distance
const generateBudget = (types: string[] = [], distance?: number): string => {
  const budgets = ['low', 'medium', 'high'];
  
  // Luxury places
  if (types.some(type => ['hotel', 'resort', 'casino', 'spa'].includes(type))) {
    return 'high';
  }
  
  // Budget places
  if (types.some(type => ['food', 'street_food', 'park', 'beach'].includes(type))) {
    return 'low';
  }
  
  // Default to random or medium
  return budgets[Math.floor(Math.random() * budgets.length)];
};

// Get Unsplash image based on place type
const getUnsplashImage = (types: string[] = [], name: string = ''): string => {
  const lowerName = name.toLowerCase();
  
  if (types.includes('temple') || types.includes('church') || types.includes('mosque') || lowerName.includes('temple')) {
    return `https://images.unsplash.com/photo-1466442929976-97f336a657be?w=400&h=300&fit=crop`;
  }
  if (types.includes('museum') || types.includes('historical') || lowerName.includes('museum') || lowerName.includes('fort')) {
    return `https://images.unsplash.com/photo-1527576539890-dfa815648363?w=400&h=300&fit=crop`;
  }
  if (types.includes('park') || types.includes('garden') || lowerName.includes('park') || lowerName.includes('garden')) {
    return `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop`;
  }
  if (types.includes('restaurant') || types.includes('food') || lowerName.includes('restaurant')) {
    return `https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop`;
  }
  if (types.includes('hotel') || types.includes('lodging') || lowerName.includes('hotel') || lowerName.includes('palace')) {
    return `https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop`;
  }
  if (lowerName.includes('beach') || lowerName.includes('lake') || lowerName.includes('river')) {
    return `https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=300&fit=crop`;
  }
  if (lowerName.includes('mountain') || lowerName.includes('hill') || lowerName.includes('falls')) {
    return `https://images.unsplash.com/photo-1469041797191-50ace28483c3?w=400&h=300&fit=crop`;
  }
  
  // Default image
  return `https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop`;
};

export const freeApiService = {
  // Search for places using Nominatim
  searchPlaces: async (query: string) => {
    try {
      console.log('Searching places with Nominatim:', query);
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`
      );
      const data = await response.json();
      
      return {
        results: data.map((place: any) => ({
          place_id: place.place_id,
          name: place.display_name.split(',')[0],
          formatted_address: place.display_name,
          geometry: {
            location: {
              lat: parseFloat(place.lat),
              lng: parseFloat(place.lon)
            }
          },
          photos: [getUnsplashImage(place.type ? [place.type] : [], place.display_name)],
          rating: 3.5 + Math.random() * 1.5, // Random rating between 3.5-5.0
          types: place.type ? [place.type] : [],
          budget: generateBudget(place.type ? [place.type] : [])
        })),
        status: 'OK'
      };
    } catch (error) {
      console.error('Error searching places:', error);
      return { results: [], status: 'ERROR' };
    }
  },

  // Geocode address using Nominatim
  geocodeAddress: async (address: string) => {
    try {
      console.log('Geocoding address with Nominatim:', address);
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const place = data[0];
        return {
          results: [{
            geometry: {
              location: {
                lat: parseFloat(place.lat),
                lng: parseFloat(place.lon)
              }
            },
            formatted_address: place.display_name
          }],
          status: 'OK'
        };
      }
      
      return { results: [], status: 'ZERO_RESULTS' };
    } catch (error) {
      console.error('Error geocoding address:', error);
      return { results: [], status: 'ERROR' };
    }
  },

  // Search for tourist places using Foursquare API
  searchTouristPlaces: async (cityName: string) => {
    try {
      console.log('Searching tourist places with Foursquare:', cityName);
      
      // First, get city coordinates
      const cityGeocode = await freeApiService.geocodeAddress(cityName);
      if (cityGeocode.status !== 'OK' || cityGeocode.results.length === 0) {
        console.log('Could not geocode city, falling back to Nominatim search');
        return freeApiService.searchPlaces(`${cityName} tourist attractions`);
      }
      
      const { lat, lng } = cityGeocode.results[0].geometry.location;
      
      // Search for tourist attractions near the city
      const categories = '10000,12000,13000,16000'; // Arts, Entertainment, Landmarks, Travel
      const response = await fetch(
        `${FOURSQUARE_BASE_URL}/places/search?ll=${lat},${lng}&radius=50000&categories=${categories}&limit=20`,
        {
          headers: {
            'Authorization': FOURSQUARE_API_KEY,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.log('Foursquare API error, falling back to Nominatim');
        return freeApiService.searchPlaces(`${cityName} tourist attractions`);
      }

      const data = await response.json();
      
      return {
        results: data.results?.map((place: any) => ({
          place_id: place.fsq_id,
          name: place.name,
          formatted_address: place.location?.formatted_address || place.location?.address || `${cityName}`,
          geometry: {
            location: {
              lat: place.geocodes?.main?.latitude || lat,
              lng: place.geocodes?.main?.longitude || lng
            }
          },
          rating: place.rating || (3.5 + Math.random() * 1.5),
          photos: [getUnsplashImage(place.categories?.map((cat: any) => cat.name) || [], place.name)],
          types: place.categories?.map((cat: any) => cat.name) || ['tourist_attraction'],
          budget: generateBudget(place.categories?.map((cat: any) => cat.name) || [])
        })) || [],
        status: 'OK'
      };
    } catch (error) {
      console.error('Error searching tourist places:', error);
      // Fallback to Nominatim
      return freeApiService.searchPlaces(`${cityName} tourist attractions`);
    }
  },

  // Get directions using OpenRouteService
  getDirections: async (origin: string, destination: string) => {
    try {
      console.log('Getting directions with OpenRouteService from', origin, 'to', destination);

      // First geocode the addresses
      const originGeocode = await freeApiService.geocodeAddress(origin);
      const destGeocode = await freeApiService.geocodeAddress(destination);

      if (originGeocode.status !== 'OK' || destGeocode.status !== 'OK') {
        console.error('Could not geocode addresses');
        return { routes: [], status: 'ZERO_RESULTS' };
      }

      const originCoords = originGeocode.results[0].geometry.location;
      const destCoords = destGeocode.results[0].geometry.location;

      const directionsUrl = `${OPENROUTE_BASE_URL}/v2/directions/driving-car?api_key=${OPENROUTE_API_KEY}&start=${originCoords.lng},${originCoords.lat}&end=${destCoords.lng},${destCoords.lat}`;

      const response = await fetch(directionsUrl);

      if (!response.ok) {
        console.error(`OpenRoute API error: ${response.status}`);
        return { routes: [], status: 'ERROR' };
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const route = data.features[0];
        const summary = route.properties.summary;
        
        return {
          routes: [{
            legs: [{
              distance: {
                text: `${(summary.distance / 1000).toFixed(1)} km`,
                value: summary.distance
              },
              duration: {
                text: `${Math.round(summary.duration / 60)} min`,
                value: summary.duration
              },
              steps: route.properties.segments?.[0]?.steps?.map((step: any, index: number) => ({
                instructions: step.instruction || `Step ${index + 1}`,
                distance: {
                  text: `${(step.distance / 1000).toFixed(1)} km`,
                  value: step.distance
                },
                duration: {
                  text: `${Math.round(step.duration / 60)} min`,
                  value: step.duration
                },
                maneuver: step.type || 'straight'
              })) || []
            }],
            overview_polyline: {
              points: route.geometry
            }
          }],
          status: 'OK'
        };
      }
      
      return { routes: [], status: 'ZERO_RESULTS' };
    } catch (error) {
      console.error('Error getting directions:', error);
      return { routes: [], status: 'ERROR' };
    }
  },

  // Get place details using Foursquare
  getPlaceDetails: async (placeId: string) => {
    try {
      console.log('Getting place details with Foursquare:', placeId);
      const response = await fetch(
        `${FOURSQUARE_BASE_URL}/places/${placeId}`,
        {
          headers: {
            'Authorization': FOURSQUARE_API_KEY,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.log('Foursquare place details error, returning basic info');
        return null;
      }

      const place = await response.json();
      
      return {
        place_id: place.fsq_id,
        name: place.name,
        formatted_address: place.location?.formatted_address || place.location?.address || '',
        geometry: {
          location: {
            lat: place.geocodes?.main?.latitude || 0,
            lng: place.geocodes?.main?.longitude || 0
          }
        },
        rating: place.rating || (3.5 + Math.random() * 1.5),
        photos: [getUnsplashImage(place.categories?.map((cat: any) => cat.name) || [], place.name)],
        types: place.categories?.map((cat: any) => cat.name) || [],
        opening_hours: place.hours ? {
          open_now: place.hours.open_now || false,
          weekday_text: place.hours.display || []
        } : undefined,
        website: place.website,
        phone: place.tel,
        budget: generateBudget(place.categories?.map((cat: any) => cat.name) || [])
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  },

  // Get photo URL (returns Unsplash image)
  getPhotoUrl: async (photoReference: string) => {
    // For free APIs, return the Unsplash URL directly
    return photoReference;
  },

  // Autocomplete functionality using Nominatim
  autocomplete: async (input: string) => {
    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(input)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      
      return {
        results: data.map((place: any) => ({
          place_id: place.place_id,
          name: place.display_name.split(',')[0],
          formatted_address: place.display_name,
          geometry: {
            location: {
              lat: parseFloat(place.lat),
              lng: parseFloat(place.lon)
            }
          }
        }))
      };
    } catch (error) {
      console.error('Error in autocomplete:', error);
      return { results: [] };
    }
  }
};
