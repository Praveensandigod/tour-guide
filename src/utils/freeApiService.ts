
import { supabase } from '@/integrations/supabase/client';

// Nominatim API for geocoding (completely free, no API key required)
export const nominatimService = {
  searchPlaces: async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1&extratags=1`
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
          rating: Math.random() * 2 + 3, // Placeholder rating
          photos: [], // Will be enhanced with Foursquare
          types: place.type ? [place.type] : ['establishment']
        })),
        status: 'OK'
      };
    } catch (error) {
      console.error('Error with Nominatim search:', error);
      return { results: [], status: 'ERROR' };
    }
  },

  searchTouristPlaces: async (cityName: string) => {
    try {
      const queries = [
        `${cityName} tourist attractions`,
        `${cityName} museums`,
        `${cityName} landmarks`,
        `${cityName} temples`,
        `${cityName} parks`
      ];
      
      const allResults = await Promise.all(
        queries.map(async (query) => {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&extratags=1`
          );
          return response.json();
        })
      );
      
      const combinedResults = allResults.flat();
      const uniqueResults = combinedResults.filter((place, index, self) => 
        index === self.findIndex(p => p.place_id === place.place_id)
      );
      
      return {
        results: uniqueResults.map((place: any) => ({
          place_id: place.place_id,
          name: place.display_name.split(',')[0],
          formatted_address: place.display_name,
          geometry: {
            location: {
              lat: parseFloat(place.lat),
              lng: parseFloat(place.lon)
            }
          },
          rating: Math.random() * 2 + 3,
          photos: [],
          types: ['tourist_attraction']
        })),
        status: 'OK'
      };
    } catch (error) {
      console.error('Error searching tourist places:', error);
      return { results: [], status: 'ERROR' };
    }
  }
};

// OpenRouteService for directions (free tier: 2000 requests/day)
export const openRouteService = {
  getDirections: async (origin: string, destination: string) => {
    try {
      // Get API key from Supabase secrets
      const { data: secretData } = await supabase.functions.invoke('get-openroute-key');
      const apiKey = secretData?.apiKey || 'your-openroute-api-key'; // Fallback
      
      // First geocode the addresses
      const originCoords = await nominatimService.geocodeAddress(origin);
      const destCoords = await nominatimService.geocodeAddress(destination);
      
      if (!originCoords || !destCoords) {
        throw new Error('Could not geocode addresses');
      }
      
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${originCoords.lng},${originCoords.lat}&end=${destCoords.lng},${destCoords.lat}`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const route = data.features[0];
        return {
          routes: [{
            legs: [{
              distance: { text: `${Math.round(route.properties.segments[0].distance / 1000)} km` },
              duration: { text: `${Math.round(route.properties.segments[0].duration / 60)} min` },
              steps: route.properties.segments[0].steps.map((step: any) => ({
                instructions: step.instruction,
                distance: { text: `${Math.round(step.distance)} m` }
              }))
            }],
            overview_polyline: { points: route.geometry.coordinates }
          }],
          status: 'OK'
        };
      }
      
      return { routes: [], status: 'ZERO_RESULTS' };
    } catch (error) {
      console.error('Error getting directions:', error);
      return { routes: [], status: 'ERROR' };
    }
  }
};

// Add geocoding helper
nominatimService.geocodeAddress = async (address: string) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    );
    const data = await response.json();
    
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Foursquare Places API for enhanced place details and photos
export const foursquareService = {
  getPlaceDetails: async (placeName: string, lat?: number, lng?: number) => {
    try {
      // Get API key from Supabase secrets
      const { data: secretData } = await supabase.functions.invoke('get-foursquare-key');
      const apiKey = secretData?.apiKey || 'your-foursquare-api-key'; // Fallback
      
      let searchUrl = `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(placeName)}&limit=1`;
      
      if (lat && lng) {
        searchUrl += `&ll=${lat},${lng}&radius=1000`;
      }
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const place = data.results[0];
        
        // Get place photos
        let photos = [];
        try {
          const photosResponse = await fetch(
            `https://api.foursquare.com/v3/places/${place.fsq_id}/photos?limit=5`,
            {
              headers: {
                'Authorization': apiKey,
                'Accept': 'application/json'
              }
            }
          );
          const photosData = await photosResponse.json();
          photos = photosData.map((photo: any) => `${photo.prefix}400x300${photo.suffix}`);
        } catch (error) {
          console.error('Error getting photos:', error);
        }
        
        return {
          name: place.name,
          formatted_address: place.location?.formatted_address || '',
          rating: place.rating || Math.random() * 2 + 3,
          photos: photos,
          website: place.website,
          place_id: place.fsq_id,
          geometry: {
            location: {
              lat: place.geocodes?.main?.latitude,
              lng: place.geocodes?.main?.longitude
            }
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting Foursquare place details:', error);
      return null;
    }
  }
};

// Combined free service that replaces Google Maps
export const freeApiService = {
  searchPlaces: nominatimService.searchPlaces,
  searchTouristPlaces: nominatimService.searchTouristPlaces,
  
  getPlaceDetails: async (placeId: string) => {
    // Try to enhance with Foursquare data
    const placeName = placeId; // Use place name for Foursquare search
    return await foursquareService.getPlaceDetails(placeName);
  },
  
  getDirections: openRouteService.getDirections,
  
  getPhotoUrl: async (photoReference: string) => {
    // For free APIs, photos come as direct URLs
    return photoReference;
  },
  
  autocomplete: nominatimService.searchPlaces
};
