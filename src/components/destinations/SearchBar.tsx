
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDestinations } from '@/contexts/DestinationContext';
import { useDebounce } from 'use-debounce';
import { getMapboxApiKey } from '@/config/apiConfig';
import { mapboxService } from '@/utils/mapboxService';

interface SearchResult {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  rating?: number;
  isMapboxPlace?: boolean;
  place_id?: string;
  geometry?: any;
  types?: string[];
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
  
  // Search functionality - Always search for tourist places
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setSearchResults([]);
        setIsSearchActive(false);
        return;
      }

      setIsLoading(true);
      setIsSearchActive(true);

      try {
        let combinedResults: SearchResult[] = [];

        // Always search for tourist places regardless of query
        // First, search for the city/place itself to get location context
        let cityName = debouncedQuery.trim();
        
        // Clean up common search terms to get the actual city name
        cityName = cityName.replace(/tourist places|attractions|places in|city|in|visit|tourism|travel/gi, '').trim();
        
        // Search for tourist attractions in the specified location
        const touristQuery = `tourist attractions ${cityName}`;
        console.log('Searching for tourist places with query:', touristQuery);
        
        if (apiKey) {
          const mapboxData = await mapboxService.searchPlaces(touristQuery);
          
          if (mapboxData && mapboxData.results) {
            console.log('Found Mapbox results:', mapboxData.results.length);
            
            const touristPlaces = await Promise.all(
              mapboxData.results.slice(0, 8).map(async (place: any) => {
                let imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(place.name + ' tourist attraction landmark')}&auto=format&fit=crop`;
                
                // Try to get a better image using place name
                if (place.name) {
                  const placeImageQuery = `${place.name} ${cityName} landmark tourism attraction`.replace(/\s+/g, ' ').trim();
                  imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(placeImageQuery)}&auto=format&fit=crop`;
                }

                return {
                  id: place.place_id,
                  name: place.name,
                  location: place.formatted_address || `${place.name}, ${cityName}`,
                  imageUrl,
                  rating: place.rating || 4.2,
                  isMapboxPlace: true,
                  place_id: place.place_id,
                  geometry: place.geometry,
                  types: place.types || ['tourist_attraction']
                };
              })
            );
            
            combinedResults = touristPlaces;
          }
        }

        // Also search local destinations as backup
        const localResults = searchDestinations(debouncedQuery);
        const formattedLocalResults: SearchResult[] = localResults.slice(0, 3).map(dest => ({
          id: dest.id,
          name: dest.name,
          location: dest.location,
          imageUrl: `https://source.unsplash.com/400x300/?${encodeURIComponent(dest.name + ' tourist destination')}&auto=format&fit=crop`,
          rating: dest.rating,
          isMapboxPlace: false
        }));

        // Combine results, prioritizing tourist places
        combinedResults = [...combinedResults, ...formattedLocalResults];
        
        console.log('Final combined results:', combinedResults.length);
        setSearchResults(combinedResults);
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to local search
        const localResults = searchDestinations(debouncedQuery);
        setSearchResults(localResults.slice(0, 5).map(dest => ({
          id: dest.id,
          name: dest.name,
          location: dest.location,
          imageUrl: `https://source.unsplash.com/400x300/?${encodeURIComponent(dest.name + ' tourist destination')}&auto=format&fit=crop`,
          rating: dest.rating,
          isMapboxPlace: false
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
      
      // Always search for tourist places
      const cityName = query.replace(/tourist places|attractions|places in|city|in|visit/gi, '').trim();
      navigate(`/search?q=${encodeURIComponent(query)}&type=city`);
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
    if (result.isMapboxPlace) {
      navigate(`/places/mapbox-${result.id}`, { 
        state: { 
          placeId: result.place_id, 
          placeName: result.name,
          placeDetails: result,
          isMapboxPlace: true
        } 
      });
    } else {
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
          placeholder="Search for tourist places in any city..."
          value={query}
          onChange={handleQueryChange}
          onFocus={() => query.trim().length > 1 && setIsSearchActive(true)}
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
          <div className="p-2 bg-blue-50 border-b">
            <p className="text-xs text-blue-600 font-medium">
              🏛️ Tourist Places & Attractions
            </p>
          </div>
          
          {isLoading && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              Finding tourist places...
            </div>
          )}
          
          {!isLoading && searchResults.length > 0 && searchResults.map(result => (
            <div
              key={`${result.isMapboxPlace ? 'mapbox' : 'local'}-${result.id}`}
              className="flex items-center p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50"
              onClick={() => handleResultClick(result)}
            >
              <div className="w-12 h-12 mr-3 rounded overflow-hidden flex-shrink-0">
                <img
                  src={result.imageUrl}
                  alt={result.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const fallbackUrl = `https://source.unsplash.com/100x100/?${encodeURIComponent(result.name + ' landmark')}&auto=format&fit=crop`;
                    (e.target as HTMLImageElement).src = fallbackUrl;
                  }}
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm flex items-center">
                  {result.name}
                  {result.isMapboxPlace && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                      Live
                    </span>
                  )}
                  <span className="ml-2 text-xs bg-green-100 text-green-600 px-1 py-0.5 rounded">
                    Tourist
                  </span>
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
          
          {!isLoading && searchResults.length === 0 && query.length >= 2 && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              No tourist places found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
