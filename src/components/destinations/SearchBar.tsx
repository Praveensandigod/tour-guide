import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMapsApiKey } from '@/config/apiConfig';
import { supabase } from '@/integrations/supabase/client';

interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchTerm) {
        setSuggestions([]);
        return;
      }

      const apiKey = getMapsApiKey();
      const apiUrl = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${debouncedSearchTerm}&format=json`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSuggestions(data);
      } catch (error: any) {
        console.error("Could not fetch suggestions:", error);
        toast({
          title: "Error fetching suggestions",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    setSearchTerm(suggestion.display_name);
    setSuggestions([]);
    setIsDropdownOpen(false);

    navigate('/map', { 
      state: { 
        placeId: suggestion.place_id, 
        placeName: suggestion.display_name,
        lat: suggestion.lat,
        lon: suggestion.lon
      } 
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      // Geocode the search term to get coordinates
      const apiKey = getMapsApiKey();
      const geocodeApiUrl = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${searchTerm}&format=json`;

      fetch(geocodeApiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data: any[]) => {
          if (data && data.length > 0) {
            const firstResult = data[0];
            navigate('/map', {
              state: {
                placeId: firstResult.place_id,
                placeName: firstResult.display_name,
                lat: firstResult.lat,
                lon: firstResult.lon
              }
            });
          } else {
            toast({
              title: "No results found",
              description: "Could not find the location. Please try a different search term.",
              variant: "destructive"
            });
          }
        })
        .catch(error => {
          console.error("Geocoding error:", error);
          toast({
            title: "Geocoding error",
            description: "Failed to geocode the location. Please try again.",
            variant: "destructive"
          });
        });
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for a destination..."
            value={searchTerm}
            onChange={handleInputChange}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </form>
      {isDropdownOpen && suggestions.length > 0 && (
        <Card className="absolute left-0 mt-2 w-full z-10">
          <CardContent className="p-0">
            <ul>
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  className="px-4 py-2 hover:bg-secondary cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
