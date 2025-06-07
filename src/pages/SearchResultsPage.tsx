
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import SearchBar from '@/components/destinations/SearchBar';
import DestinationCard from '@/components/destinations/DestinationCard';
import { freeMapService } from '@/services/freeMapService';
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
          // Fetch tourist places for the city using free map service
          const cityName = query.replace(/tourist places|attractions|places in|city|in|visit/gi, '').trim();
          
          if (cityName.length < 2) {
            throw new Error('City name too short');
          }
          
          const touristPlaces = await freeMapService.searchTouristPlaces(cityName);
          
          const formattedResults = touristPlaces.map(place => ({
            id: `free-${place.id}`,
            name: place.name,
            location: place.address,
            imageUrl: place.imageUrl,
            rating: place.rating,
            description: `Explore ${place.name}, a popular tourist attraction in ${cityName}. Discover the rich culture and amazing experiences this place has to offer.`,
            category: place.category,
            budget: 'medium',
            place_id: place.id,
            isFreeApiPlace: true,
            coordinates: {
              lat: place.lat,
              lng: place.lng
            }
          }));
          
          setResults(formattedResults);
        } else {
          // Regular search - combine local and free API results
          const localResults = searchDestinations(query);
          
          const apiPlaces = await freeMapService.searchPlaces(query, 10);
          const apiResults = apiPlaces.map(place => ({
            id: `free-${place.id}`,
            name: place.name,
            location: place.address,
            imageUrl: place.imageUrl,
            rating: place.rating,
            description: `Discover ${place.name}. A wonderful place to visit with amazing experiences and rich culture.`,
            category: place.category,
            budget: 'medium',
            place_id: place.id,
            isFreeApiPlace: true,
            coordinates: {
              lat: place.lat,
              lng: place.lng
            }
          }));
          
          // Combine local and free API results
          setResults([...localResults, ...apiResults]);
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
