
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SimpleMapView from './SimpleMapView';
import DirectionsPanel from './DirectionsPanel';
import { freeMapService, Place, Route } from '@/services/freeMapService';
import { useToast } from '@/components/ui/use-toast';

interface MapMarker {
  position: [number, number];
  title: string;
  description?: string;
  isDestination?: boolean;
}

const MapView = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get place data from navigation state
  const placeId = location.state?.placeId;
  const placeName = location.state?.placeName;
  const placeDetails = location.state?.placeDetails;

  useEffect(() => {
    const loadPlaceOnMap = async () => {
      if (!placeName) return;

      setIsLoading(true);
      try {
        // Try to get coordinates from place details first
        if (placeDetails?.geometry?.location) {
          const { lat, lng } = placeDetails.geometry.location;
          setMapCenter([lat, lng]);
          setMarkers([{
            position: [lat, lng],
            title: placeName,
            description: placeDetails.formatted_address || '',
            isDestination: true
          }]);
        } else {
          // Geocode the place name
          const coords = await freeMapService.geocode(placeName);
          if (coords) {
            setMapCenter([coords.lat, coords.lng]);
            setMarkers([{
              position: [coords.lat, coords.lng],
              title: placeName,
              description: `Location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
              isDestination: true
            }]);
          } else {
            toast({
              title: "Location Not Found",
              description: "Could not find the location on the map.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error loading place on map:', error);
        toast({
          title: "Map Error",
          description: "Failed to load the location on the map.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaceOnMap();
  }, [placeId, placeName, placeDetails, toast]);

  const handleMapClick = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const address = await freeMapService.reverseGeocode(lat, lng);
      
      setMarkers(prev => [
        ...prev,
        {
          position: [lat, lng],
          title: 'Selected Location',
          description: address || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
        }
      ]);
    } catch (error) {
      console.error('Error handling map click:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectionsRequest = async (origin: string, destination: string) => {
    setIsLoading(true);
    try {
      const originCoords = await freeMapService.geocode(origin);
      const destCoords = await freeMapService.geocode(destination);

      if (!originCoords || !destCoords) {
        toast({
          title: "Geocoding Failed",
          description: "Could not find one or both locations.",
          variant: "destructive"
        });
        return;
      }

      const route = await freeMapService.getDirections(originCoords, destCoords);
      
      if (route) {
        setCurrentRoute(route);
        setMarkers([
          {
            position: [originCoords.lat, originCoords.lng],
            title: 'Origin',
            description: origin
          },
          {
            position: [destCoords.lat, destCoords.lng],
            title: 'Destination',
            description: destination,
            isDestination: true
          }
        ]);
        
        // Center map to show both points
        const centerLat = (originCoords.lat + destCoords.lat) / 2;
        const centerLng = (originCoords.lng + destCoords.lng) / 2;
        setMapCenter([centerLat, centerLng]);

        toast({
          title: "Route Found",
          description: `Distance: ${route.distance}, Duration: ${route.duration}`,
        });
      } else {
        toast({
          title: "No Route Found",
          description: "Could not find a route between these locations.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      toast({
        title: "Directions Error",
        description: "Failed to get directions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      <SimpleMapView
        center={mapCenter}
        zoom={13}
        markers={markers}
        route={currentRoute}
        onMapClick={handleMapClick}
      />
      
      <DirectionsPanel 
        onDirectionsRequest={handleDirectionsRequest}
        isLoading={isLoading}
        currentRoute={currentRoute}
      />
      
      {isLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
