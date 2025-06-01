
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Google Places service functions
export const googlePlacesService = {
  searchPlaces: async (query: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-places-service', {
        body: { action: 'search_places', query }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching places:', error);
      return null;
    }
  },

  getPlaceDetails: async (placeId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-places-service', {
        body: { action: 'place_details', placeId }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  },

  getDirections: async (origin: string, destination: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-places-service', {
        body: { action: 'get_directions', origin, destination }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting directions:', error);
      return null;
    }
  },

  getPhotoUrl: async (photoReference: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-places-service', {
        body: { action: 'get_photo', query: photoReference }
      });
      
      if (error) throw error;
      return data.photo_url;
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return null;
    }
  },

  autocomplete: async (input: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-places-service', {
        body: { action: 'autocomplete', query: input }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting autocomplete:', error);
      return null;
    }
  }
};

// Create a service to load Google Maps script
export const useGoogleMapsApi = (apiKey: string | null) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoadError(new Error("API key is required"));
      return;
    }

    const googleMapsScriptId = 'google-maps-script';
    
    // Check if the script already exists
    if (document.getElementById(googleMapsScriptId)) {
      setIsLoaded(true);
      return;
    }

    // Set a global callback function that Google Maps will call
    window.googleMapsCallback = () => {
      setIsLoaded(true);
    };

    const script = document.createElement('script');
    script.id = googleMapsScriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,directions,geocoding&v=weekly&callback=googleMapsCallback`;
    script.async = true;
    script.defer = true;

    script.onerror = (error) => {
      setLoadError(new Error('Google Maps script failed to load'));
      console.error('Google Maps script failed to load', error);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup function
      window.googleMapsCallback = null;
      const scriptElement = document.getElementById(googleMapsScriptId);
      if (scriptElement) {
        document.head.removeChild(scriptElement);
      }
    };
  }, [apiKey]);

  return { isLoaded, loadError };
};

// Enhanced place autocomplete hook
export const usePlaceAutocomplete = (input: string, apiKey: string | null) => {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchSuggestions = useCallback(async () => {
    if (!apiKey || input.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Use our backend service for autocomplete
      const data = await googlePlacesService.autocomplete(input);
      
      if (data && data.predictions) {
        setSuggestions(data.predictions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [input, apiKey]);

  useEffect(() => {
    if (input.length >= 3) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [input, fetchSuggestions]);

  return { suggestions, isLoading, error };
};

// Enhanced geocoding service
export const getCoordinatesFromPlace = async (placeName: string, apiKey: string) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        placeName
      )}&key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  } catch (error) {
    console.error("Error getting coordinates:", error);
    return null;
  }
};

// Get place details with enhanced functionality
export const getPlaceDetails = async (
  placeId: string, 
  map: google.maps.Map | null
): Promise<google.maps.places.PlaceResult | null> => {
  if (!map || !placeId) return null;
  
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(map);
    service.getDetails(
      {
        placeId: placeId,
        fields: ['name', 'geometry', 'formatted_address', 'photos', 'rating', 'types', 'opening_hours', 'website', 'reviews', 'international_phone_number']
      },
      (result, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Place details request failed: ${status}`));
        }
      }
    );
  });
};

// Enhanced directions service with turn-by-turn instructions
export const getDirectionsWithDetails = async (
  start: { lat: number; lng: number } | string, 
  end: { lat: number; lng: number } | string,
  apiKey: string
) => {
  try {
    const origin = typeof start === 'string' ? start : `${start.lat},${start.lng}`;
    const destination = typeof end === 'string' ? end : `${end.lat},${end.lng}`;
    
    const data = await googlePlacesService.getDirections(origin, destination);
    
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
