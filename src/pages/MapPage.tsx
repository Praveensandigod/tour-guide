
import MapView from '@/components/map/MapView';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
      <Card className="mb-4 mx-auto max-w-2xl">
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p><strong>Note:</strong> For security reasons, Google Maps API keys should be stored on a backend server and accessed via a secure API endpoint.</p>
              <p className="mt-2">For development purposes, you can enter your API key in the dialog that appears below.</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      <MapView />
    </div>
  );
};

export default MapPage;
