
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

const RecommendationsPage = () => {
  const { getStatesList } = useDestinations();
  const [selectedState, setSelectedState] = useState('All States');
  
  // Get all states from destinations data
  const statesList = ['All States', ...getStatesList()];

  return (
    <div className="container mx-auto max-w-4xl pb-24">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Discover Destinations</h1>
        <div className="mb-6">
          <SearchBar />
        </div>
        
        <div className="w-full mb-6">
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
        
        <DestinationGrid stateFilter={selectedState} />
      </div>
    </div>
  );
};

export default RecommendationsPage;
