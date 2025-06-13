import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import SearchBar from '@/components/destinations/SearchBar';
import DestinationCard from '@/components/destinations/DestinationCard';
import { mapTilerService } from '@/utils/mapTilerService';
import { getMapTilerApiKey } from '@/config/apiConfig';
import { generatePlaceImageUrl } from '@/utils/imageService';

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
  isMapTilerPlace: boolean;
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
        const key = await getMapTilerApiKey();
        if (key && key !== 'get_your_key_for_free_at_maptiler_com') {
          setApiKey(key);
          mapTilerService.setApiKey(key);
        }
      } catch (error) {
        console.error("Error fetching MapTiler API key:", error);
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
        // Always search for tourist places when type is city or when searching
        const cityName = query.replace(/tourist places|attractions|places in|city|in|visit|tourism|travel/gi, '').trim();
        const touristQuery = `${cityName} tourist attractions monuments temples museums parks`;
        
        console.log('Searching for tourist places with MapTiler:', touristQuery);
        
        if (apiKey && apiKey !== 'get_your_key_for_free_at_maptiler_com') {
          const mapTilerData = await mapTilerService.searchPlaces(touristQuery);
          
          if (mapTilerData && mapTilerData.results) {
            console.log('Found tourist places:', mapTilerData.results.length);
            
            const touristPlaces = await Promise.all(
              mapTilerData.results.map(async (place: any) => {
                // Generate better images using our enhanced image service
                let imageUrl = generatePlaceImageUrl(place.name);
                
                // Add location context for better images
                if (cityName) {
                  imageUrl = generatePlaceImageUrl(`${place.name} ${cityName}`);
                }

                // Get category from place types
                const types = place.types || [];
                let category = 'attraction';
                if (types.includes('museum')) category = 'historical';
                else if (types.includes('park') || types.includes('natural_feature')) category = 'nature';
                else if (types.includes('church') || types.includes('hindu_temple') || types.includes('mosque')) category = 'temple';
                else if (types.includes('tourist_attraction')) category = 'monument';

                return {
                  id: `maptiler-${place.place_id}`,
                  name: place.name,
                  location: place.formatted_address || `${place.name}, ${cityName}`,
                  imageUrl,
                  rating: place.rating || (4.0 + Math.random() * 1.0), // Random rating between 4-5 if not available
                  description: `Explore ${place.name}, a popular tourist attraction in ${cityName}. Discover the rich culture and amazing experiences this place has to offer.`,
                  category,
                  budget: 'medium',
                  place_id: place.place_id,
                  isMapTilerPlace: true,
                  coordinates: {
                    lat: place.geometry?.location?.lat || 0,
                    lng: place.geometry?.location?.lng || 0
                  }
                };
              })
            );
            
            setResults(touristPlaces);
          } else {
            console.log('No tourist places found from MapTiler');
            // Fallback to local search
            const localResults = searchDestinations(query);
            setResults(localResults);
          }
        } else {
          console.log('No MapTiler API key available, using local search');
          const localResults = searchDestinations(query);
          setResults(localResults);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        // Fallback to local search
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
          🏛️ Tourist Places & Attractions
        </h1>
        
        <div className="mb-6">
          <SearchBar />
        </div>
        
        <div className="mb-4">
          <p className="text-muted-foreground">
            {results.length} {results.length === 1 ? 'place' : 'places'} found for "{query}"
            <span className="ml-2 text-blue-600 font-medium">• Tourist Attractions</span>
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
              No tourist places found
            </h2>
            <p className="text-muted-foreground mb-6">
              Try searching for a different city or location. Make sure to check the spelling.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>💡 Try searching for:</p>
              <p>"Delhi", "Mumbai", "Goa", "Jaipur", "Kerala", etc.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
