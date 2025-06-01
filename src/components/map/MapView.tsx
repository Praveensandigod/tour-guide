
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Volume2, VolumeX, Loader2, Navigation, ArrowLeft, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getGoogleMapsApiKey } from '@/config/apiConfig';
import { useAuth } from '@/contexts/AuthContext';
import { googlePlacesService } from '@/utils/googleMapsService';

const MapView = () => {
  const { destinations } = useDestinations();
  const { id: destinationId } = useParams();
  const location = useLocation();
  const selectedDestinationId = location.state?.destinationId || destinationId;
  const selectedPlaceId = location.state?.placeId;
  const selectedPlaceName = location.state?.placeName;
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Google Maps API key state
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Map elements
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  
  // Form states
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [isSpeakingDirections, setIsSpeakingDirections] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const speechSynthesis = window.speechSynthesis;
  const speechUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Fetch API key on component mount
  useEffect(() => {
    const fetchApiKey = async () => {
      setIsLoadingKey(true);
      try {
        const key = await getGoogleMapsApiKey();
        setApiKey(key);
      } catch (error) {
        console.error("Error fetching API key:", error);
        toast({
          title: "API Key Error",
          description: "Failed to load the map API key from the server. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingKey(false);
      }
    };
    
    fetchApiKey();
  }, [toast]);
  
  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) return;

    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,directions&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Create global callback
      window.initMap = () => {
        setMapLoaded(true);
      };
      
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
        delete window.initMap;
      };
    };

    if (!window.google) {
      const cleanup = loadGoogleMapsScript();
      return cleanup;
    } else {
      setMapLoaded(true);
    }
  }, [apiKey]);
  
  // Initialize the map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !window.google) return;
    
    // Initialize map
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: 20.5937, lng: 78.9629 }, // Center on India
      zoom: 5,
      streetViewControl: false,
      mapTypeControl: true,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "on" }]
        }
      ]
    });
    
    mapRef.current = map;
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    
    // Initialize DirectionsRenderer with custom styling
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
    
    // Add markers for existing destinations
    destinations.forEach(destination => {
      const marker = new window.google.maps.Marker({
        position: { lat: destination.coordinates.lat, lng: destination.coordinates.lng },
        map,
        title: destination.name,
        icon: {
          url: 'https://img.icons8.com/color/48/marker--v1.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });
      
      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0; font-weight: bold;">${destination.name}</h3>
            <p style="margin: 0 0 5px 0; color: #666;">${destination.location}</p>
            <div style="display: flex; align-items: center; margin: 5px 0;">
              <span style="color: #ffd700;">★</span>
              <span style="margin-left: 2px;">${destination.rating}</span>
            </div>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
    
    // Handle specific destination or place
    if (selectedDestinationId) {
      const destination = destinations.find(d => d.id === selectedDestinationId);
      if (destination) {
        map.setCenter({ lat: destination.coordinates.lat, lng: destination.coordinates.lng });
        map.setZoom(14);
        setEndLocation(destination.name);
      }
    } else if (selectedPlaceId && selectedPlaceName) {
      // Handle Google Place
      handleGooglePlace(selectedPlaceId, map);
    }
  }, [mapLoaded, destinations, selectedDestinationId, selectedPlaceId, selectedPlaceName]);
  
  const handleGooglePlace = async (placeId: string, map: google.maps.Map) => {
    try {
      const placeDetails = await googlePlacesService.getPlaceDetails(placeId);
      
      if (placeDetails && placeDetails.geometry) {
        const location = placeDetails.geometry.location;
        map.setCenter(location);
        map.setZoom(14);
        
        // Create custom marker for Google Place
        const marker = new window.google.maps.Marker({
          position: location,
          map,
          title: placeDetails.name,
          icon: {
            url: 'https://img.icons8.com/color/48/google-maps-new.png',
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });
        
        // Create info window with place details
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 250px;">
              <h3 style="margin: 0 0 5px 0; font-weight: bold;">${placeDetails.name}</h3>
              <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">${placeDetails.formatted_address}</p>
              ${placeDetails.rating ? `
                <div style="display: flex; align-items: center; margin: 5px 0;">
                  <span style="color: #ffd700;">★</span>
                  <span style="margin-left: 2px;">${placeDetails.rating}</span>
                </div>
              ` : ''}
              ${placeDetails.website ? `
                <a href="${placeDetails.website}" target="_blank" style="color: #3887be; text-decoration: none; font-size: 12px;">Visit Website</a>
              ` : ''}
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        
        // Open info window immediately
        infoWindow.open(map, marker);
        
        setEndLocation(placeDetails.name);
      }
    } catch (error) {
      console.error('Error handling Google Place:', error);
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
    
    if (!directionsServiceRef.current || !mapRef.current) {
      toast({
        title: "Map Not Ready",
        description: "The map services are still loading. Please try again in a moment.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await googlePlacesService.getDirections(startLocation, endLocation);
      
      if (result && result.routes && result.routes.length > 0) {
        setDirectionsResponse(result);
        
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setDirections(result);
        }
        
        const route = result.routes[0];
        const leg = route.legs[0];
        
        toast({
          title: "Directions Found",
          description: `Route found! Distance: ${leg.distance?.text}, Duration: ${leg.duration?.text}`,
        });
      } else {
        throw new Error('No routes found');
      }
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
      speechSynthesis.cancel();
      setIsSpeakingDirections(false);
      return;
    }
    
    const steps = directionsResponse.routes[0].legs[0].steps;
    const distance = directionsResponse.routes[0].legs[0].distance?.text;
    const duration = directionsResponse.routes[0].legs[0].duration?.text;
    
    let directionsText = `Starting navigation from ${startLocation} to ${endLocation}. `;
    directionsText += `Total distance is ${distance} and will take approximately ${duration}. `;
    directionsText += "Here are your turn-by-turn directions: ";
    
    steps.slice(0, 8).forEach((step, index) => {
      const instruction = step.instructions.replace(/<[^>]*>/g, '');
      directionsText += `Step ${index + 1}: ${instruction} for ${step.distance?.text}. `;
    });
    
    if (steps.length > 8) {
      directionsText += "Additional steps are shown on the map.";
    }
    
    speechUtterance.current = new SpeechSynthesisUtterance(directionsText);
    speechUtterance.current.rate = 0.9;
    speechUtterance.current.pitch = 1;
    speechUtterance.current.volume = 1;
    
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
  
  // Show loading state while fetching API key
  if (isLoadingKey) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading map configuration...</p>
        </div>
      </div>
    );
  }
  
  // Show error if API key couldn't be loaded
  if (!apiKey && !isLoadingKey) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            {isAuthenticated ? (
              <>
                <h3 className="text-xl font-bold mb-2">Map Unavailable</h3>
                <p className="mb-4">
                  The map API key could not be loaded from the server. Please try again later or contact support.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">Authentication Required</h3>
                <p className="mb-4">
                  You need to be logged in to access the map feature.
                </p>
                <Button
                  className="w-full"
                  onClick={() => window.location.href = '/login'}
                >
                  Log In to Access Maps
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while Google Maps API is loading
  if (!mapLoaded) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[80vh] w-full relative">
      {/* Google Map Container */}
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
      
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
            className="w-full mb-2" 
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
                className="w-full flex justify-center items-center mb-2" 
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
              
              {/* Turn-by-turn directions */}
              <div className="max-h-40 overflow-y-auto">
                <h4 className="text-sm font-semibold mb-2">Turn-by-turn directions:</h4>
                {directionsResponse.routes[0].legs[0].steps.slice(0, 5).map((step, index) => (
                  <div key={index} className="text-xs mb-2 p-2 bg-muted rounded">
                    <div className="flex items-center">
                      {step.maneuver?.includes('left') && <ArrowLeft size={12} className="mr-1" />}
                      {step.maneuver?.includes('right') && <ArrowRight size={12} className="mr-1" />}
                      {step.maneuver?.includes('straight') && <ArrowRight size={12} className="mr-1" />}
                      {step.maneuver?.includes('turn') && <RotateCcw size={12} className="mr-1" />}
                      <span className="font-semibold mr-1">{index + 1}.</span>
                    </div>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: step.instructions.replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>') 
                      }} 
                      className="mt-1"
                    />
                    <div className="text-gray-500 mt-1">{step.distance?.text}</div>
                  </div>
                ))}
                {directionsResponse.routes[0].legs[0].steps.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{directionsResponse.routes[0].legs[0].steps.length - 5} more steps...
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MapView;
