
import { useDestinations } from '@/contexts/DestinationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Bookmark, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SavedPage = () => {
  const { savedDestinations, removeSavedDestination } = useDestinations();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4 text-center">
        <div className="p-8 border border-muted rounded-lg">
          <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Sign in to see your saved destinations</h2>
          <p className="text-muted-foreground mb-6">
            Create an account or sign in to save your favorite places
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl pb-24">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Saved Destinations</h1>
        
        {savedDestinations.length === 0 ? (
          <div className="text-center p-8 border border-muted rounded-lg">
            <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No saved destinations yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring and save places you'd like to visit
            </p>
            <Link to="/recommendations">
              <Button>Explore Destinations</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedDestinations.map((destination) => (
              <div 
                key={destination.id} 
                className="border rounded-lg overflow-hidden flex flex-col bg-card"
              >
                <div className="relative">
                  <img 
                    src={destination.imageUrl} 
                    alt={destination.name} 
                    className="w-full h-32 object-cover"
                  />
                  <button
                    onClick={() => removeSavedDestination(destination.id)}
                    className="absolute top-2 right-2 p-1 bg-white/70 rounded-full hover:bg-white transition-colors"
                    aria-label="Remove from saved"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="font-semibold">{destination.name}</h3>
                  <p className="text-sm text-muted-foreground">{destination.location}</p>
                </div>
                <div className="border-t flex">
                  <Link 
                    to={`/destinations/${destination.id}`}
                    className="flex-1 text-center p-3 text-sm hover:bg-muted/50 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/map?destination=${destination.id}`}
                    className="flex-1 text-center p-3 text-sm border-l hover:bg-muted/50 transition-colors"
                  >
                    View on Map
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPage;
