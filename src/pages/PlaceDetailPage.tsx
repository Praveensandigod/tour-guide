
import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import { Bookmark, Map, ArrowLeft, Star, Globe, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { googlePlacesService } from '@/utils/googleMapsService';
import { useToast } from '@/components/ui/use-toast';

interface PlaceData {
  place_id?: string;
  name: string;
  formatted_address: string;
  rating?: number;
  photos?: any[];
  website?: string;
  opening_hours?: any;
  international_phone_number?: string;
  geometry?: any;
  reviews?: any[];
}

interface RelatedPlace {
  id: string;
  name: string;
  formatted_address: string;
  rating: number;
  photos?: string[];
  place_id?: string;
}

const PlaceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { destinations, saveDestination, isSaved, removeSavedDestination } = useDestinations();
  const [destination, setDestination] = useState(destinations.find(d => d.id === id));
  const [placeData, setPlaceData] = useState<PlaceData | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [relatedPlaces, setRelatedPlaces] = useState<RelatedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const { toast } = useToast();
  
  // Handle Google Place data from location state
  const googlePlaceData = location.state?.placeDetails;
  const isGooglePlace = location.state?.isGooglePlace || id?.startsWith('google-');
  const actualPlaceId = location.state?.placeId || (isGooglePlace ? id?.replace('google-', '') : null);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const fetchPlaceData = async () => {
      setIsLoading(true);
      
      try {
        if (isGooglePlace && actualPlaceId) {
          // Fetch Google Place details directly
          const placeDetails = await googlePlacesService.getPlaceDetails(actualPlaceId);
          
          if (placeDetails) {
            setPlaceData(placeDetails);
            await loadPhotos(placeDetails.photos || []);
            
            // Search for related places
            const searchResults = await googlePlacesService.searchPlaces(`near ${placeDetails.name}`);
            if (searchResults?.results) {
              await loadRelatedPlaces(searchResults.results.slice(1, 4)); // Skip first result (likely the same place)
            }
          }
        } else if (googlePlaceData) {
          // Use provided Google Place data
          setPlaceData(googlePlaceData);
          await loadPhotos(googlePlaceData.photos || []);
        } else if (destination) {
          // For existing destinations, enhance with Google data
          const searchResults = await googlePlacesService.searchPlaces(destination.name);
          
          if (searchResults?.results && searchResults.results.length > 0) {
            const place = searchResults.results[0];
            const placeDetails = await googlePlacesService.getPlaceDetails(place.place_id);
            
            if (placeDetails) {
              setPlaceData(placeDetails);
              await loadPhotos(placeDetails.photos || []);
              
              // Load related places
              await loadRelatedPlaces(searchResults.results.slice(1, 4));
            }
          } else {
            // Fallback to destination data
            setPlaceData({
              name: destination.name,
              formatted_address: destination.location,
              rating: destination.rating
            });
          }
        }
      } catch (error) {
        console.error('Error fetching place data:', error);
        if (destination) {
          setPlaceData({
            name: destination.name,
            formatted_address: destination.location,
            rating: destination.rating
          });
        }
        toast({
          title: "Error loading place details",
          description: "Some information may not be available.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlaceData();
  }, [id, destination, isGooglePlace, googlePlaceData, actualPlaceId, toast]);
  
  const loadPhotos = async (photoReferences: any[]) => {
    if (!photoReferences || photoReferences.length === 0) return;
    
    try {
      const photoUrls = await Promise.all(
        photoReferences.slice(0, 6).map(async (photo) => {
          const photoUrl = await googlePlacesService.getPhotoUrl(photo.photo_reference || photo);
          return photoUrl;
        })
      );
      
      setPhotos(photoUrls.filter(url => url !== null));
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const loadRelatedPlaces = async (places: any[]) => {
    try {
      const related = await Promise.all(
        places.map(async (place): Promise<RelatedPlace> => {
          let photoUrl = '';
          if (place.photos && place.photos.length > 0) {
            try {
              photoUrl = await googlePlacesService.getPhotoUrl(place.photos[0].photo_reference) || '';
            } catch (error) {
              console.error('Error loading related place photo:', error);
            }
          }

          return {
            id: `google-${place.place_id}`,
            name: place.name,
            formatted_address: place.formatted_address || '',
            rating: place.rating || 0,
            photos: photoUrl ? [photoUrl] : [],
            place_id: place.place_id
          };
        })
      );
      
      setRelatedPlaces(related);
    } catch (error) {
      console.error('Error loading related places:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="pb-24">
        <div className="relative h-[50vh] bg-muted animate-pulse"></div>
        <div className="container mx-auto max-w-4xl px-4">
          <div className="relative -mt-24 bg-background rounded-t-3xl p-6 shadow-lg">
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-4 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!placeData && !destination) {
    return (
      <div className="container mx-auto max-w-4xl py-12 text-center pb-24">
        <h1 className="text-2xl font-bold mb-4">Place not found</h1>
        <p className="mb-6">The place you're looking for doesn't exist or couldn't be loaded.</p>
        <Link to="/recommendations">
          <Button>Explore Other Places</Button>
        </Link>
      </div>
    );
  }
  
  const displayData = placeData || {
    name: destination?.name || '',
    formatted_address: destination?.location || '',
    rating: destination?.rating || 0
  };
  
  const getBudgetLabel = (budget: string) => {
    switch (budget) {
      case 'low':
        return { label: 'Budget Friendly', class: 'bg-green-100 text-green-800' };
      case 'medium':
        return { label: 'Mid-range', class: 'bg-yellow-100 text-yellow-800' };
      case 'high':
        return { label: 'Luxury', class: 'bg-red-100 text-red-800' };
      default:
        return { label: '', class: '' };
    }
  };
  
  const budgetInfo = destination ? getBudgetLabel(destination.budget) : { label: '', class: '' };
  
  const handleSaveToggle = () => {
    if (!destination) return;
    
    if (isSaved(destination.id)) {
      removeSavedDestination(destination.id);
    } else {
      saveDestination(destination);
    }
  };
  
  // Use photos or fallback to destination image
  const heroImage = photos[0] || destination?.imageUrl || 'https://via.placeholder.com/800x400';
  
  return (
    <div className="pb-24">
      <div className="relative h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            transform: `translateY(${scrollY * 0.5}px)` 
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/95"></div>
        
        <Link to="/recommendations" className="absolute top-4 left-4 z-10">
          <Button variant="outline" size="icon" className="bg-background/50 backdrop-blur-sm">
            <ArrowLeft size={18} />
          </Button>
        </Link>
      </div>
      
      <div className="container mx-auto max-w-4xl px-4">
        <div className="relative -mt-24 bg-background rounded-t-3xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold mb-2">{displayData.name}</h1>
            {destination && (
              <button
                onClick={handleSaveToggle}
                className="bg-white p-2 rounded-full shadow-md hover:bg-muted transition-colors"
              >
                <Bookmark 
                  size={20} 
                  fill={isSaved(destination.id) ? "currentColor" : "none"} 
                  className={isSaved(destination.id) ? "text-primary" : ""}
                />
              </button>
            )}
          </div>
          
          <div className="flex items-center mb-4">
            <p className="text-muted-foreground">{displayData.formatted_address}</p>
            {budgetInfo.label && (
              <>
                <span className="mx-2">•</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${budgetInfo.class}`}>
                  {budgetInfo.label}
                </span>
              </>
            )}
          </div>
          
          {displayData.rating && displayData.rating > 0 && (
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(displayData.rating!)
                        ? 'text-yellow-500'
                        : i < displayData.rating!
                        ? 'text-yellow-300'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="ml-2 text-sm font-medium">{displayData.rating.toFixed(1)} / 5</span>
            </div>
          )}
          
          <h2 className="text-xl font-bold mb-2">About this place</h2>
          <p className="text-muted-foreground mb-6">
            {destination?.description || `Discover ${displayData.name}, a wonderful place to visit with rich culture and amazing experiences.`}
          </p>
          
          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {displayData.website && (
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-primary" />
                <a 
                  href={displayData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
            
            {displayData.international_phone_number && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-primary" />
                <span className="text-sm">{displayData.international_phone_number}</span>
              </div>
            )}
            
            {displayData.opening_hours && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <span className="text-sm">Check opening hours</span>
              </div>
            )}
          </div>
          
          <Link 
            to="/map"
            state={{
              destinationId: destination?.id,
              placeId: placeData?.place_id || actualPlaceId,
              placeName: displayData.name,
              placeDetails: placeData
            }}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Map size={18} />
            View on Map
          </Link>
        </div>
      </div>
      
      {photos.length > 0 && (
        <div className="container mx-auto max-w-4xl px-4 mt-8">
          <h2 className="text-xl font-bold mb-4">Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <img 
                key={index}
                src={photo} 
                alt={`${displayData.name} ${index + 1}`} 
                className="rounded-lg h-40 w-full object-cover"
              />
            ))}
          </div>
        </div>
      )}
      
      {relatedPlaces.length > 0 && (
        <div className="container mx-auto max-w-4xl px-4 mt-8">
          <h2 className="text-xl font-bold mb-4">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedPlaces.map(place => (
              <Link 
                key={place.id} 
                to={`/places/${place.id}`}
                state={{
                  placeId: place.place_id,
                  placeName: place.name,
                  isGooglePlace: true
                }}
                className="group"
              >
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={place.photos?.[0] || 'https://via.placeholder.com/300x200'} 
                    alt={place.name} 
                    className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-medium mt-2">{place.name}</h3>
                <p className="text-sm text-muted-foreground">{place.formatted_address}</p>
                {place.rating > 0 && (
                  <div className="flex items-center mt-1">
                    <Star size={12} className="text-yellow-500 mr-1" fill="currentColor" />
                    <span className="text-xs">{place.rating.toFixed(1)}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceDetailPage;
