
import MapView from '@/components/map/MapView';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const MapPage = () => {
  const location = useLocation();
  const placeId = location.state?.placeId;
  const placeName = location.state?.placeName;

  // Effects can be added here to handle place details if needed
  useEffect(() => {
    if (placeId && placeName) {
      // You could potentially do something with the placeId here
      console.log("Showing place:", placeName, placeId);
    }
  }, [placeId, placeName]);

  return (
    <div className="h-[calc(100vh-5rem)] pb-16">
      <MapView />
    </div>
  );
};

export default MapPage;
