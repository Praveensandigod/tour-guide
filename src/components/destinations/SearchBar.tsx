
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDestinations } from '@/contexts/DestinationContext';
import { useDebounce } from 'use-debounce';
import { freeMapService } from '@/services/freeMapService';

interface SearchResult {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  rating?: number;
  isFreeApiPlace?: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'places' | 'cities'>('places');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Detect if query is a city search
  useEffect(() => {
    const cityKeywords = ['city', 'in', 'places in', 'tourist places', 'attractions in', 'visit'];
    const isCity = cityKeywords.some(keyword => 
      debouncedQuery.toLowerCase().includes(keyword)
    ) || debouncedQuery.split(' ').length <= 2; // Simple city name
    
    setSearchMode(isCity ? 'cities' : 'places');
  }, [debouncedQuery]);
  
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
        let combinedResults: SearchResult[] = [];

        if (searchMode === 'cities') {
          // Search for tourist places in the city
          const cityName = debouncedQuery.replace(/tourist places|attractions|places in|city|in|visit/gi, '').trim();
          
          const touristPlaces = await freeMapService.searchTouristPlaces(cityName);
          
          combinedResults = touristPlaces.map(place => ({
            id: place.id,
            name: place.name,
            location: place.address,
            imageUrl: place.imageUrl,
            rating: place.rating,
            isFreeApiPlace: true,
            place_id: place.id,
            geometry: { location: { lat: place.lat, lng: place.lng } }
          }));
        } else {
          // Regular place search
          // Search local destinations first
          const localResults = searchDestinations(debouncedQuery);
          const formattedLocalResults: SearchResult[] = localResults.slice(0, 3).map(dest => ({
            id: dest.id,
            name: dest.name,
            location: dest.location,
            imageUrl: dest.imageUrl,
            rating: dest.rating,
            isFreeApiPlace: false
          }));

          // Search with free map service
          const apiPlaces = await freeMapService.searchPlaces(debouncedQuery, 5);
          const apiResults: SearchResult[] = apiPlaces.map(place => ({
            id: place.id,
            name: place.name,
            location: place.address,
            imageUrl: place.imageUrl,
            rating: place.rating,
            isFreeApiPlace: true,
            place_id: place.id,
            geometry: { location: { lat: place.lat, lng: place.lng } }
          }));

          combinedResults = [...formattedLocalResults, ...apiResults];
        }

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
          isFreeApiPlace: false
        })));
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchDestinations, searchMode]);
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      setCurrentSearchQuery(query);
      setIsSearchActive(false);
      
      if (searchMode === 'cities') {
        navigate(`/search?q=${encodeURIComponent(query)}&type=city`);
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
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
    if (result.isFreeApiPlace) {
      navigate(`/places/free-${result.id}`, { 
        state: { 
          placeId: result.place_id, 
          placeName: result.name,
          placeDetails: result,
          isFreeApiPlace: true
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
          placeholder={searchMode === 'cities' ? "Search tourist places in city..." : "Search destinations..."}
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
          {searchMode === 'cities' && (
            <div className="p-2 bg-blue-50 border-b">
              <p className="text-xs text-blue-600 font-medium">
                🏛️ Tourist Places Search Mode
              </p>
            </div>
          )}
          
          {isLoading && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              {searchMode === 'cities' ? 'Finding tourist places...' : 'Searching places...'}
            </div>
          )}
          
          {!isLoading && searchResults.length > 0 && searchResults.map(result => (
            <div
              key={`${result.isFreeApiPlace ? 'api' : 'local'}-${result.id}`}
              className="flex items-center p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50"
              onClick={() => handleResultClick(result)}
            >
              <div className="w-12 h-12 mr-3 rounded overflow-hidden flex-shrink-0">
                <img
                  src={result.imageUrl}
                  alt={result.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=100&h=100&fit=crop';
                  }}
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm flex items-center">
                  {result.name}
                  {result.isFreeApiPlace && (
                    <span className="ml-2 text-xs bg-green-100 text-green-600 px-1 py-0.5 rounded">
                      Free
                    </span>
                  )}
                  {searchMode === 'cities' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                      Tourist
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
              {searchMode === 'cities' 
                ? `No tourist places found for "${query}"`
                : `No places found for "${query}"`
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
