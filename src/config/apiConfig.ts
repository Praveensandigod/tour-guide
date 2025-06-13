
// Configuration for MapTiler API
export const MAPTILER_API_KEY = 'AhVShaOsTjKnha4glKDe';

// OpenRouteService API
export const OPENROUTE_API_KEY = '5b3ce3597851110001cf6248953e793ca59140e9b20953797ecb4f89';

// Foursquare API for place details and photos
export const FOURSQUARE_API_KEY = 'fsq3ZQ214FTWR46oluj4T5lE3FK0lQjU+kancYbVa3hLZY4=';

export const getMapTilerApiKey = async (): Promise<string | null> => {
  return MAPTILER_API_KEY;
};

export const getOpenRouteApiKey = async (): Promise<string | null> => {
  return OPENROUTE_API_KEY;
};

export const getFoursquareApiKey = async (): Promise<string | null> => {
  return FOURSQUARE_API_KEY;
};
