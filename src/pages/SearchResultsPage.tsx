import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import SearchBar from '@/components/destinations/SearchBar';
import DestinationCard from '@/components/destinations/DestinationCard';
import { mapboxService } from '@/utils/mapboxService';
import { getMapboxApiKey } from '@/config/apiConfig';

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
  isMapboxPlace: boolean;
}

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const searchType = searchParams.get('type') || 'places';
  const { searchDestinations, setCurrentSearchQuery, currentSearchQuery } = useDestinations();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await getMapboxApiKey();
        if (key) {
          setApiKey(key);
          mapboxService.setApiKey(key);
        }
      } catch (error) {
        console.error("Error fetching Mapbox API key:", error);
      }
    };
    
    fetchApiKey();
  }, []);

  useEffect(() => {
    if (!query) {
      navigate('/recommendations');
      return;
    }

    if (query !== currentSearchQuery) {
      setCurrentSearchQuery(query);
    }
    
    const fetchResults = async () => {
      setIsLoading(true);
      
      try {
        if (searchType === 'city') {
          // Fetch tourist places for the city
          const cityName = query.replace(/tourist places|attractions|places in|city|in|visit/gi, '').trim();
          const touristQuery = `tourist attractions in ${cityName}`;
          
          if (apiKey) {
            const mapboxData = await mapboxService.searchPlaces(touristQuery);
            
            if (mapboxData && mapboxData.results) {
              const touristPlaces = await Promise.all(
                mapboxData.results.map(async (place: any) => {
                  let imageUrl = 'https://via.placeholder.com/300x200';
                  
                  if (place.photos && place.photos.length > 0) {
                    try {
                      const photoUrl = await mapboxService.getPhotoUrl(place.photos[0].photo_reference);
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
                    id: `mapbox-${place.place_id}`,
                    name: place.name,
                    location: place.formatted_address || '',
                    imageUrl,
                    rating: place.rating || 4.0,
                    description: `Explore ${place.name}, a popular tourist attraction in ${cityName}. Discover the rich culture and amazing experiences this place has to offer.`,
                    category,
                    budget: 'medium',
                    place_id: place.place_id,
                    isMapboxPlace: true
                  };
                })
              );
              
              setResults(touristPlaces);
            } else {
              setResults([]);
            }
          } else {
            setResults([]);
          }
        } else {
          // Regular search
          const localResults = searchDestinations(query);
          setResults(localResults);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        const localResults = searchDestinations(query);
        setResults(localResults);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, searchType, searchDestinations, setCurrentSearchQuery, currentSearchQuery, navigate, apiKey]);

  
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
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
