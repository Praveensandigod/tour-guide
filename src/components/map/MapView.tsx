
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import OpenStreetMapView from './OpenStreetMapView';
import FloatingDirectionsBox from './FloatingDirectionsBox';
import { mapsService } from '@/utils/mapsService';
import { useToast } from '@/components/ui/use-toast';

interface Marker {
  position: [number, number];
  title: string;
  description?: string;
}

const MapView = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Get place data from navigation state
  const placeId = location.state?.placeId;
  const placeName = location.state?.placeName;
  const placeDetails = location.state?.placeDetails;

  useEffect(() => {
    const loadPlaceOnMap = async () => {
      try {
        setMapError(null);
        
        if (placeDetails?.geometry?.location) {
          const { lat, lng } = placeDetails.geometry.location;
          if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            setMapCenter([lat, lng]);
            setMarkers([{
              position: [lat, lng],
              title: placeName || 'Selected Place',
              description: placeDetails.formatted_address || ''
            }]);
            return;
          }
        }
        
        if (placeName && placeName.trim().length > 2) {
          setIsLoading(true);
          try {
            const geocodeResult = await mapsService.geocodeAddress(placeName);
            if (geocodeResult.status === 'OK' && geocodeResult.results.length > 0) {
              const { lat, lng } = geocodeResult.results[0].geometry.location;
              if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                setMapCenter([lat, lng]);
                setMarkers([{
                  position: [lat, lng],
                  title: placeName,
                  description: geocodeResult.results[0].formatted_address || ''
                }]);
              } else {
                throw new Error('Invalid coordinates received');
              }
            } else {
              throw new Error('Location not found');
            }
          } catch (error) {
            console.error('Error geocoding place:', error);
            setMapError('Could not find the location on the map');
            toast({
              title: "Location Error",
              description: "Could not find the location on the map. Showing default view.",
              variant: "destructive"
            });
          } finally {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error loading place on map:', error);
        setMapError('Error loading map data');
        setIsLoading(false);
      }
    };

    loadPlaceOnMap();
  }, [placeId, placeName, placeDetails, toast]);

  const handleMapClick = async (lat: number, lng: number) => {
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates clicked:', lat, lng);
      return;
    }

    setIsLoading(true);
    try {
      // Try to get place details for the clicked location
      const searchResults = await mapsService.searchPlaces(`${lat.toFixed(4)},${lng.toFixed(4)}`);
      
      let title = 'Selected Location';
      let description = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
      
      if (searchResults.results && searchResults.results.length > 0) {
        title = searchResults.results[0].name || title;
        description = searchResults.results[0].formatted_address || description;
      }

      setMarkers([{
        position: [lat, lng],
        title,
        description
      }]);
      setMapCenter([lat, lng]);
    } catch (error) {
      console.error('Error handling map click:', error);
      // Still add marker even if search fails
      setMarkers([{
        position: [lat, lng],
        title: 'Selected Location',
        description: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
      }]);
      setMapCenter([lat, lng]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Map Error</h3>
            <p className="text-muted-foreground mb-4">{mapError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      ) : (
        <>
          <OpenStreetMapView
            center={mapCenter}
            zoom={13}
            markers={markers}
            onMapClick={handleMapClick}
          />
          
          <FloatingDirectionsBox isLoading={isLoading} />
          
          {isLoading && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MapView;
