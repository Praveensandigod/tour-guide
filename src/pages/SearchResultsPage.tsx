
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import SearchBar from '@/components/destinations/SearchBar';
import DestinationCard from '@/components/destinations/DestinationCard';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { searchDestinations, setCurrentSearchQuery, currentSearchQuery } = useDestinations();
  const [results, setResults] = useState(searchDestinations(query));
  const navigate = useNavigate();

  useEffect(() => {
    if (!query) {
      navigate('/recommendations');
      return;
    }

    if (query !== currentSearchQuery) {
      setCurrentSearchQuery(query);
    }
    
    setResults(searchDestinations(query));
  }, [query, searchDestinations, setCurrentSearchQuery, currentSearchQuery, navigate]);

  return (
    <div className="container mx-auto max-w-4xl pb-24">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Search Results</h1>
        
        <div className="mb-6">
          <SearchBar />
        </div>
        
        <div className="mb-4">
          <p className="text-muted-foreground">
            {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
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
            <h2 className="text-xl font-semibold mb-2">No destinations found</h2>
            <p className="text-muted-foreground mb-6">
              Try searching with different terms or explore our recommended destinations
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
