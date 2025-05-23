
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDestinations } from '@/contexts/DestinationContext';
import { useDebounce } from 'use-debounce';
import { getGoogleMapsApiKey } from '@/config/apiConfig';
import { usePlaceAutocomplete } from '@/utils/googleMapsService';

const SearchBar = () => {
  const { searchDestinations, currentSearchQuery, setCurrentSearchQuery } = useDestinations();
  const [query, setQuery] = useState(currentSearchQuery);
  const [debouncedQuery] = useDebounce(query, 300); // 300ms debounce
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
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
  
  // Use place autocomplete if API key is available
  const { suggestions, isLoading, error } = usePlaceAutocomplete(
    debouncedQuery, 
    apiKey && debouncedQuery.length >= 3 ? apiKey : null
  );
  
  // Handle form submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      setCurrentSearchQuery(query);
      setIsSearchActive(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Handle input changes
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery.trim().length > 2) {
      // If Google Places API is not available, use local search
      if (!apiKey) {
        const results = searchDestinations(newQuery);
        setSearchResults(results.slice(0, 5)); // Show max 5 results
      }
      setIsSearchActive(true);
    } else {
      setSearchResults([]);
      setIsSearchActive(false);
    }
  };

  // Update search results when suggestions from Google Places API change
  useEffect(() => {
    if (suggestions && suggestions.length > 0) {
      const formattedSuggestions = suggestions.map(suggestion => ({
        id: suggestion.place_id,
        name: suggestion.structured_formatting?.main_text || suggestion.description,
        location: suggestion.structured_formatting?.secondary_text || '',
        imageUrl: 'https://via.placeholder.com/100', // Placeholder image
        isGooglePlace: true
      }));
      setSearchResults(formattedSuggestions);
    } else if (debouncedQuery.length >= 3 && !apiKey) {
      // Fallback to local search if no API key
      const results = searchDestinations(debouncedQuery);
      setSearchResults(results.slice(0, 5));
    }
  }, [suggestions, debouncedQuery, apiKey, searchDestinations]);

  // Clear search input
  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setIsSearchActive(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle search result click
  const handleResultClick = (result: any) => {
    if (result.isGooglePlace) {
      // For Google Places results, navigate to map with place ID
      navigate(`/map`, { state: { placeId: result.id, placeName: result.name } });
    } else {
      // For local destinations
      navigate(`/destinations/${result.id}`);
    }
    setIsSearchActive(false);
  };

  // Close search results when clicking outside
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
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {isSearchActive && searchResults.length > 0 && (
        <div className="search-results absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              Loading suggestions...
            </div>
          )}
          
          {!isLoading && searchResults.map(result => (
            <div
              key={result.id}
              className="flex items-center p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50"
              onClick={() => handleResultClick(result)}
            >
              <div className="w-12 h-12 mr-3 rounded overflow-hidden flex-shrink-0">
                <img
                  src={result.imageUrl}
                  alt={result.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{result.name}</h4>
                <p className="text-xs text-muted-foreground">{result.location}</p>
                {result.isGooglePlace && (
                  <span className="text-xs text-blue-500">Google Maps</span>
                )}
              </div>
            </div>
          ))}
          
          {error && (
            <div className="p-3 text-center text-sm text-red-500">
              Error loading suggestions
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
