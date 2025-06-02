import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Volume2, VolumeX, ArrowLeft, RotateCcw, GripHorizontal, X, Minimize2, Maximize2 } from 'lucide-react';

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
  isSpeakingDirections
}) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
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

  if (!isVisible) return null;

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
            onClick={() => setIsVisible(false)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
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
      )}
    </Card>
  );
};

export default FloatingDirectionsBox;
