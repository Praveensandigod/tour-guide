
// Configuration for MapTiler API
export const MAPTILER_API_KEY = 'get_your_key_for_free_at_maptiler_com';

// OpenRouteService API (free tier available)
export const OPENROUTE_API_KEY = 'get_your_key_for_free_at_openrouteservice_org';

export const getMapTilerApiKey = async (): Promise<string | null> => {
  // Return the API key directly
  return MAPTILER_API_KEY;
};

export const getOpenRouteApiKey = async (): Promise<string | null> => {
  // Return the API key directly
  return OPENROUTE_API_KEY;
};
