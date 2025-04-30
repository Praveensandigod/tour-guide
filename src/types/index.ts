
export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  createdAt: string;
}

export interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  budget: "low" | "medium" | "high";
  rating: number;
  category: "historical" | "temple" | "nature" | "mountain" | "beach" | "monument" | "statue";
  coordinates: {
    lat: number;
    lng: number;
  };
}
