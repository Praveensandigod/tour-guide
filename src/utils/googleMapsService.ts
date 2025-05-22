import { useState, useEffect, useCallback } from 'react';

// Create a service to load Google Maps script
export const useGoogleMapsApi = (apiKey: string) => {
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

    const script = document.createElement('script');
    script.id = googleMapsScriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,directions,geocoding&v=weekly&callback=googleMapsCallback`;
    script.async = true;
    script.defer = true;

    // Define the callback function
    window.googleMapsCallback = () => {
      setIsLoaded(true);
    };

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

// Geocoding service
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

// Get directions between two points
export const getDirections = async (
  start: { lat: number; lng: number }, 
  end: { lat: number; lng: number },
  apiKey: string
) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&key=${apiKey}`
    );
    
    return await response.json();
  } catch (error) {
    console.error("Error getting directions:", error);
    return null;
  }
};

// Custom hook for place autocomplete
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
      // Check if Google Maps API is loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        const results = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
          autocompleteService.getPlacePredictions(
            {
              input,
              componentRestrictions: { country: 'in' }, // Restrict to India
              types: ['tourist_attraction', 'point_of_interest', 'establishment', 'natural_feature'],
            },
            (predictions, status) => {
              if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
                reject(new Error(`Place autocomplete failed: ${status}`));
                return;
              }
              resolve(predictions);
            }
          );
        });
        
        setSuggestions(results);
      } else {
        setSuggestions([]);
        setError(new Error("Google Maps API not loaded"));
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

// Get place details
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
        fields: ['name', 'geometry', 'formatted_address', 'photos', 'rating', 'types', 'opening_hours', 'website']
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
