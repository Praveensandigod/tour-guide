
import { useState } from 'react';
import { useDestinations } from '@/contexts/DestinationContext';
import DestinationCard from './DestinationCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LandmarkIcon, Mountain, Flag, Church, MapPin, Navigation, BuildingIcon } from 'lucide-react';

const DestinationGrid = () => {
  const { filteredDestinations, selectedBudget, setSelectedBudget, isLoading } = useDestinations();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
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
  
  const filteredByCategory = (destinations: any[]) => {
    if (selectedCategory === "all") {
      return destinations;
    }
    return destinations.filter(dest => dest.category === selectedCategory);
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'historical':
        return <LandmarkIcon className="mr-1 h-4 w-4" />;
      case 'temple':
        return <Church className="mr-1 h-4 w-4" />;
      case 'nature':
        return <MapPin className="mr-1 h-4 w-4" />;
      case 'mountain':
        return <Mountain className="mr-1 h-4 w-4" />;
      case 'beach':
        return <Navigation className="mr-1 h-4 w-4" />;
      case 'monument':
        return <Flag className="mr-1 h-4 w-4" />;
      case 'statue':
        return <BuildingIcon className="mr-1 h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="py-4 px-4">
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Filter by Category</h3>
        <ToggleGroup 
          type="single" 
          value={selectedCategory} 
          onValueChange={(value) => {
            if (value) setSelectedCategory(value);
          }}
          className="flex flex-wrap justify-start gap-2 mb-4"
        >
          <ToggleGroupItem value="all" className="flex items-center">
            All
          </ToggleGroupItem>
          <ToggleGroupItem value="historical" className="flex items-center">
            {getCategoryIcon('historical')} Historical
          </ToggleGroupItem>
          <ToggleGroupItem value="temple" className="flex items-center">
            {getCategoryIcon('temple')} Temples
          </ToggleGroupItem>
          <ToggleGroupItem value="nature" className="flex items-center">
            {getCategoryIcon('nature')} Nature
          </ToggleGroupItem>
          <ToggleGroupItem value="mountain" className="flex items-center">
            {getCategoryIcon('mountain')} Mountains
          </ToggleGroupItem>
          <ToggleGroupItem value="beach" className="flex items-center">
            {getCategoryIcon('beach')} Beaches
          </ToggleGroupItem>
          <ToggleGroupItem value="monument" className="flex items-center">
            {getCategoryIcon('monument')} Monuments
          </ToggleGroupItem>
          <ToggleGroupItem value="statue" className="flex items-center">
            {getCategoryIcon('statue')} Statues
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

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
            {filteredByCategory(filteredDestinations()).map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="low" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredByCategory(filteredDestinations('low')).map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="medium" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredByCategory(filteredDestinations('medium')).map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="high" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredByCategory(filteredDestinations('high')).map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DestinationGrid;
