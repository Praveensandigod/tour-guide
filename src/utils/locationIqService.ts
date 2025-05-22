
import { useState, useEffect, useCallback } from 'react';

// Create a service to load LocationIQ Maps script
export const useLocationIqApi = (apiKey: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoadError(new Error("API key is required"));
      return;
    }

    const locationIqScriptId = 'locationiq-maps-script';
    
    // Check if the script already exists
    if (document.getElementById(locationIqScriptId)) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = locationIqScriptId;
    script.src = `https://maps.locationiq.com/v3/libs/leaflet-geocoder/1.9.6/leaflet-geocoder-locationiq.min.js?key=${apiKey}`;
    script.async = true;
    script.defer = true;

    // Load leaflet first
    const leafletScript = document.createElement('script');
    leafletScript.id = 'leaflet-script';
    leafletScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    leafletScript.async = true;
    leafletScript.defer = true;

    // Load leaflet CSS
    const leafletCss = document.createElement('link');
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    
    // Load LocationIQ CSS
    const locationIqCss = document.createElement('link');
    locationIqCss.rel = 'stylesheet';
    locationIqCss.href = 'https://maps.locationiq.com/v3/libs/leaflet-geocoder/1.9.6/leaflet-geocoder-locationiq.min.css';

    // Define the callback function
    leafletScript.onload = () => {
      document.head.appendChild(script);
      document.head.appendChild(locationIqCss);
    };
    
    script.onload = () => {
      setIsLoaded(true);
      window.locationIqCallback && window.locationIqCallback();
    };

    script.onerror = (error) => {
      setLoadError(new Error('LocationIQ Maps script failed to load'));
      console.error('LocationIQ Maps script failed to load', error);
    };

    document.head.appendChild(leafletCss);
    document.head.appendChild(leafletScript);

    return () => {
      // Cleanup function
      window.locationIqCallback = null;
      const scriptElement = document.getElementById(locationIqScriptId);
      const leafletElement = document.getElementById('leaflet-script');
      if (scriptElement) {
        document.head.removeChild(scriptElement);
      }
      if (leafletElement) {
        document.head.removeChild(leafletElement);
      }
    };
  }, [apiKey]);

  return { isLoaded, loadError };
};

// Geocoding service
export const getCoordinatesFromPlace = async (placeName: string, apiKey: string) => {
  try {
    const response = await fetch(
      `https://api.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${encodeURIComponent(placeName)}&limit=1&dedupe=1&format=json`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
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
      `https://api.locationiq.com/v1/directions/driving/${start.lng},${start.lat};${end.lng},${end.lat}?key=${apiKey}&steps=true&alternatives=true&geometries=geojson&overview=full`
    );
    
    const data = await response.json();
    
    // Transform the data to a format similar to Google Maps
    if (data && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const legs = [{
        distance: { text: `${(route.distance / 1000).toFixed(2)} km`, value: route.distance },
        duration: { text: `${Math.round(route.duration / 60)} mins`, value: route.duration },
        steps: route.legs[0].steps.map((step: any) => ({
          distance: { text: `${(step.distance / 1000).toFixed(2)} km`, value: step.distance },
          duration: { text: `${Math.round(step.duration / 60)} mins`, value: step.duration },
          instructions: step.maneuver?.instruction || "Continue",
          path: step.geometry.coordinates.map((coord: [number, number]) => ({ lat: coord[1], lng: coord[0] }))
        }))
      }];
      
      return { 
        routes: [{ 
          legs,
          overview_polyline: {
            points: route.geometry.coordinates.map((coord: [number, number]) => ({ lat: coord[1], lng: coord[0] }))
          }
        }]
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting directions:", error);
    return null;
  }
};

// Define global locationIq callback interface
declare global {
  interface Window {
    locationIqCallback: (() => void) | null;
  }
}

window.locationIqCallback = null;
