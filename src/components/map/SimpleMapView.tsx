
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { freeMapService, Route } from '@/services/freeMapService';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapMarker {
  position: [number, number];
  title: string;
  description?: string;
  isDestination?: boolean;
}

interface SimpleMapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  route?: Route;
  onMapClick?: (lat: number, lng: number) => void;
}

const MapEvents: React.FC<{ onMapClick?: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
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

  return null;
};

const SimpleMapView: React.FC<SimpleMapViewProps> = ({
  center = [20.5937, 78.9629], // Default to India
  zoom = 5,
  markers = [],
  route,
  onMapClick
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  if (!mapLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents onMapClick={onMapClick} />
        
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position}>
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-sm mb-1">{marker.title}</h3>
                {marker.description && (
                  <p className="text-xs text-muted-foreground">{marker.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {route && route.coordinates.length > 0 && (
          <Polyline
            positions={route.coordinates}
            color="blue"
            weight={5}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default SimpleMapView;
