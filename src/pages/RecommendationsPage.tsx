
import { useState } from 'react';
import DestinationGrid from '@/components/destinations/DestinationGrid';
import SearchBar from '@/components/destinations/SearchBar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useDestinations, AdvancedFilterOptions } from '@/contexts/DestinationContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MapPin, Filter } from 'lucide-react';

const RecommendationsPage = () => {
  const { setSelectedBudget, getStatesList } = useDestinations();
  const [selectedState, setSelectedState] = useState('All States');
  
  // Advanced filter states
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | undefined>(undefined);
  const [features, setFeatures] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  
  // Get all states from destinations data
  const statesList = ['All States', ...getStatesList()];
  
  // Prepare the advanced filter options
  const advancedFilterOptions: AdvancedFilterOptions = {
    state: selectedState,
    sortBy: sortBy,
    features: features.length > 0 ? features : undefined,
    season: seasons.length > 0 ? seasons : undefined
  };
  
  // Toggle feature selection
  const toggleFeature = (feature: string) => {
    setFeatures(current => 
      current.includes(feature) 
        ? current.filter(f => f !== feature) 
        : [...current, feature]
    );
  };
  
  // Toggle season selection
  const toggleSeason = (season: string) => {
    setSeasons(current => 
      current.includes(season) 
        ? current.filter(s => s !== season) 
        : [...current, season]
    );
  };

  return (
    <div className="container mx-auto max-w-4xl pb-24">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Discover Destinations</h1>
        <div className="mb-6">
          <SearchBar />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium mb-1">Filter by State</label>
            <Select 
              defaultValue="All States"
              onValueChange={(value) => setSelectedState(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {statesList.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium mb-1">Filter by Budget</label>
            <Select 
              defaultValue="all"
              onValueChange={(value) => setSelectedBudget(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="low">Budget-Friendly</SelectItem>
                <SelectItem value="medium">Mid-Range</SelectItem>
                <SelectItem value="high">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/3 flex flex-col">
            <label className="block text-sm font-medium mb-1">Advanced Filters</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>More Filters</span>
                  <Filter className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  Sort By
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem 
                  checked={sortBy === 'popular'}
                  onCheckedChange={() => setSortBy('popular')}
                >
                  Most Popular
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={sortBy === 'rating'}
                  onCheckedChange={() => setSortBy('rating')}
                >
                  Highest Rated
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={sortBy === 'newest'}
                  onCheckedChange={() => setSortBy('newest')}
                >
                  Newest
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  Features
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem 
                  checked={features.includes('family-friendly')}
                  onCheckedChange={() => toggleFeature('family-friendly')}
                >
                  Family Friendly
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={features.includes('guided-tours')}
                  onCheckedChange={() => toggleFeature('guided-tours')}
                >
                  Guided Tours Available
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={features.includes('wheelchair')}
                  onCheckedChange={() => toggleFeature('wheelchair')}
                >
                  Wheelchair Accessible
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  Time to Visit
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem 
                  checked={seasons.includes('summer')}
                  onCheckedChange={() => toggleSeason('summer')}
                >
                  Summer
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={seasons.includes('monsoon')}
                  onCheckedChange={() => toggleSeason('monsoon')}
                >
                  Monsoon
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={seasons.includes('winter')}
                  onCheckedChange={() => toggleSeason('winter')}
                >
                  Winter
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <DestinationGrid 
          stateFilter={selectedState} 
          advancedFilterOptions={advancedFilterOptions}
        />
      </div>
    </div>
  );
};

export default RecommendationsPage;
