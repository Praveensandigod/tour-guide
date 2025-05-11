
import { useState, useEffect } from 'react';
import { useDestinations } from '@/contexts/DestinationContext';
import DestinationCard from './DestinationCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface DestinationGridProps {
  stateFilter?: string;
}

const DestinationGrid = ({ 
  stateFilter = 'All States'
}: DestinationGridProps) => {
  const { filteredDestinations, selectedBudget, setSelectedBudget, isLoading } = useDestinations();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    // Set initial load to false after a short delay to simulate loading
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading || isInitialLoad) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <DestinationCardSkeleton key={index} />
        ))}
      </div>
    );
  }
  
  const getDestinations = () => {
    let filtered = filteredDestinations(selectedBudget !== 'all' ? selectedBudget : undefined);
    
    // Apply state filter
    if (stateFilter && stateFilter !== 'All States') {
      filtered = filtered.filter(dest => {
        const state = dest.location.split(',').pop()?.trim();
        return state === stateFilter;
      });
    }
    
    return filtered;
  };
  
  const displayDestinations = getDestinations();
  
  return (
    <div className="py-4">
      <Tabs 
        defaultValue={selectedBudget} 
        onValueChange={(value) => setSelectedBudget(value)}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-4 mb-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="low">Budget</TabsTrigger>
          <TabsTrigger value="medium">Mid-range</TabsTrigger>
          <TabsTrigger value="high">Luxury</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {displayDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="low" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {displayDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="medium" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {displayDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="high" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {displayDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {displayDestinations.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg font-medium mb-2">No destinations match your filters</p>
          <p className="text-muted-foreground">Try adjusting your filters to find more destinations</p>
        </div>
      )}
    </div>
  );
};

const DestinationCardSkeleton = () => (
  <div className="bg-card rounded-lg shadow-md overflow-hidden">
    <div className="h-48 relative">
      <Skeleton className="h-full w-full" />
    </div>
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/5 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
    <div className="h-12 bg-muted/50 border-t flex items-center justify-center">
      <Skeleton className="h-5 w-28" />
    </div>
  </div>
);

export default DestinationGrid;
