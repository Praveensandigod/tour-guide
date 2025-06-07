
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreMapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title: string;
    description?: string;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
}

const MapLibreMapView: React.FC<MapLibreMapViewProps> = ({
  center = [78.9629, 20.5937], // Default to India (lng, lat for MapLibre)
  zoom = 5,
  markers = [],
  onMapClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const initializeMap = () => {
    if (!mapContainer.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json', // Free MapLibre style
        center: center,
        zoom: zoom,
        attributionControl: true
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Add click event
      if (onMapClick) {
        map.current.on('click', (e) => {
          onMapClick(e.lngLat.lat, e.lngLat.lng);
        });
      }

      // Add markers
      markers.forEach(marker => {
        if (map.current) {
          const popup = new maplibregl.Popup({ offset: 25 })
            .setHTML(`<h3>${marker.title}</h3><p>${marker.description || ''}</p>`);

          new maplibregl.Marker()
            .setLngLat([marker.position[1], marker.position[0]]) // lng, lat for MapLibre
            .setPopup(popup)
            .addTo(map.current);
        }
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        console.log('MapLibre map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('MapLibre error:', e);
        setMapError('Failed to load map');
      });

    } catch (error) {
      console.error('Error initializing MapLibre map:', error);
      setMapError('Failed to initialize map');
    }
  };

  useEffect(() => {
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (map.current && mapLoaded) {
      // Clear existing markers
      const existingMarkers = document.querySelectorAll('.maplibregl-marker');
      existingMarkers.forEach(marker => marker.remove());

      // Add new markers
      markers.forEach(marker => {
        if (map.current) {
          const popup = new maplibregl.Popup({ offset: 25 })
            .setHTML(`<h3>${marker.title}</h3><p>${marker.description || ''}</p>`);

          new maplibregl.Marker()
            .setLngLat([marker.position[1], marker.position[0]])
            .setPopup(popup)
            .addTo(map.current);
        }
      });
    }
  }, [markers, mapLoaded]);

  // Update center when it changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.flyTo({ center: center, zoom: zoom });
    }
  }, [center, zoom, mapLoaded]);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-8 bg-background rounded-lg shadow-lg max-w-md">
          <h3 className="text-lg font-semibold mb-4 text-destructive">Map Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{mapError}</p>
          <button 
            onClick={() => {
              setMapError(null);
              initializeMap();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
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

export default MapLibreMapView;
