
export interface Destination {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  rating: number;
  description: string;
  category: string;
  budget: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  place_id?: string;
  isGooglePlace?: boolean;
  isMapboxPlace?: boolean;
  website?: string;
}
