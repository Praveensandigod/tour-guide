
import { Destination } from '@/types';
import { useDestinations } from '@/contexts/DestinationContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bookmark, Map, LandmarkIcon, Mountain, Flag, Temple, MapPin, Navigation, BuildingIcon } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard = ({ destination }: DestinationCardProps) => {
  const { saveDestination, isSaved } = useDestinations();
  
  const getBudgetLabel = (budget: string) => {
    switch (budget) {
      case 'low':
        return { label: 'Budget', class: 'budget-badge budget-low' };
      case 'medium':
        return { label: 'Mid-range', class: 'budget-badge budget-medium' };
      case 'high':
        return { label: 'Luxury', class: 'budget-badge budget-high' };
      default:
        return { label: '', class: '' };
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'historical':
        return <LandmarkIcon size={16} className="mr-1" />;
      case 'temple':
        return <Temple size={16} className="mr-1" />;
      case 'nature':
        return <MapPin size={16} className="mr-1" />;
      case 'mountain':
        return <Mountain size={16} className="mr-1" />;
      case 'beach':
        return <Navigation size={16} className="mr-1" />;
      case 'monument':
        return <Flag size={16} className="mr-1" />;
      case 'statue':
        return <BuildingIcon size={16} className="mr-1" />;
      default:
        return null;
    }
  };
  
  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  const budgetInfo = getBudgetLabel(destination.budget);
  
  return (
    <div className="destination-card group">
      <div className="relative">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            saveDestination(destination);
          }}
          className="absolute top-2 right-2 p-1 bg-white/70 rounded-full hover:bg-white transition-colors"
          aria-label={isSaved(destination.id) ? "Saved" : "Save this destination"}
        >
          <Bookmark 
            size={20} 
            fill={isSaved(destination.id) ? "currentColor" : "none"} 
            className={isSaved(destination.id) ? "text-primary" : ""}
          />
        </button>
        
        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs flex items-center">
          {getCategoryIcon(destination.category)}
          {getCategoryLabel(destination.category)}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg truncate">{destination.name}</h3>
          <span className={budgetInfo.class}>{budgetInfo.label}</span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">{destination.location}</p>
        
        <p className="text-sm line-clamp-2 mb-4 text-muted-foreground">{destination.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(destination.rating)
                      ? 'text-yellow-500'
                      : i < destination.rating
                      ? 'text-yellow-300'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-1 text-xs font-medium">{destination.rating}</span>
          </div>
          
          <Link 
            to={`/destinations/${destination.id}`} 
            className="text-primary text-sm font-medium hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
      
      <Link
        to={`/map?destination=${destination.id}`}
        state={{ destinationId: destination.id }}
        className="flex items-center justify-center gap-2 p-3 bg-muted/50 border-t text-sm font-medium hover:bg-muted transition-colors"
      >
        <Map size={16} />
        View on Map
      </Link>
    </div>
  );
};

export default DestinationCard;
