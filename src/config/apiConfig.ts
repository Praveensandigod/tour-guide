
import { supabase } from '@/integrations/supabase/client';

// Configuration for Mapbox API with your token
const MAPBOX_PUBLIC_TOKEN = 'pk.eyJ1IjoieHl6MDciLCJhIjoiY21idGJzaDMzMDI0eTJsczNsOGVpbGwxbCJ9.rbNS5-bM71ebVtFNkfYRqA';

export const getMapboxApiKey = async (): Promise<string | null> => {
  try {
    // First try to get from your provided token
    if (MAPBOX_PUBLIC_TOKEN) {
      return MAPBOX_PUBLIC_TOKEN;
    }
    
    // Fallback to backend service
    const { data, error } = await supabase.functions.invoke('get-mapbox-key');
    
    if (error) {
      console.error('Error fetching Mapbox API key:', error);
      return MAPBOX_PUBLIC_TOKEN; // Return the hardcoded token as fallback
    }
    
    if (data && data.apiKey) {
      return data.apiKey;
    }
    
    return MAPBOX_PUBLIC_TOKEN; // Return the hardcoded token as final fallback
  } catch (error) {
    console.error('Error invoking function to get Mapbox API key:', error);
    return MAPBOX_PUBLIC_TOKEN; // Return the hardcoded token as fallback
  }
};
