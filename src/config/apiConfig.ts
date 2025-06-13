
// Configuration for Mapbox API
export const MAPBOX_API_KEY = 'pk.eyJ1IjoieHl6MDciLCJhIjoiY21idGEyZGxxMDE2NjJqcjNmaGZ2NWg2dCJ9.DcgiXsTaKSYJKSUeqXhzlg';

export const getMapboxApiKey = async (): Promise<string | null> => {
  // Return the API key directly
  return MAPBOX_API_KEY;
};
