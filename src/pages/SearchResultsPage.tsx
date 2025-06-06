
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import SearchBar from '@/components/destinations/SearchBar';
import DestinationCard from '@/components/destinations/DestinationCard';
import { mapsService } from '@/utils/mapsService';
import { useToast } from '@/components/ui/use-toast';

interface TouristPlace {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  rating: number;
  description: string;
  category: string;
  budget: string;
  place_id: string;
  isFreeApiPlace: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const searchType = searchParams.get('type') || 'places';
  const { searchDestinations, setCurrentSearchQuery, currentSearchQuery } = useDestinations();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      navigate('/recommendations');
      return;
    }

    if (query !== currentSearchQuery) {
      setCurrentSearchQuery(query);
    }
    
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (searchType === 'city') {
          // Fetch tourist places for the city using free APIs
          const cityName = query.replace(/tourist places|attractions|places in|city|in|visit/gi, '').trim();
          
          if (cityName.length < 2) {
            throw new Error('City name too short');
          }
          
          const freeApiData = await mapsService.searchTouristPlaces(cityName);
          
          if (freeApiData && freeApiData.results) {
            const touristPlaces = await Promise.all(
              freeApiData.results.map(async (place: any) => {
                let imageUrl = `https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop`;
                
                if (place.photos && place.photos.length > 0) {
                  try {
                    const photoUrl = await mapsService.getPhotoUrl(place.photos[0]);
                    if (photoUrl) imageUrl = photoUrl;
                  } catch (error) {
                    console.error('Error getting photo:', error);
                  }
                }

                // Get category from place types
                const types = place.types || [];
                let category = 'attraction';
                if (types.includes('museum')) category = 'historical';
                else if (types.includes('park')) category = 'nature';
                else if (types.includes('church') || types.includes('hindu_temple')) category = 'temple';
                else if (types.includes('tourist_attraction')) category = 'monument';

                return {
                  id: `free-${place.place_id}`,
                  name: place.name,
                  location: place.formatted_address || '',
                  imageUrl,
                  rating: place.rating || 4.0,
                  description: `Explore ${place.name}, a popular tourist attraction in ${cityName}. Discover the rich culture and amazing experiences this place has to offer.`,
                  category,
                  budget: place.budget || 'medium',
                  place_id: place.place_id,
                  isFreeApiPlace: true,
                  coordinates: place.geometry?.location
                };
              })
            );
            
            setResults(touristPlaces);
          } else {
            setResults([]);
          }
        } else {
          // Regular search - combine local and free API results
          const localResults = searchDestinations(query);
          
          try {
            const freeApiData = await mapsService.searchPlaces(query);
            let freeApiResults: any[] = [];
            
            if (freeApiData && freeApiData.results) {
              freeApiResults = await Promise.all(
                freeApiData.results.slice(0, 10).map(async (place: any) => {
                  let imageUrl = `https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop`;
                  
                  if (place.photos && place.photos.length > 0) {
                    try {
                      const photoUrl = await mapsService.getPhotoUrl(place.photos[0]);
                      if (photoUrl) imageUrl = photoUrl;
                    } catch (error) {
                      console.error('Error getting photo:', error);
                    }
                  }

                  const types = place.types || [];
                  let category = 'attraction';
                  if (types.includes('museum')) category = 'historical';
                  else if (types.includes('park')) category = 'nature';
                  else if (types.includes('church') || types.includes('hindu_temple')) category = 'temple';
                  else if (types.includes('tourist_attraction')) category = 'monument';

                  return {
                    id: `free-${place.place_id}`,
                    name: place.name,
                    location: place.formatted_address || '',
                    imageUrl,
                    rating: place.rating || 4.0,
                    description: `Discover ${place.name}. A wonderful place to visit with amazing experiences and rich culture.`,
                    category,
                    budget: place.budget || 'medium',
                    place_id: place.place_id,
                    isFreeApiPlace: true,
                    coordinates: place.geometry?.location
                  };
                })
              );
            }
            
            // Combine local and free API results
            setResults([...localResults, ...freeApiResults]);
          } catch (error) {
            console.error('Error fetching from free APIs:', error);
            setResults(localResults);
            toast({
              title: "API Warning",
              description: "Some search features may be limited. Showing local results.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('Failed to load search results');
        const localResults = searchDestinations(query);
        setResults(localResults);
        
        toast({
          title: "Search Error",
          description: "Some results may be missing. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, searchType, searchDestinations, setCurrentSearchQuery, currentSearchQuery, navigate, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl pb-24">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Search Results</h1>
          <div className="mb-6">
            <SearchBar />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-lg shadow-md bg-card animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl pb-24">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">
          {searchType === 'city' ? 'Tourist Places' : 'Search Results'}
        </h1>
        
        <div className="mb-6">
          <SearchBar />
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-muted-foreground">
            {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
            {searchType === 'city' && (
              <span className="ml-2 text-blue-600 font-medium">🏛️ Tourist Places</span>
            )}
          </p>
        </div>
        
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {results.map(destination => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">
              {searchType === 'city' ? 'No tourist places found' : 'No destinations found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {searchType === 'city' 
                ? 'Try searching for a different city or check the spelling'
                : 'Try searching with different terms or explore our recommended destinations'
              }
            </p>
            <button 
              onClick={() => navigate('/recommendations')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Browse Recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
