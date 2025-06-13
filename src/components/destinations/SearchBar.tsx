
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDestinations } from '@/contexts/DestinationContext';
import { foursquareService } from '@/utils/foursquareService';
import { getFoursquareApiKey } from '@/config/apiConfig';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentSearchQuery } = useDestinations();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const apiKey = await getFoursquareApiKey();
        if (apiKey) {
          foursquareService.setApiKey(apiKey);
          
          // Search for tourist places in the city
          const results = await foursquareService.searchPlaces(query);
          
          if (results && results.results) {
            // Format suggestions
            const formattedSuggestions = results.results
              .slice(0, 5)
              .map((place: any) => ({
                id: place.place_id,
                name: place.name,
                address: place.formatted_address,
                type: 'place'
              }));
            
            setSuggestions(formattedSuggestions);
            setShowSuggestions(true);
          }
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setCurrentSearchQuery(searchQuery);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=places`);
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.name);
    handleSearch(suggestion.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search for tourist places, cities, attractions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="pl-10 pr-16 h-12 text-base"
        />
        <Button
          onClick={() => handleSearch()}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10"
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="flex items-center p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
            >
              <MapPin className="h-4 w-4 text-muted-foreground mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{suggestion.name}</div>
                <div className="text-xs text-muted-foreground truncate">{suggestion.address}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;
