
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigation, MapPin, Clock, Route as RouteIcon } from 'lucide-react';
import { Route } from '@/services/freeMapService';

interface DirectionsPanelProps {
  onDirectionsRequest: (origin: string, destination: string) => void;
  isLoading?: boolean;
  currentRoute?: Route | null;
}

const DirectionsPanel: React.FC<DirectionsPanelProps> = ({ 
  onDirectionsRequest,
  isLoading = false,
  currentRoute
}) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGetDirections = () => {
    if (origin.trim() && destination.trim()) {
      onDirectionsRequest(origin.trim(), destination.trim());
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
              disabled={!origin.trim() || !destination.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Getting Directions...' : 'Get Directions'}
            </Button>
            
            {currentRoute && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RouteIcon size={16} className="text-primary" />
                  <span className="font-medium">Route Found</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Navigation size={14} />
                    {currentRoute.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {currentRoute.duration}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Directions:</h4>
                  {currentRoute.steps.slice(0, 5).map((step, index) => (
                    <div key={index} className="text-xs text-muted-foreground p-2 bg-background rounded">
                      <div className="font-medium">{index + 1}. {step.instruction}</div>
                      <div className="text-xs mt-1">{step.distance} • {step.duration}</div>
                    </div>
                  ))}
                  {currentRoute.steps.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center">
                      ... and {currentRoute.steps.length - 5} more steps
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectionsPanel;
