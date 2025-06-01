
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
  const selectedPlaceDetails = location.state?.placeDetails;
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
          description: "Failed to load the map API key from the server.",
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
      if (window.google) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=googleMapsCallback`;
      script.async = true;
      script.defer = true;
      
      window.googleMapsCallback = () => {
        setMapLoaded(true);
      };
      
      document.head.appendChild(script);
      
      return () => {
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
        delete window.googleMapsCallback;
      };
    };

    const cleanup = loadGoogleMapsScript();
    return cleanup;
  }, [apiKey]);
  
  // Initialize the map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !window.google) return;
    
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 5,
      streetViewControl: false,
      mapTypeControl: true,
      fullscreenControl: true,
    });
    
    mapRef.current = map;
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }
    
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#3887be',
        strokeWeight: 5,
        strokeOpacity: 0.75
      }
    });
    directionsRendererRef.current.setMap(map);
    
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
        const position = { lat: destination.coordinates.lat, lng: destination.coordinates.lng };
        map.setCenter(position);
        map.setZoom(14);
        setEndLocation(destination.name);
        
        // Add special marker for selected destination
        new window.google.maps.Marker({
          position,
          map,
          title: destination.name,
          icon: {
            url: 'https://img.icons8.com/color/48/google-maps-new.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });
      }
    } else if (selectedPlaceId && selectedPlaceName) {
      handleGooglePlace(selectedPlaceId, map);
    }
  }, [mapLoaded, destinations, selectedDestinationId, selectedPlaceId, selectedPlaceName]);
  
  const handleGooglePlace = async (placeId: string, map: google.maps.Map) => {
    try {
      let placeDetails = selectedPlaceDetails;
      
      if (!placeDetails) {
        placeDetails = await googlePlacesService.getPlaceDetails(placeId);
      }
      
      if (placeDetails && placeDetails.geometry) {
        const location = placeDetails.geometry.location;
        const position = { lat: location.lat, lng: location.lng };
        
        map.setCenter(position);
        map.setZoom(14);
        
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: placeDetails.name,
          icon: {
            url: 'https://img.icons8.com/color/48/google-maps-new.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });
        
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
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        
        infoWindow.open(map, marker);
        setEndLocation(placeDetails.name);
      }
    } catch (error) {
      console.error('Error handling Google Place:', error);
      toast({
        title: "Error loading place",
        description: "Could not load the selected place on the map.",
        variant: "destructive"
      });
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
        description: "The map services are still loading.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const directionsRequest: google.maps.DirectionsRequest = {
        origin: startLocation,
        destination: endLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      };
      
      directionsServiceRef.current.route(directionsRequest, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirectionsResponse(result);
          
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
          }
          
          const route = result.routes[0];
          const leg = route.legs[0];
          
          toast({
            title: "Directions Found",
            description: `Distance: ${leg.distance?.text}, Duration: ${leg.duration?.text}`,
          });
        } else {
          toast({
            title: "Direction Error",
            description: "Could not find directions between these locations.",
            variant: "destructive"
          });
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error calculating directions:", error);
      toast({
        title: "Direction Error",
        description: "An error occurred while getting directions.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  const speakDirections = () => {
    if (!directionsResponse?.routes?.[0]?.legs?.[0]?.steps) {
      toast({
        title: "No Directions",
        description: "Please get directions first.",
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
    
    speechUtterance.current = new SpeechSynthesisUtterance(directionsText);
    speechUtterance.current.rate = 0.9;
    speechUtterance.current.onend = () => setIsSpeakingDirections(false);
    speechUtterance.current.onerror = () => setIsSpeakingDirections(false);
    
    setIsSpeakingDirections(true);
    speechSynthesis.speak(speechUtterance.current);
  };
  
  useEffect(() => {
    return () => {
      if (speechUtterance.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);
  
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
  
  if (!apiKey && !isLoadingKey) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            {isAuthenticated ? (
              <>
                <h3 className="text-xl font-bold mb-2">Map Unavailable</h3>
                <p className="mb-4">The map API key could not be loaded.</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">Authentication Required</h3>
                <p className="mb-4">You need to be logged in to access the map feature.</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
      
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
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Get Directions
                <ArrowRight size={16} className="ml-2" />
              </>
            )}
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
                    <VolumeX className="mr-2 h-4 w-4" /> Stop Voice
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" /> Voice Guidance
                  </>
                )}
              </Button>
              
              <div className="max-h-40 overflow-y-auto">
                <h4 className="text-sm font-semibold mb-2">Directions:</h4>
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MapView;
