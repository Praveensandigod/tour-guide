import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import SearchBar from '@/components/destinations/SearchBar';
import DestinationCard from '@/components/destinations/DestinationCard';
import { foursquareService } from '@/utils/foursquareService';
import { getFoursquareApiKey } from '@/config/apiConfig';

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
  isFoursquarePlace: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  photos?: string[];
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
        const key = await getFoursquareApiKey();
        if (key) {
          setApiKey(key);
          foursquareService.setApiKey(key);
        }
      } catch (error) {
        console.error("Error fetching Foursquare API key:", error);
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
        console.log('Searching for tourist places with Foursquare:', query);
        
        if (apiKey) {
          const foursquareData = await foursquareService.searchPlaces(query);
          
          if (foursquareData && foursquareData.results) {
            console.log('Found tourist places:', foursquareData.results.length);
            
            const touristPlaces = foursquareData.results.map((place: any) => {
              // Use Foursquare photos if available, otherwise fallback to Unsplash
              let imageUrl = 'https://source.unsplash.com/400x300/?tourist,attraction';
              if (place.photos && place.photos.length > 0) {
                imageUrl = place.photos[0].url || place.photos[0].photo_reference;
              } else {
                imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(place.name + ' tourist attraction')}`;
              }

              // Determine category from place types
              const types = place.types || [];
              let category = 'attraction';
              if (types.some((type: string) => type.includes('museum'))) category = 'historical';
              else if (types.some((type: string) => type.includes('park') || type.includes('outdoor'))) category = 'nature';
              else if (types.some((type: string) => type.includes('temple') || type.includes('church'))) category = 'temple';
              else if (types.some((type: string) => type.includes('monument') || type.includes('landmark'))) category = 'monument';

              return {
                id: `foursquare-${place.place_id}`,
                name: place.name,
                location: place.formatted_address,
                imageUrl,
                rating: place.rating || (4.0 + Math.random() * 1.0),
                description: `Explore ${place.name}, a popular tourist attraction. Discover the rich culture and amazing experiences this place has to offer.`,
                category,
                budget: 'medium',
                place_id: place.place_id,
                isFoursquarePlace: true,
                coordinates: {
                  lat: place.geometry.location.lat,
                  lng: place.geometry.location.lng
                },
                photos: place.photos?.map((photo: any) => photo.url || photo.photo_reference) || [],
                website: place.website,
                phone: place.phone
              };
            });
            
            setResults(touristPlaces);
          } else {
            console.log('No tourist places found from Foursquare');
            // Fallback to local search
            const localResults = searchDestinations(query);
            setResults(localResults);
          }
        } else {
          console.log('No Foursquare API key available, using local search');
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
            <span className="ml-2 text-blue-600 font-medium">• Powered by Foursquare</span>
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
