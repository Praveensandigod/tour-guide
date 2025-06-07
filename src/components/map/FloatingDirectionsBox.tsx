
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigation, MapPin, Clock, Route } from 'lucide-react';
import { mapsService } from '@/utils/mapsService';
import { useToast } from '@/components/ui/use-toast';

interface FloatingDirectionsBoxProps {
  isLoading?: boolean;
}

interface DirectionResult {
  distance: string;
  duration: string;
  steps: Array<{
    instructions: string;
    distance: string;
    duration: string;
  }>;
}

const FloatingDirectionsBox: React.FC<FloatingDirectionsBoxProps> = ({ 
  isLoading = false 
}) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGettingDirections, setIsGettingDirections] = useState(false);
  const [directionResult, setDirectionResult] = useState<DirectionResult | null>(null);
  const { toast } = useToast();

  const handleGetDirections = async () => {
    if (!origin.trim() || !destination.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both origin and destination.",
        variant: "destructive"
      });
      return;
    }

    setIsGettingDirections(true);
    setDirectionResult(null);
    
    try {
      const directions = await mapsService.getDirections(origin, destination);
      
      if (directions && directions.routes && directions.routes.length > 0) {
        const route = directions.routes[0];
        const leg = route.legs[0];
        
        setDirectionResult({
          distance: leg.distance.text,
          duration: leg.duration.text,
          steps: leg.steps.slice(0, 5).map(step => ({
            instructions: step.instructions,
            distance: step.distance.text,
            duration: step.duration.text
          }))
        });
        
        toast({
          title: "Directions Found",
          description: `Route: ${leg.distance.text}, ${leg.duration.text}`,
        });
      } else {
        toast({
          title: "No Route Found",
          description: "Could not find a route between these locations.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      toast({
        title: "Error",
        description: "Failed to get directions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGettingDirections(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border p-4 w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Navigation size={16} />
            Directions
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="From (origin)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="To (destination)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button 
              onClick={handleGetDirections}
              disabled={!origin.trim() || !destination.trim() || isLoading || isGettingDirections}
              className="w-full"
            >
              {isGettingDirections ? 'Getting Directions...' : 'Get Directions'}
            </Button>
            
            {directionResult && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Route size={16} className="text-primary" />
                  <span className="font-medium">Route Found</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Navigation size={14} />
                    {directionResult.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {directionResult.duration}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Directions:</h4>
                  {directionResult.steps.map((step, index) => (
                    <div key={index} className="text-xs text-muted-foreground p-2 bg-background rounded">
                      <div className="font-medium">{index + 1}. {step.instructions}</div>
                      <div className="text-xs mt-1">{step.distance} • {step.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {(isLoading || isGettingDirections) && (
              <div className="text-center text-sm text-muted-foreground">
                Finding the best route...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingDirectionsBox;
