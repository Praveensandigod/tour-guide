
import { useDestinations } from '@/contexts/DestinationContext';
import DestinationCard from '@/components/destinations/DestinationCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SavedPage = () => {
  const { savedDestinations } = useDestinations();

  if (savedDestinations.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl py-12 text-center pb-24">
        <h1 className="text-2xl font-bold mb-4">Saved Destinations</h1>
        <p className="text-muted-foreground mb-6">
          You haven't saved any destinations yet. Start exploring and save your favorite places!
        </p>
        <Link to="/recommendations">
          <Button>Explore Destinations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl pb-24">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Saved Destinations</h1>
        
        <div className="mb-4">
          <p className="text-muted-foreground">
            {savedDestinations.length} saved {savedDestinations.length === 1 ? 'destination' : 'destinations'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {savedDestinations.map(destination => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedPage;
