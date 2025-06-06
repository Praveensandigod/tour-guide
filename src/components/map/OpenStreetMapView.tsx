
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface OpenStreetMapViewProps {
  center?: LatLngExpression;
  zoom?: number;
  markers?: Array<{
    position: LatLngExpression;
    title: string;
    description?: string;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
}

const OpenStreetMapView: React.FC<OpenStreetMapViewProps> = ({
  center = [20.5937, 78.9629], // Default to India
  zoom = 5,
  markers = [],
  onMapClick
}) => {
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Component to handle map events
  const MapEvents = () => {
    const map = useMap();

    useEffect(() => {
      if (onMapClick) {
        const handleClick = (e: L.LeafletMouseEvent) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        };

        map.on('click', handleClick);

        return () => {
          map.off('click', handleClick);
        };
      }
    }, [map, onMapClick]);

    useEffect(() => {
      const handleMapLoad = () => {
        setMapLoaded(true);
        console.log('Map loaded successfully');
      };

      const handleMapError = (error: any) => {
        console.error('Map error:', error);
        setMapError('Failed to load map tiles');
      };

      map.on('load', handleMapLoad);
      map.on('tileerror', handleMapError);

      return () => {
        map.off('load', handleMapLoad);
        map.off('tileerror', handleMapError);
      };
    }, [map]);

    return null;
  };

  // Validate center coordinates
  const validCenter = React.useMemo(() => {
    if (Array.isArray(center)) {
      const [lat, lng] = center;
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return center;
      }
    }
    return [20.5937, 78.9629] as LatLngExpression; // Default fallback
  }, [center]);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold mb-2">Map Loading Error</h3>
          <p className="text-muted-foreground mb-4">{mapError}</p>
          <button 
            onClick={() => {
              setMapError(null);
              window.location.reload();
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
      
      <MapContainer
        center={validCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          errorTileUrl="https://via.placeholder.com/256x256/f0f0f0/999999?text=No+Image"
        />
        
        <MapEvents />
        
        {markers.map((marker, index) => {
          // Validate marker position
          const position = Array.isArray(marker.position) ? marker.position : [0, 0];
          const [lat, lng] = position;
          
          if (isNaN(lat) || isNaN(lng)) {
            console.warn('Invalid marker position:', marker.position);
            return null;
          }

          return (
            <Marker key={index} position={position as LatLngExpression}>
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-sm mb-1">{marker.title}</h3>
                  {marker.description && (
                    <p className="text-xs text-muted-foreground">{marker.description}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default OpenStreetMapView;
