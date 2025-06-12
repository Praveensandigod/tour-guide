export interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  rating: number;
  category: string;
  budget: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  website?: string;
  place_id?: string;
  isMapboxPlace?: boolean;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  price: number;
  rating: number;
  category: string;
}

export interface Review {
  id: string;
  userId: string;
  destinationId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  location: string;
}
