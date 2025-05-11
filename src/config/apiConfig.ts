
// This is a configuration file for API keys
// In a production environment, these keys should be stored securely on the server
// and accessed through an authenticated API endpoint

// Configuration for Google Maps API
export const getGoogleMapsApiKey = (): string | null => {
  // For development, you can hardcode the API key here
  // For production, this should be retrieved securely from your backend
  // return "YOUR_GOOGLE_MAPS_API_KEY";
  
  // For now, let's use localStorage as a temporary solution
  return localStorage.getItem('googleMapsApiKey');
};

// Function to securely set the API key (temporary solution)
export const setGoogleMapsApiKey = (apiKey: string): void => {
  localStorage.setItem('googleMapsApiKey', apiKey);
};
