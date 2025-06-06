
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigation, MapPin } from 'lucide-react';

interface FloatingDirectionsBoxProps {
  isLoading?: boolean;
}

const FloatingDirectionsBox: React.FC<FloatingDirectionsBoxProps> = ({ 
  isLoading = false 
}) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGetDirections = () => {
    if (origin.trim() && destination.trim()) {
      // This will be handled by the parent component
      console.log('Getting directions from', origin, 'to', destination);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border p-4 w-80">
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
            
            {isLoading && (
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
