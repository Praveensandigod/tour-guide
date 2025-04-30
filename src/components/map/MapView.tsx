
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapView = () => {
  const { destinations } = useDestinations();
  const { id: destinationId } = useParams();
  const location = useLocation();
  const selectedDestinationId = location.state?.destinationId || destinationId;
  
  const mapboxToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbGdmaWJuOXYwZjZzM3NwZ2Z1azFibnluIn0.4Pt5HHNJJ9jiC57IDZc2lg';
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isDirectionMode, setIsDirectionMode] = useState(!!selectedDestinationId);
  const [isLoading, setIsLoading] = useState(false);
  const [directionsData, setDirectionsData] = useState<any>(null);
  
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      const loadMap = async () => {
        try {
          // Dynamically import mapbox-gl CSS
          
          mapboxgl.accessToken = mapboxToken;
          
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [0, 20], // Default center on world
            zoom: 1.5,
          });
          
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
          
          // Add destinations markers
          map.current.on('load', () => {
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
        }
      };
      
      loadMap();
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [destinations, selectedDestinationId, mapboxToken]);
  
  const getCoordinatesFromPlace = async (placeName: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          placeName
        )}.json?access_token=${mapboxToken}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].center;
      }
      return null;
    } catch (error) {
      console.error("Error getting coordinates:", error);
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
      return null;
    }
  };
  
  const handleDirections = async () => {
    if (!startLocation || !endLocation) return;
    
    setIsLoading(true);
    
    try {
      const startCoords = await getCoordinatesFromPlace(startLocation);
      const endCoords = await getCoordinatesFromPlace(endLocation);
      
      if (!startCoords || !endCoords) {
        console.error("Couldn't find coordinates for the locations");
        setIsLoading(false);
        return;
      }
      
      const directions = await getDirections(startCoords, endCoords);
      setDirectionsData(directions);
      
      if (!directions || !directions.routes || directions.routes.length === 0) {
        console.error("No routes found");
        setIsLoading(false);
        return;
      }
      
      const route = directions.routes[0].geometry.coordinates;
      
      // Check if the source exists first
      if (map.current?.getSource('route')) {
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
        map.current?.addSource('route', {
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
        
        map.current?.addLayer({
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
      
      map.current?.fitBounds(bounds, {
        padding: 80
      });
      
    } catch (error) {
      console.error("Error handling directions:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-[80vh] w-full relative">
      <div ref={mapContainer} className="absolute top-0 left-0 right-0 bottom-0" />
      
      <Card className="absolute top-4 left-4 w-[300px] z-10 shadow-lg">
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
            <div className="mt-4 text-sm">
              <p className="font-bold">Distance: {(directionsData.routes[0].distance / 1000).toFixed(2)} km</p>
              <p className="font-bold">Duration: {Math.floor(directionsData.routes[0].duration / 60)} mins</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MapView;
