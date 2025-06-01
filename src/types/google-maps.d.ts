
declare global {
  interface Window {
    initMap?: () => void;
    google?: typeof google;
    googleMapsCallback?: () => void;
  }
}

export {};
