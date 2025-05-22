
// This is a configuration file for API keys
// In a production environment, these keys should be stored securely on the server
// and accessed through an authenticated API endpoint

// Configuration for Maps API
export const getMapsApiKey = (): string => {
  // Return the LocationIQ API key directly
  return "pk.c6d6c51883fc4479d4c42fd1ff821586";
};

// Function to securely set the API key (temporary solution)
export const setMapsApiKey = (apiKey: string): void => {
  localStorage.setItem('mapsApiKey', apiKey);
};
