
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Volume2, VolumeX, ArrowLeft, RotateCcw, GripHorizontal, X, Minimize2, Maximize2, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FloatingDirectionsBoxProps {
  startLocation: string;
  endLocation: string;
  setStartLocation: (value: string) => void;
  setEndLocation: (value: string) => void;
  handleDirections: () => void;
  isLoading: boolean;
  directionsResponse: google.maps.DirectionsResult | null;
  speakDirections: () => void;
  isSpeakingDirections: boolean;
  onClose: () => void;
}

const FloatingDirectionsBox: React.FC<FloatingDirectionsBoxProps> = ({
  startLocation,
  endLocation,
  setStartLocation,
  setEndLocation,
  handleDirections,
  isLoading,
  directionsResponse,
  speakDirections,
  isSpeakingDirections,
  onClose
}) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use Google Geocoding API to get address from coordinates
          const geocoder = new google.maps.Geocoder();
          const latlng = { lat: latitude, lng: longitude };
          
          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const address = results[0].formatted_address;
              setStartLocation(address);
              toast({
                title: "Location Found",
                description: "Your current location has been set as the start point.",
              });
            } else {
              // Fallback to coordinates if geocoding fails
              setStartLocation(`${latitude}, ${longitude}`);
              toast({
                title: "Location Found",
                description: "Your current coordinates have been set as the start point.",
              });
            }
            setIsGettingLocation(false);
          });
        } catch (error) {
          // Fallback to coordinates if there's an error
          setStartLocation(`${latitude}, ${longitude}`);
          toast({
            title: "Location Found",
            description: "Your current coordinates have been set as the start point.",
          });
          setIsGettingLocation(false);
        }
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive"
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 320;
      const maxY = window.innerHeight - 200;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <Card 
      ref={cardRef}
      className="fixed z-50 w-[320px] shadow-lg bg-white/95 backdrop-blur-sm border-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <div 
        className="flex items-center justify-between p-2 border-b cursor-grab active:cursor-grabbing bg-gray-50/80"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Directions</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <CardContent className="p-4">
          <div className="mb-2">
            <label className="block mb-1 text-sm font-medium">Start Location</label>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter start location"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="px-2"
                title="Get current location"
              >
                {isGettingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
              </Button>
            </div>
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
      )}
    </Card>
  );
};

export default FloatingDirectionsBox;
