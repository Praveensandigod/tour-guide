
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
import { useDestinations } from '@/contexts/DestinationContext';
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

// List of Indian states for state filter
const INDIAN_STATES = [
  'All States',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh'
];

const RecommendationsPage = () => {
  const { setSelectedBudget } = useDestinations();
  const [selectedState, setSelectedState] = useState('All States');

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
                {INDIAN_STATES.map(state => (
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
                <DropdownMenuCheckboxItem>
                  Most Popular
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Highest Rated
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Newest
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  Features
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem>
                  Family Friendly
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Guided Tours Available
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Wheelchair Accessible
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  Time to Visit
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem>
                  Summer
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Monsoon
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Winter
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <DestinationGrid stateFilter={selectedState} />
      </div>
    </div>
  );
};

export default RecommendationsPage;
