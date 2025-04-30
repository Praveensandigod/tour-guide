
import { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

const MapView = () => {
  const { destinations } = useDestinations();
  const [searchParams] = useSearchParams();
  const destinationId = searchParams.get('destination');
  
  // For API keys, we would use environment variables in a real project
  const mapboxToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbGdmaWJuOXYwZjZzM3NwZ2Z1azFibnluIn0.4Pt5HHNJJ9jiC57IDZc2lg';
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isDirectionMode, setIsDirectionMode] = useState(!!destinationId);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      const loadMap = async () => {
        try {
          // Dynamically import mapbox-gl CSS
          await import('mapbox-gl/dist/mapbox-gl.css');
          
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
              
              const el = document.createElement('div');
              el.className = 'marker';
              el.style.backgroundImage = 'url(https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png)';
              el.style.width = '32px';
              el.style.height = '32px';
              el.style.backgroundSize = '100%';
              el.style.cursor = 'pointer';
              
              new mapboxgl.Marker(el)
                .setLngLat([destination.coordinates.lng, destination.coordinates.lat])
                .setPopup(popup)
                .addTo(map.current!);
            });
            
            // If destination ID is provided, center map on that destination
            if (destinationId) {
              const destination = destinations.find(d => d.id === destinationId);
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
          console.error('Error loading map:', error);
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
  }, [destinations, destinationId, mapboxToken]);
  
  const getDirections = async () => {
    if (!startLocation || !endLocation) return;
    
    setIsLoading(true);
    
    try {
      let startCoords: [number, number] = [0, 0];
      let endCoords: [number, number] = [0, 0];
      
      // For the destination, check if it's one of our known destinations first
      const destinationMatch = destinations.find(
        d => d.name.toLowerCase() === endLocation.toLowerCase() || 
             d.location.toLowerCase() === endLocation.toLowerCase()
      );
      
      if (destinationMatch) {
        endCoords = [destinationMatch.coordinates.lng, destinationMatch.coordinates.lat];
      } else {
        // Geocode end location
        const endResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endLocation)}.json?access_token=${mapboxToken}`
        );
        const endData = await endResponse.json();
        
        if (endData.features && endData.features.length > 0) {
          endCoords = endData.features[0].center;
        } else {
          throw new Error("Couldn't find end location");
        }
      }
      
      // Geocode start location
      const startResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(startLocation)}.json?access_token=${mapboxToken}`
      );
      const startData = await startResponse.json();
      
      if (startData.features && startData.features.length > 0) {
        startCoords = startData.features[0].center;
      } else {
        throw new Error("Couldn't find start location");
      }
      
      // Get directions
      const directionsResponse = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxToken}`
      );
      const directionsData = await directionsResponse.json();
      
      if (directionsData.routes && directionsData.routes.length > 0) {
        const route = directionsData.routes[0];
        
        // Add the route to the map
        if (map.current.getSource('route')) {
          map.current.getSource('route').setData({
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          });
        } else {
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
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
        
        // Set bounds to show the entire route
        const bounds = new mapboxgl.LngLatBounds();
        route.geometry.coordinates.forEach(coord => {
          bounds.extend(coord as mapboxgl.LngLatLike);
        });
        
        map.current.fitBounds(bounds, {
          padding: 100
        });
      } else {
        throw new Error("No route found");
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      alert('Could not find route. Please check location names and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
      
      <div className="absolute top-4 left-0 right-0 px-4 z-10">
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-lg">Directions</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="text-green-600" size={20} />
                <Input
                  placeholder="Starting point"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="text-red-600" size={20} />
                <Input
                  placeholder="Destination"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                />
              </div>
              <Button
                onClick={getDirections}
                disabled={!startLocation || !endLocation || isLoading}
                className="w-full"
              >
                {isLoading ? 'Finding route...' : 'Get Directions'}
                {!isLoading && <ArrowRight className="ml-2" size={16} />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapView;
