
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDestinations } from '@/contexts/DestinationContext';
import { useDebounce } from 'use-debounce';
import { getGoogleMapsApiKey } from '@/config/apiConfig';
import { googlePlacesService } from '@/utils/googleMapsService';

interface SearchResult {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  rating?: number;
  isGooglePlace?: boolean;
  place_id?: string;
  geometry?: any;
}

const SearchBar = () => {
  const { searchDestinations, currentSearchQuery, setCurrentSearchQuery } = useDestinations();
  const [query, setQuery] = useState(currentSearchQuery);
  const [debouncedQuery] = useDebounce(query, 300);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Fetch API key on component mount
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await getGoogleMapsApiKey();
        setApiKey(key);
      } catch (error) {
        console.error("Error fetching Google Maps API key:", error);
      }
    };
    
    fetchApiKey();
  }, []);
  
  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 3) {
        setSearchResults([]);
        setIsSearchActive(false);
        return;
      }

      setIsLoading(true);
      setIsSearchActive(true);

      try {
        // Search local destinations first
        const localResults = searchDestinations(debouncedQuery);
        const formattedLocalResults: SearchResult[] = localResults.slice(0, 3).map(dest => ({
          id: dest.id,
          name: dest.name,
          location: dest.location,
          imageUrl: dest.imageUrl,
          rating: dest.rating,
          isGooglePlace: false
        }));

        // Search Google Places if API key is available
        let googleResults: SearchResult[] = [];
        if (apiKey) {
          const googleData = await googlePlacesService.searchPlaces(debouncedQuery);
          
          if (googleData && googleData.results) {
            googleResults = await Promise.all(
              googleData.results.slice(0, 5).map(async (place: any) => {
                let imageUrl = 'https://via.placeholder.com/100';
                
                // Get photo if available
                if (place.photos && place.photos.length > 0) {
                  try {
                    const photoUrl = await googlePlacesService.getPhotoUrl(place.photos[0].photo_reference);
                    if (photoUrl) imageUrl = photoUrl;
                  } catch (error) {
                    console.error('Error getting photo:', error);
                  }
                }

                return {
                  id: place.place_id,
                  name: place.name,
                  location: place.formatted_address || '',
                  imageUrl,
                  rating: place.rating || 0,
                  isGooglePlace: true,
                  place_id: place.place_id,
                  geometry: place.geometry
                };
              })
            );
          }
        }

        const combinedResults = [...formattedLocalResults, ...googleResults];
        setSearchResults(combinedResults);
      } catch (error) {
        console.error('Search error:', error);
        const localResults = searchDestinations(debouncedQuery);
        setSearchResults(localResults.slice(0, 5).map(dest => ({
          id: dest.id,
          name: dest.name,
          location: dest.location,
          imageUrl: dest.imageUrl,
          rating: dest.rating,
          isGooglePlace: false
        })));
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, apiKey, searchDestinations]);
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      setCurrentSearchQuery(query);
      setIsSearchActive(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setIsSearchActive(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.isGooglePlace) {
      // Navigate to PlaceDetailPage for Google Places
      navigate(`/places/google-${result.id}`, { 
        state: { 
          placeId: result.place_id, 
          placeName: result.name,
          placeDetails: result,
          isGooglePlace: true
        } 
      });
    } else {
      // Navigate to PlaceDetailPage for local destinations
      navigate(`/places/${result.id}`);
    }
    setIsSearchActive(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.search-results')
      ) {
        setIsSearchActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search destinations..."
          value={query}
          onChange={handleQueryChange}
          onFocus={() => query.trim().length > 2 && setIsSearchActive(true)}
          className="w-full pl-10 pr-10 py-2 rounded-full border border-input"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {isSearchActive && (
        <div className="search-results absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              Searching places...
            </div>
          )}
          
          {!isLoading && searchResults.length > 0 && searchResults.map(result => (
            <div
              key={`${result.isGooglePlace ? 'google' : 'local'}-${result.id}`}
              className="flex items-center p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50"
              onClick={() => handleResultClick(result)}
            >
              <div className="w-12 h-12 mr-3 rounded overflow-hidden flex-shrink-0">
                <img
                  src={result.imageUrl}
                  alt={result.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100';
                  }}
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm flex items-center">
                  {result.name}
                  {result.isGooglePlace && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                      Google
                    </span>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground flex items-center">
                  <MapPin size={12} className="mr-1" />
                  {result.location}
                </p>
                {result.rating && result.rating > 0 && (
                  <div className="flex items-center mt-1">
                    <Star size={12} className="text-yellow-500 mr-1" fill="currentColor" />
                    <span className="text-xs">{result.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {!isLoading && searchResults.length === 0 && query.length >= 3 && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              No places found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
