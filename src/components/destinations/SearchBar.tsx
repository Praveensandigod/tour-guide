
import { useState, useRef, useEffect } from 'react';
import { useDestinations } from '@/contexts/DestinationContext';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SearchBar = () => {
  const { searchDestinations, currentSearchQuery, setCurrentSearchQuery } = useDestinations();
  const [query, setQuery] = useState(currentSearchQuery);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchDestinations>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
    if (newQuery.trim().length > 1) {
      const results = searchDestinations(newQuery);
      setSearchResults(results.slice(0, 5)); // Show max 5 results
      setIsSearchActive(true);
    } else {
      setSearchResults([]);
      setIsSearchActive(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setIsSearchActive(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleResultClick = (destinationId: string) => {
    navigate(`/destinations/${destinationId}`);
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
          onFocus={() => query.trim().length > 1 && setIsSearchActive(true)}
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
          {searchResults.map(destination => (
            <div
              key={destination.id}
              className="flex items-center p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50"
              onClick={() => handleResultClick(destination.id)}
            >
              <div className="w-12 h-12 mr-3 rounded overflow-hidden flex-shrink-0">
                <img
                  src={destination.imageUrl}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{destination.name}</h4>
                <p className="text-xs text-muted-foreground">{destination.location}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
