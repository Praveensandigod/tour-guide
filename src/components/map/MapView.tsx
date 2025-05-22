
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getMapsApiKey } from '@/config/apiConfig';
import { useLocationIqApi, getCoordinatesFromPlace, getDirections } from '@/utils/locationIqService';
import { useDebounce } from 'use-debounce';

// Define type for our map
interface LeafletMap {
  setView: (coords: [number, number], zoom: number) => void;
  remove: () => void;
  fitBounds: (bounds: any, options?: any) => void;
}

const MapView = () => {
  const { destinations } = useDestinations();
  const { id: destinationId } = useParams();
  const location = useLocation();
  const selectedDestinationId = location.state?.destinationId || destinationId;
  const { toast } = useToast();

  // Maps API key state
  const apiKey = getMapsApiKey();
  const { isLoaded, loadError } = useLocationIqApi(apiKey);
  
  // Map elements
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null);
  
  // Form states
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isDirectionMode, setIsDirectionMode] = useState(!!selectedDestinationId);
  const [isLoading, setIsLoading] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState<any | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [isSpeakingDirections, setIsSpeakingDirections] = useState(false);
  const speechSynthesis = window.speechSynthesis;
  const speechUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Initialize the map
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return;

    try {
      // @ts-ignore - Leaflet types are not fully defined
      const L = window.L;
      if (!L) {
        console.error("Leaflet not loaded");
        return;
      }

      // Initialize map
      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
        
        L.tileLayer('https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key={apikey}', {
          attribution: '© LocationIQ | © OpenStreetMap Contributors',
          apikey: apiKey,
          maxZoom: 18
        }).addTo(map);
        
        mapRef.current = map;
        
        // Add destination markers if available
        if (destinations && destinations.length > 0) {
          destinations.forEach(destination => {
            if (destination.coordinates) {
              const marker = L.marker([destination.coordinates.lat, destination.coordinates.lng], {
                title: destination.name
              }).addTo(map);
              
              marker.bindPopup(`<b>${destination.name}</b>`);
              markersRef.current.push(marker);
            }
          });
        }
        
        // If destination ID is provided, center map on that destination
        if (selectedDestinationId) {
          const destination = destinations?.find(d => d.id === selectedDestinationId);
          if (destination && destination.coordinates) {
            map.setView([destination.coordinates.lat, destination.coordinates.lng], 14);
            setEndLocation(destination.name);
          }
        }
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Failed to initialize the map. Please try again.",
        variant: "destructive"
      });
    }
    
    return () => {
      // Clean up map when component unmounts
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isLoaded, apiKey, destinations, selectedDestinationId, toast]);
  
  const handleDirections = async () => {
    if (!startLocation || !endLocation) {
      toast({
        title: "Missing Information",
        description: "Please enter both start and end locations.",
      });
      return;
    }
    
    if (!mapRef.current) {
      toast({
        title: "Map Not Ready",
        description: "The map services are still loading. Please try again in a moment.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get coordinates for start and end locations
      const startCoords = await getCoordinatesFromPlace(startLocation, apiKey);
      const endCoords = await getCoordinatesFromPlace(endLocation, apiKey);
      
      if (!startCoords || !endCoords) {
        toast({
          title: "Location Error",
          description: "Could not find one or both locations. Please try different locations.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Get directions
      const result = await getDirections(startCoords, endCoords, apiKey);
      
      if (!result || !result.routes || result.routes.length === 0) {
        toast({
          title: "Direction Error",
          description: "Could not find a route between these locations. Please try different locations.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Display the directions
      setDirectionsResponse(result);
      
      // @ts-ignore - Leaflet types are not fully defined
      const L = window.L;
      
      // Clear existing route if any
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
      }
      
      // Draw new route on map
      const routeCoordinates = result.routes[0].overview_polyline.points.map(
        (point: { lat: number; lng: number }) => [point.lat, point.lng]
      );
      
      const routeLayer = L.polyline(routeCoordinates, {
        color: '#3887be',
        weight: 5,
        opacity: 0.75
      }).addTo(mapRef.current);
      
      routeLayerRef.current = routeLayer;
      
      // Fit map to the route bounds
      const bounds = L.latLngBounds(routeCoordinates);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      
      toast({
        title: "Directions Found",
        description: `Route found! Distance: ${result.routes[0].legs[0].distance.text}, Duration: ${result.routes[0].legs[0].duration.text}`,
      });
      
    } catch (error) {
      console.error("Error calculating directions:", error);
      toast({
        title: "Direction Error",
        description: "An error occurred while getting directions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const speakDirections = () => {
    if (!directionsResponse?.routes?.[0]?.legs?.[0]?.steps) {
      toast({
        title: "No Directions",
        description: "Please get directions first before using voice guidance.",
      });
      return;
    }
    
    if (isSpeakingDirections) {
      // Stop speaking if already active
      speechSynthesis.cancel();
      setIsSpeakingDirections(false);
      return;
    }
    
    const steps = directionsResponse.routes[0].legs[0].steps;
    const distance = directionsResponse.routes[0].legs[0].distance?.text;
    const duration = directionsResponse.routes[0].legs[0].duration?.text;
    
    let directionsText = `Starting navigation from ${startLocation} to ${endLocation}. `;
    directionsText += `Total distance is ${distance} and will take approximately ${duration}. `;
    
    // Add first 5 instructions to avoid too long speech
    steps.slice(0, 5).forEach((step: any, index: number) => {
      directionsText += `Step ${index + 1}: ${step.instructions} for ${step.distance?.text}. `;
    });
    
    if (steps.length > 5) {
      directionsText += "More steps available. Please check the map for complete directions.";
    }
    
    speechUtterance.current = new SpeechSynthesisUtterance(directionsText);
    
    // Set properties
    speechUtterance.current.rate = 0.9; // slightly slower
    speechUtterance.current.pitch = 1;
    speechUtterance.current.volume = 1;
    
    // Event listeners
    speechUtterance.current.onend = () => {
      setIsSpeakingDirections(false);
    };
    
    speechUtterance.current.onerror = () => {
      setIsSpeakingDirections(false);
      toast({
        title: "Voice Guidance Error",
        description: "There was an error with the voice guidance.",
        variant: "destructive"
      });
    };
    
    setIsSpeakingDirections(true);
    speechSynthesis.speak(speechUtterance.current);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechUtterance.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Show loading state while LocationIQ API is loading
  if (!isLoaded) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  // Show error message if LocationIQ API fails to load
  if (loadError) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-4">
            <p className="text-center text-destructive">
              Failed to load map. Please try again later.
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Error: {loadError.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[80vh] w-full relative">
      {/* Map Component */}
      <div ref={mapContainerRef} className="h-full w-full"></div>
      
      {/* Directions Panel */}
      <Card className="absolute top-4 left-4 w-[320px] z-[1000] shadow-lg">
        <CardContent className="p-4">
          <div className="mb-2">
            <label className="block mb-1 text-sm font-medium">Start Location</label>
            <Input 
              placeholder="Enter start location"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              className="mb-2"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Destination</label>
            <Input 
              placeholder="Enter destination"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              className="mb-2"
            />
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleDirections}
            disabled={isLoading || !startLocation || !endLocation}
          >
            {isLoading ? 'Loading...' : 'Get Directions'}
            {!isLoading && <ArrowRight size={16} className="ml-2" />}
          </Button>
          
          {directionsResponse && directionsResponse.routes && directionsResponse.routes.length > 0 && (
            <div className="mt-4">
              <div className="text-sm mb-2">
                <p className="font-bold">Distance: {directionsResponse.routes[0].legs[0].distance?.text}</p>
                <p className="font-bold">Duration: {directionsResponse.routes[0].legs[0].duration?.text}</p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full flex justify-center items-center" 
                onClick={speakDirections}
              >
                {isSpeakingDirections ? (
                  <>
                    <VolumeX className="mr-2 h-4 w-4" /> Stop Voice Guidance
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" /> Start Voice Guidance
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MapView;
