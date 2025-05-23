
import MapView from '@/components/map/MapView';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const MapPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const placeId = location.state?.placeId;
  const placeName = location.state?.placeName;

  // Effects can be added here to handle place details if needed
  useEffect(() => {
    if (placeId && placeName) {
      // You could potentially do something with the placeId here
      console.log("Showing place:", placeName, placeId);
      
      // Notify the user that we're showing a specific place
      toast({
        title: "Loading Place",
        description: `Showing "${placeName}" on the map`,
      });
    }
  }, [placeId, placeName, toast]);

  return (
    <div className="h-[calc(100vh-5rem)] pb-16">
      <MapView />
    </div>
  );
};

export default MapPage;
