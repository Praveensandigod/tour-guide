
import { useState, useEffect } from 'react';
import { Destination } from '@/types';
import { useDestinations } from '@/contexts/DestinationContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bookmark, Map, LandmarkIcon, Mountain, Flag, Church, MapPin, Navigation, BuildingIcon, Star } from 'lucide-react';
import { googlePlacesService } from '@/utils/googleMapsService';

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard = ({ destination }: DestinationCardProps) => {
  const { saveDestination, removeSavedDestination, isSaved } = useDestinations();
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState(destination.imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if this is a Google Places result
  const isGooglePlace = destination.id.startsWith('google-') || destination.isGooglePlace;
  
  // Fetch enhanced data from Google Places API for local destinations
  useEffect(() => {
    const fetchEnhancedData = async () => {
      if (!destination.name || isGooglePlace) return;
      
      setIsLoading(true);
      try {
        const searchResults = await googlePlacesService.searchPlaces(destination.name);
        
        if (searchResults && searchResults.results && searchResults.results.length > 0) {
          const place = searchResults.results[0];
          const placeDetails = await googlePlacesService.getPlaceDetails(place.place_id);
          
          if (placeDetails) {
            setEnhancedData(placeDetails);
            
            if (placeDetails.photos && placeDetails.photos.length > 0) {
              try {
                const photoUrl = await googlePlacesService.getPhotoUrl(placeDetails.photos[0].photo_reference);
                if (photoUrl) {
                  setImageUrl(photoUrl);
                }
              } catch (error) {
                console.error('Error fetching photo:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching enhanced data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnhancedData();
  }, [destination.name, isGooglePlace]);
  
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
        return <Church size={16} className="mr-1" />;
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
      case 'attraction':
        return <LandmarkIcon size={16} className="mr-1" />;
      default:
        return null;
    }
  };
  
  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSaved(destination.id)) {
      removeSavedDestination(destination.id);
    } else {
      saveDestination(destination);
    }
  };
  
  const budgetInfo = getBudgetLabel(destination.budget);
  const displayRating = enhancedData?.rating || destination.rating;
  const displayName = enhancedData?.name || destination.name;
  const displayAddress = enhancedData?.formatted_address || destination.location;
  
  // For Google Places, use the place_id for navigation
  const placeId = destination.place_id || destination.id.replace('google-', '');
  
  return (
    <div className="destination-card group cursor-pointer">
      <Link 
        to={`/places/${isGooglePlace ? `google-${placeId}` : destination.id}`}
        state={isGooglePlace ? {
          placeId: placeId,
          placeName: displayName,
          isGooglePlace: true,
          placeDetails: destination
        } : undefined}
        className="block"
      >
        <div className="relative">
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={(e) => {
              if (imageUrl !== destination.imageUrl) {
                setImageUrl(destination.imageUrl);
              } else {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300';
              }
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
              <div className="text-white text-sm">Loading enhanced data...</div>
            </div>
          )}
          <button
            onClick={handleSaveToggle}
            className="absolute top-2 right-2 p-1 bg-white/70 rounded-full hover:bg-white transition-colors"
            title={isSaved(destination.id) ? "Remove from saved" : "Save destination"}
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
          
          {(enhancedData || isGooglePlace) && (
            <div className="absolute top-2 left-2 bg-green-600/80 text-white px-2 py-0.5 rounded-full text-xs">
              Google Enhanced
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg truncate">{displayName}</h3>
            {budgetInfo.label && (
              <span className={budgetInfo.class}>{budgetInfo.label}</span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">{displayAddress}</p>
          
          <p className="text-sm line-clamp-2 mb-4 text-muted-foreground">
            {destination.description}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(displayRating)
                        ? 'text-yellow-500'
                        : i < displayRating
                        ? 'text-yellow-300'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="ml-1 text-xs font-medium">{displayRating.toFixed(1)}</span>
              {(enhancedData || isGooglePlace) && (
                <span className="ml-2 text-xs text-green-600">(Google)</span>
              )}
            </div>
            
            <span className="text-primary text-sm font-medium hover:underline">
              View Details
            </span>
          </div>
          
          {(enhancedData?.website || destination.website) && (
            <div className="mt-2">
              <a 
                href={enhancedData?.website || destination.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Visit Official Website
              </a>
            </div>
          )}
        </div>
      </Link>
      
      <Link
        to="/map"
        state={{ 
          destinationId: destination.id,
          placeId: enhancedData?.place_id || placeId,
          placeName: displayName,
          placeDetails: enhancedData || destination
        }}
        className="flex items-center justify-center gap-2 p-3 bg-muted/50 border-t text-sm font-medium hover:bg-muted transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <Map size={16} />
        View on Map
      </Link>
    </div>
  );
};

export default DestinationCard;
