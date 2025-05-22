import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { GoogleMap } from '@react-google-maps/api';
import { getGoogleMapsApiKey } from '@/config/apiConfig';
import { useGoogleMapsApi } from '@/utils/googleMapsService';
import { useDebounce } from 'use-debounce';

const MapView = () => {
  const { destinations } = useDestinations();
  const { id: destinationId } = useParams();
  const location = useLocation();
  const selectedDestinationId = location.state?.destinationId || destinationId;
  const { toast } = useToast();

  // Google Maps API key state
  const apiKey = getGoogleMapsApiKey();
  const { isLoaded, loadError } = useGoogleMapsApi(apiKey);
  
  // Map elements
  const mapRef = useRef<google.maps.Map | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  
  // Form states
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isDirectionMode, setIsDirectionMode] = useState(!!selectedDestinationId);
  const [isLoading, setIsLoading] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [isSpeakingDirections, setIsSpeakingDirections] = useState(false);
  const speechSynthesis = window.speechSynthesis;
  const speechUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Initialize the map
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    
    // Initialize DirectionsRenderer
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3887be',
          strokeWeight: 5,
          strokeOpacity: 0.75
        }
      });
      directionsRendererRef.current.setMap(map);
    }
    
    // Add destination markers
    destinations.forEach(destination => {
      new window.google.maps.Marker({
        position: { lat: destination.coordinates.lat, lng: destination.coordinates.lng },
        map,
        title: destination.name,
        icon: {
          url: 'https://img.icons8.com/color/48/marker--v1.png',
          scaledSize: new window.google.maps.Size(24, 24)
        }
      });
    });
    
    // If destination ID is provided, center map on that destination
    if (selectedDestinationId) {
      const destination = destinations.find(d => d.id === selectedDestinationId);
      if (destination) {
        map.setCenter({ lat: destination.coordinates.lat, lng: destination.coordinates.lng });
        map.setZoom(14);
        setEndLocation(destination.name);
      }
    }
  };
  
  const handleDirections = async () => {
    if (!startLocation || !endLocation) {
      toast({
        title: "Missing Information",
        description: "Please enter both start and end locations.",
      });
      return;
    }
    
    if (!directionsServiceRef.current || !placesServiceRef.current || !mapRef.current) {
      toast({
        title: "Map Not Ready",
        description: "The map services are still loading. Please try again in a moment.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const geocodeStartRequest = {
        query: startLocation,
        fields: ['name', 'geometry']
      };
      
      const geocodeEndRequest = {
        query: endLocation,
        fields: ['name', 'geometry']
      };
      
      // Find start location
      const startResults = await new Promise<google.maps.places.PlaceSearchRequest | null>((resolve, reject) => {
        placesServiceRef.current!.findPlaceFromQuery(geocodeStartRequest, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            resolve(results[0]);
          } else {
            reject(new Error("Could not find start location"));
          }
        });
      }).catch(() => null);
      
      // Find end location
      const endResults = await new Promise<google.maps.places.PlaceSearchRequest | null>((resolve, reject) => {
        placesServiceRef.current!.findPlaceFromQuery(geocodeEndRequest, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            resolve(results[0]);
          } else {
            reject(new Error("Could not find end location"));
          }
        });
      }).catch(() => null);
      
      if (!startResults || !endResults) {
        toast({
          title: "Location Error",
          description: "Could not find one or both locations. Please try different locations.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Get directions
      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsServiceRef.current!.route(
          {
            origin: startResults.geometry!.location!,
            destination: endResults.geometry!.location!,
            travelMode: window.google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK && result) {
              resolve(result);
            } else {
              reject(new Error(`Directions request failed: ${status}`));
            }
          }
        );
      });
      
      // Display the directions
      setDirectionsResponse(result);
      
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(result);
      }
      
      toast({
        title: "Directions Found",
        description: `Route found! Distance: ${result.routes[0].legs[0].distance?.text}, Duration: ${result.routes[0].legs[0].duration?.text}`,
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
    steps.slice(0, 5).forEach((step, index) => {
      directionsText += `Step ${index + 1}: ${step.instructions.replace(/<[^>]*>/g, '')} for ${step.distance?.text}. `;
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
  
  // Show loading state while Google Maps API is loading
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

  // Show error message if Google Maps API fails to load
  if (loadError) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-4">
            <p className="text-center text-destructive">
              Failed to load Google Maps. Please try again later.
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
      {/* Google Map Component */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat: 20.5937, lng: 78.9629 }} // Center on India
        zoom={5}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
        onLoad={onMapLoad}
      >
        {/* Markers will be added in onMapLoad function */}
      </GoogleMap>
      
      {/* Directions Panel */}
      <Card className="absolute top-4 left-4 w-[320px] z-10 shadow-lg">
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
