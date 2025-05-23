
import { supabase } from '@/integrations/supabase/client';

// Configuration for Google Maps API
export const getGoogleMapsApiKey = async (): Promise<string | null> => {
  try {
    // Try to get the key from the backend service
    const { data, error } = await supabase.functions.invoke('get-google-maps-key');
    
    if (error) {
      console.error('Error fetching API key:', error);
      return null;
    }
    
    if (data && data.apiKey) {
      return data.apiKey;
    }
    
    return null;
  } catch (error) {
    console.error('Error invoking function to get API key:', error);
    return null;
  }
};
