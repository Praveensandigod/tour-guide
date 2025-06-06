
import MapView from '@/components/map/MapView';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

const MapPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [pageError, setPageError] = useState<string | null>(null);
  
  const placeId = location.state?.placeId;
  const placeName = location.state?.placeName;

  useEffect(() => {
    try {
      if (placeId && placeName) {
        console.log("Loading place on map:", placeName, placeId);
        
        toast({
          title: "Loading Place",
          description: `Showing "${placeName}" on the map`,
        });
      } else {
        console.log("No specific place to show, displaying default map view");
      }
    } catch (error) {
      console.error('Error in MapPage:', error);
      setPageError('Failed to load map page');
    }
  }, [placeId, placeName, toast]);

  if (pageError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Map Error</h2>
          <p className="text-muted-foreground mb-4">{pageError}</p>
          <button 
            onClick={() => window.location.href = '/recommendations'} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Go Back to Recommendations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <MapView />
    </div>
  );
};

export default MapPage;
