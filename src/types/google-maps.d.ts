
// Add window augmentation for Google Maps callback
interface Window {
  googleMapsCallback?: () => void;
  google: any;
}
