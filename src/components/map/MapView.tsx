
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getMapboxApiKey } from '@/config/apiConfig';
import { useAuth } from '@/contexts/AuthContext';
import { mapboxService } from '@/utils/mapboxService';
import FloatingDirectionsBox from './FloatingDirectionsBox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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

  // Mapbox API key state
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Map elements
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Form states
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState<any>(null);
  const [isSpeakingDirections, setIsSpeakingDirections] = useState(false);
  const speechSynthesis = window.speechSynthesis;
  const speechUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Add state for floating box visibility
  const [showFloatingBox, setShowFloatingBox] = useState(false);
  
  useEffect(() => {
    const fetchApiKey = async () => {
      setIsLoadingKey(true);
      try {
        const key = await getMapboxApiKey();
        if (key) {
          setApiKey(key);
          mapboxService.setApiKey(key);
          mapboxgl.accessToken = key;
        }
      } catch (error) {
        console.error("Error fetching API key:", error);
        toast({
          title: "API Key Error",
          description: "Failed to load the Mapbox API key from the server.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingKey(false);
      }
    };
    
    fetchApiKey();
  }, [toast]);
  
  useEffect(() => {
    if (!apiKey || !mapContainerRef.current) return;
    
    setMapLoaded(false);
    
    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [78.9629, 20.5937], // India center
        zoom: 4,
        pitch: 0,
        bearing: 0
      });
      
      map.on('load', () => {
        setMapLoaded(true);
        
        // Add markers for existing destinations
        destinations.forEach(destination => {
          const marker = new mapboxgl.Marker({
            color: '#3887be'
          })
            .setLngLat([destination.coordinates.lng, destination.coordinates.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div style="padding: 10px;">
                    <h3 style="margin: 0 0 5px 0; font-weight: bold;">${destination.name}</h3>
                    <p style="margin: 0 0 5px 0; color: #666;">${destination.location}</p>
                    <div style="display: flex; align-items: center; margin: 5px 0;">
                      <span style="color: #ffd700;">★</span>
                      <span style="margin-left: 2px;">${destination.rating}</span>
                    </div>
                  </div>
                `)
            )
            .addTo(map);
        });
        
        // Handle specific destination or place
        if (selectedDestinationId) {
          const destination = destinations.find(d => d.id === selectedDestinationId);
          if (destination) {
            map.flyTo({
              center: [destination.coordinates.lng, destination.coordinates.lat],
              zoom: 14,
              duration: 2000
            });
            setEndLocation(destination.name);
            
            // Add special marker for selected destination
            new mapboxgl.Marker({
              color: '#ff6b6b'
            })
              .setLngLat([destination.coordinates.lng, destination.coordinates.lat])
              .addTo(map);
          }
        } else if (selectedPlaceId && selectedPlaceName) {
          handleMapboxPlace(selectedPlaceId, map);
        }
      });
      
      mapRef.current = map;
      
      return () => {
        map.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "Failed to initialize the map.",
        variant: "destructive"
      });
    }
  }, [apiKey, destinations, selectedDestinationId, selectedPlaceId, selectedPlaceName]);
  
  const handleMapboxPlace = async (placeId: string, map: mapboxgl.Map) => {
    try {
      let placeDetails = selectedPlaceDetails;
      
      if (!placeDetails) {
        placeDetails = await mapboxService.getPlaceDetails(placeId);
      }
      
      if (placeDetails && placeDetails.geometry) {
        const { lat, lng } = placeDetails.geometry.location;
        
        map.flyTo({
          center: [lng, lat],
          zoom: 14,
          duration: 2000
        });
        
        const marker = new mapboxgl.Marker({
          color: '#ff6b6b'
        })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 10px; max-width: 250px;">
                  <h3 style="margin: 0 0 5px 0; font-weight: bold;">${placeDetails.name}</h3>
                  <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">${placeDetails.formatted_address}</p>
                  ${placeDetails.rating ? `
                    <div style="display: flex; align-items: center; margin: 5px 0;">
                      <span style="color: #ffd700;">★</span>
                      <span style="margin-left: 2px;">${placeDetails.rating.toFixed(1)}</span>
                    </div>
                  ` : ''}
                </div>
              `)
          )
          .addTo(map);
        
        marker.getPopup()?.addTo(map);
        setEndLocation(placeDetails.name);
      }
    } catch (error) {
      console.error('Error handling Mapbox Place:', error);
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
    
    if (!mapRef.current) {
      toast({
        title: "Map Not Ready",
        description: "The map is still loading.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const directions = await mapboxService.getDirections(startLocation, endLocation);
      
      if (directions.routes && directions.routes.length > 0) {
        setDirectionsResponse(directions);
        
        const route = directions.routes[0];
        const coordinates = route.geometry.coordinates;
        
        // Add route to map
        if (mapRef.current.getSource('route')) {
          mapRef.current.removeLayer('route');
          mapRef.current.removeSource('route');
        }
        
        mapRef.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        });
        
        mapRef.current.addLayer({
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
        
        // Fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
        mapRef.current.fitBounds(bounds, { padding: 50 });
        
        const leg = route.legs[0];
        const distance = (leg.distance / 1000).toFixed(1) + ' km';
        const duration = Math.round(leg.duration / 60) + ' min';
        
        toast({
          title: "Directions Found",
          description: `Distance: ${distance}, Duration: ${duration}`,
        });
      } else {
        toast({
          title: "Direction Error",
          description: "Could not find directions between these locations.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error calculating directions:", error);
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
    const distance = (directionsResponse.routes[0].legs[0].distance / 1000).toFixed(1) + ' kilometers';
    const duration = Math.round(directionsResponse.routes[0].legs[0].duration / 60) + ' minutes';
    
    let directionsText = `Starting navigation from ${startLocation} to ${endLocation}. `;
    directionsText += `Total distance is ${distance} and will take approximately ${duration}. `;
    directionsText += "Here are your turn-by-turn directions: ";
    
    steps.slice(0, 8).forEach((step: any, index: number) => {
      const instruction = step.instruction || step.maneuver?.type || 'Continue straight';
      const stepDistance = (step.distance / 1000).toFixed(1) + ' kilometers';
      directionsText += `Step ${index + 1}: ${instruction} for ${stepDistance}. `;
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
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading map configuration...</p>
        </div>
      </div>
    );
  }
  
  if (!apiKey && !isLoadingKey) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            {isAuthenticated ? (
              <>
                <h3 className="text-xl font-bold mb-2">Map Unavailable</h3>
                <p className="mb-4">The Mapbox API key could not be loaded.</p>
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

  if (!mapLoaded && apiKey) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading Mapbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
      
      {/* Directions Toggle Button - 25% above bottom left corner */}
      {!showFloatingBox && (
        <Button
          className="fixed left-4 z-40 shadow-lg"
          style={{ bottom: '25vh' }}
          onClick={() => setShowFloatingBox(true)}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Directions
        </Button>
      )}

      {/* Floating Directions Box */}
      {showFloatingBox && (
        <FloatingDirectionsBox
          startLocation={startLocation}
          endLocation={endLocation}
          setStartLocation={setStartLocation}
          setEndLocation={setEndLocation}
          handleDirections={handleDirections}
          isLoading={isLoading}
          directionsResponse={directionsResponse}
          speakDirections={speakDirections}
          isSpeakingDirections={isSpeakingDirections}
          onClose={() => setShowFloatingBox(false)}
        />
      )}
    </div>
  );
};

export default MapView;
