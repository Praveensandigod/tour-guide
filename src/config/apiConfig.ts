
// Configuration for Mapbox API
export const MAPBOX_API_KEY = 'pk.eyJ1IjoieHl6MDciLCJhIjoiY21idGJzaDMzMDI0eTJsczNsOGVpbGwxbCJ9.rbNS5-bM71ebVtFNkfYRqA';

export const getMapboxApiKey = async (): Promise<string | null> => {
  // Return the API key directly
  return MAPBOX_API_KEY;
};
