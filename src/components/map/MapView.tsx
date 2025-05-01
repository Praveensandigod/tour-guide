
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/components/ui/use-toast';

const MapView = () => {
  const { destinations } = useDestinations();
  const { id: destinationId } = useParams();
  const location = useLocation();
  const selectedDestinationId = location.state?.destinationId || destinationId;
  const { toast } = useToast();
  
  // Using a free Mapbox API token
  const mapboxToken = 'pk.eyJ1IjoicHVibGljLXRva2VuLWRlbW8iLCJhIjoiY2xreWUyZHh1MGRrczNxcGRwZXhsZzBueiJ9.5Zv_ryn8-KmAT2LQQnLmkQ';
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isDirectionMode, setIsDirectionMode] = useState(!!selectedDestinationId);
  const [isLoading, setIsLoading] = useState(false);
  const [directionsData, setDirectionsData] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isSpeakingDirections, setIsSpeakingDirections] = useState(false);
  const speechSynthesis = window.speechSynthesis;
  const speechUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      const loadMap = async () => {
        try {
          mapboxgl.accessToken = mapboxToken;
          
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [78.9629, 20.5937], // Center on India
            zoom: 3,
          });
          
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
          
          // Add destinations markers
          map.current.on('load', () => {
            setMapLoaded(true);
            // Load destination markers
            destinations.forEach(destination => {
              const popup = new mapboxgl.Popup({ offset: 25 }).setText(
                destination.name
              );
              
              // Create a DOM element for the marker
              const el = document.createElement('div');
              el.className = 'custom-marker';
              el.style.backgroundImage = 'url(https://img.icons8.com/color/48/marker--v1.png)';
              el.style.width = '24px';
              el.style.height = '24px';
              el.style.backgroundSize = '100%';
              el.style.cursor = 'pointer';
              
              new mapboxgl.Marker(el)
                .setLngLat([destination.coordinates.lng, destination.coordinates.lat])
                .setPopup(popup)
                .addTo(map.current!);
            });
            
            // If destination ID is provided, center map on that destination
            if (selectedDestinationId) {
              const destination = destinations.find(d => d.id === selectedDestinationId);
              if (destination) {
                map.current!.flyTo({
                  center: [destination.coordinates.lng, destination.coordinates.lat],
                  zoom: 10,
                  essential: true
                });
                
                setEndLocation(destination.name);
              }
            }
          });
        } catch (error) {
          console.error("Error initializing map:", error);
          toast({
            title: "Map Error",
            description: "There was a problem loading the map. Please try again.",
            variant: "destructive"
          });
        }
      };
      
      loadMap();
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (speechUtterance.current) {
        speechSynthesis.cancel();
      }
    };
  }, [destinations, selectedDestinationId, mapboxToken, toast]);
  
  const getCoordinatesFromPlace = async (placeName: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          placeName
        )}.json?access_token=${mapboxToken}&limit=1&country=in`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].center;
      }
      return null;
    } catch (error) {
      console.error("Error getting coordinates:", error);
      toast({
        title: "Geocoding Error",
        description: "Could not find the location you entered. Please try a different location.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  const getDirections = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxToken}`
      );
      
      return await response.json();
    } catch (error) {
      console.error("Error getting directions:", error);
      toast({
        title: "Directions Error",
        description: "Could not get directions between these locations.",
        variant: "destructive"
      });
      return null;
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
    
    setIsLoading(true);
    
    try {
      const startCoords = await getCoordinatesFromPlace(startLocation);
      const endCoords = await getCoordinatesFromPlace(endLocation);
      
      if (!startCoords || !endCoords) {
        toast({
          title: "Location Error",
          description: "Could not find one or both locations. Please try different locations.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const directions = await getDirections(startCoords, endCoords);
      setDirectionsData(directions);
      
      if (!directions || !directions.routes || directions.routes.length === 0) {
        toast({
          title: "No Routes Found",
          description: "Could not find a route between these locations.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const route = directions.routes[0].geometry.coordinates;
      
      if (!mapLoaded || !map.current) {
        toast({
          title: "Map Not Ready",
          description: "The map is still loading. Please try again in a moment.",
        });
        setIsLoading(false);
        return;
      }

      // Check if the source exists first
      if (map.current.getSource('route')) {
        // Use GeoJSONSource methods
        const routeSource = map.current.getSource('route') as mapboxgl.GeoJSONSource;
        routeSource.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route
          }
        });
      } else {
        // First time we're adding the route, so we need to add a layer
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route
            }
          }
        });
        
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }
      
      // Fit map to the route
      const bounds = new mapboxgl.LngLatBounds(route[0], route[0]);
      
      route.forEach(point => {
        bounds.extend(point as [number, number]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 80
      });

      toast({
        title: "Directions Found",
        description: `Route found! Distance: ${(directions.routes[0].distance / 1000).toFixed(2)} km`,
      });
      
    } catch (error) {
      console.error("Error handling directions:", error);
      toast({
        title: "Direction Error",
        description: "An error occurred while getting directions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const speakDirections = () => {
    if (!directionsData?.routes?.[0]?.legs?.[0]?.steps) {
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
    
    const steps = directionsData.routes[0].legs[0].steps;
    const distance = (directionsData.routes[0].distance / 1000).toFixed(2);
    const duration = Math.floor(directionsData.routes[0].duration / 60);
    
    let directionsText = `Starting navigation from ${startLocation} to ${endLocation}. `;
    directionsText += `Total distance is ${distance} kilometers and will take approximately ${duration} minutes. `;
    
    // Add first 5 instructions to avoid too long speech
    steps.slice(0, 5).forEach((step: any, index: number) => {
      const distanceKm = (step.distance / 1000).toFixed(1);
      directionsText += `Step ${index + 1}: ${step.maneuver.instruction} for ${distanceKm} kilometers. `;
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
  
  return (
    <div className="h-[80vh] w-full relative">
      <div ref={mapContainer} className="absolute top-0 left-0 right-0 bottom-0" />
      
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
          
          {directionsData && directionsData.routes && directionsData.routes.length > 0 && (
            <div className="mt-4">
              <div className="text-sm mb-2">
                <p className="font-bold">Distance: {(directionsData.routes[0].distance / 1000).toFixed(2)} km</p>
                <p className="font-bold">Duration: {Math.floor(directionsData.routes[0].duration / 60)} mins</p>
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
