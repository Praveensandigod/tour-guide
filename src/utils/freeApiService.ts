
import { supabase } from '@/integrations/supabase/client';

// Nominatim API for geocoding and search
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Foursquare API
const FOURSQUARE_BASE_URL = 'https://api.foursquare.com/v3';

// OpenRouteService API
const OPENROUTE_BASE_URL = 'https://api.openrouteservice.org';

let cachedOpenRouteKey: string | null = null;
let cachedFoursquareKey: string | null = null;

const getOpenRouteKey = async (): Promise<string | null> => {
  if (cachedOpenRouteKey) return cachedOpenRouteKey;
  
  try {
    const { data, error } = await supabase.functions.invoke('get-openroute-key');
    if (error) throw error;
    cachedOpenRouteKey = data.apiKey;
    return cachedOpenRouteKey;
  } catch (error) {
    console.error('Error getting OpenRoute key:', error);
    return null;
  }
};

const getFoursquareKey = async (): Promise<string | null> => {
  if (cachedFoursquareKey) return cachedFoursquareKey;
  
  try {
    const { data, error } = await supabase.functions.invoke('get-foursquare-key');
    if (error) throw error;
    cachedFoursquareKey = data.apiKey;
    return cachedFoursquareKey;
  } catch (error) {
    console.error('Error getting Foursquare key:', error);
    return null;
  }
};

export const freeApiService = {
  // Search for places using Nominatim
  searchPlaces: async (query: string) => {
    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`
      );
      const data = await response.json();
      
      return {
        results: data.map((place: any) => ({
          place_id: place.place_id,
          name: place.display_name,
          formatted_address: place.display_name,
          geometry: {
            location: {
              lat: parseFloat(place.lat),
              lng: parseFloat(place.lon)
            }
          },
          photos: [],
          rating: 0,
          types: place.type ? [place.type] : []
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

  // Search for tourist places using Foursquare
  searchTouristPlaces: async (cityName: string) => {
    try {
      const apiKey = await getFoursquareKey();
      if (!apiKey) {
        console.log('Foursquare API key not available, using Nominatim fallback');
        return freeApiService.searchPlaces(`${cityName} tourist attractions`);
      }

      const response = await fetch(
        `${FOURSQUARE_BASE_URL}/places/search?query=${encodeURIComponent(cityName + ' tourist attractions')}&limit=20`,
        {
          headers: {
            'Authorization': apiKey,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Foursquare API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        results: data.results?.map((place: any) => ({
          place_id: place.fsq_id,
          name: place.name,
          formatted_address: place.location?.formatted_address || place.location?.address || '',
          geometry: {
            location: {
              lat: place.geocodes?.main?.latitude || 0,
              lng: place.geocodes?.main?.longitude || 0
            }
          },
          rating: place.rating || 0,
          photos: place.photos?.map((photo: any) => ({
            photo_reference: photo.id,
            html_attributions: [],
            height: photo.height,
            width: photo.width
          })) || [],
          types: place.categories?.map((cat: any) => cat.name) || []
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
      const apiKey = await getOpenRouteKey();
      if (!apiKey) {
        throw new Error('OpenRoute API key not available');
      }

      // First geocode the addresses
      const originGeocode = await freeApiService.geocodeAddress(origin);
      const destGeocode = await freeApiService.geocodeAddress(destination);

      if (originGeocode.status !== 'OK' || destGeocode.status !== 'OK') {
        throw new Error('Could not geocode addresses');
      }

      const originCoords = originGeocode.results[0].geometry.location;
      const destCoords = destGeocode.results[0].geometry.location;

      const response = await fetch(
        `${OPENROUTE_BASE_URL}/v2/directions/driving-car?api_key=${apiKey}&start=${originCoords.lng},${originCoords.lat}&end=${destCoords.lng},${destCoords.lat}`
      );

      if (!response.ok) {
        throw new Error(`OpenRoute API error: ${response.status}`);
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
            }]
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
      const apiKey = await getFoursquareKey();
      if (!apiKey) {
        throw new Error('Foursquare API key not available');
      }

      const response = await fetch(
        `${FOURSQUARE_BASE_URL}/places/${placeId}`,
        {
          headers: {
            'Authorization': apiKey,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Foursquare API error: ${response.status}`);
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
        rating: place.rating || 0,
        photos: place.photos?.map((photo: any) => ({
          photo_reference: photo.id,
          html_attributions: [],
          height: photo.height,
          width: photo.width
        })) || [],
        types: place.categories?.map((cat: any) => cat.name) || [],
        opening_hours: place.hours ? {
          open_now: place.hours.open_now || false,
          weekday_text: place.hours.display || []
        } : undefined,
        website: place.website,
        phone: place.tel
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  },

  // Get place photos using Foursquare
  getPlacePhotos: async (placeId: string) => {
    try {
      const apiKey = await getFoursquareKey();
      if (!apiKey) {
        return [];
      }

      const response = await fetch(
        `${FOURSQUARE_BASE_URL}/places/${placeId}/photos`,
        {
          headers: {
            'Authorization': apiKey,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Foursquare API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.map((photo: any) => ({
        photo_reference: photo.id,
        html_attributions: [],
        height: photo.height,
        width: photo.width,
        url: `${photo.prefix}original${photo.suffix}`
      }));
    } catch (error) {
      console.error('Error getting place photos:', error);
      return [];
    }
  },

  // Get photo URL (for compatibility)
  getPhotoUrl: async (photoReference: string) => {
    // For free APIs, this would return the direct URL if available
    // This is a placeholder implementation
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
          name: place.display_name,
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
