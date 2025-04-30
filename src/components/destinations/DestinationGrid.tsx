
import { useState } from 'react';
import { useDestinations } from '@/contexts/DestinationContext';
import DestinationCard from './DestinationCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DestinationGrid = () => {
  const { filteredDestinations, selectedBudget, setSelectedBudget, isLoading } = useDestinations();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-lg shadow-md bg-card animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-12 bg-muted/50 border-t"></div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="py-4 px-4">
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
            {filteredDestinations().map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="low" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredDestinations('low').map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="medium" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredDestinations('medium').map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="high" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredDestinations('high').map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DestinationGrid;
