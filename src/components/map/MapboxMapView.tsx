
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MapboxMapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title: string;
    description?: string;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
}

const MapboxMapView: React.FC<MapboxMapViewProps> = ({
  center = [78.9629, 20.5937], // Default to India (lng, lat for Mapbox)
  zoom = 5,
  markers = [],
  onMapClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Check if we have a token in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
      setShowTokenInput(false);
    }
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken.trim()) return;

    try {
      mapboxgl.accessToken = mapboxToken.trim();
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: zoom,
        attributionControl: true
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add click event
      if (onMapClick) {
        map.current.on('click', (e) => {
          onMapClick(e.lngLat.lat, e.lngLat.lng);
        });
      }

      // Add markers
      markers.forEach(marker => {
        if (map.current) {
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h3>${marker.title}</h3><p>${marker.description || ''}</p>`);

          new mapboxgl.Marker()
            .setLngLat([marker.position[1], marker.position[0]]) // lng, lat for Mapbox
            .setPopup(popup)
            .addTo(map.current);
        }
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        console.log('Mapbox map loaded successfully');
      });

      // Save token to localStorage
      localStorage.setItem('mapbox_token', mapboxToken);

    } catch (error) {
      console.error('Error initializing Mapbox map:', error);
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      initializeMap();
    }
  };

  useEffect(() => {
    if (!showTokenInput && mapboxToken) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [showTokenInput, mapboxToken]);

  if (showTokenInput) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-8 bg-background rounded-lg shadow-lg max-w-md">
          <h3 className="text-lg font-semibold mb-4">Mapbox Token Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please enter your Mapbox public token to display the map. 
            Get your token from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
          </p>
          <div className="space-y-3">
            <Input
              placeholder="Enter your Mapbox token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              type="password"
            />
            <Button onClick={handleTokenSubmit} className="w-full">
              Load Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-sm">Loading map...</span>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapboxMapView;
