
import { supabase } from '@/integrations/supabase/client';

// Configuration for Mapbox API
export const getMapboxApiKey = async (): Promise<string | null> => {
  try {
    // Try to get the key from the backend service
    const { data, error } = await supabase.functions.invoke('get-mapbox-key');
    
    if (error) {
      console.error('Error fetching Mapbox API key:', error);
      return null;
    }
    
    if (data && data.apiKey) {
      return data.apiKey;
    }
    
    return null;
  } catch (error) {
    console.error('Error invoking function to get Mapbox API key:', error);
    return null;
  }
};
