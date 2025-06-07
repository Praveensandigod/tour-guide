
// Free mapping service using OpenStreetMap, Nominatim, and OpenRouteService
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const OPENROUTE_BASE_URL = 'https://api.openrouteservice.org';
const OPENROUTE_API_KEY = '5b3ce3597851110001cf6248953e793ca59140e9b20953797ecb4f89';

export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  imageUrl: string;
}

export interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
}

export interface Route {
  distance: string;
  duration: string;
  steps: DirectionStep[];
  coordinates: [number, number][];
}

// Get Unsplash images based on place category
const getUnsplashImageUrl = (category: string, placeName: string = ''): string => {
  const queries = {
    temple: 'temple ancient architecture',
    historical: 'historical monument heritage',
    nature: 'nature landscape scenic',
    mountain: 'mountain peak landscape',
    beach: 'beach ocean tropical',
    monument: 'monument landmark architecture',
    museum: 'museum art culture',
    park: 'park garden nature',
    restaurant: 'restaurant food cuisine',
    hotel: 'hotel luxury accommodation'
  };
  
  const query = queries[category as keyof typeof queries] || 'tourist attraction landmark';
  return `https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop&q=category=${encodeURIComponent(query)}`;
};

export const freeMapService = {
  // Geocoding - convert address to coordinates
  async geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'TourGuideApp/1.0'
          }
        }
      );
      
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  // Reverse geocoding - convert coordinates to address
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'TourGuideApp/1.0'
          }
        }
      );
      
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  },

  // Search for places
  async searchPlaces(query: string, limit: number = 10): Promise<Place[]> {
    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TourGuideApp/1.0'
          }
        }
      );
      
      const data = await response.json();
      return data.map((place: any, index: number) => {
        const category = this.getCategoryFromType(place.type, place.class);
        return {
          id: place.place_id || `place_${index}`,
          name: place.display_name.split(',')[0],
          address: place.display_name,
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon),
          category,
          rating: 3.5 + Math.random() * 1.5,
          imageUrl: getUnsplashImageUrl(category, place.display_name)
        };
      });
    } catch (error) {
      console.error('Search places error:', error);
      return [];
    }
  },

  // Search tourist attractions in a city
  async searchTouristPlaces(cityName: string): Promise<Place[]> {
    try {
      const queries = [
        `${cityName} tourist attractions`,
        `${cityName} monuments`,
        `${cityName} temples`,
        `${cityName} museums`,
        `${cityName} landmarks`
      ];

      const allResults: Place[] = [];
      
      for (const query of queries) {
        const results = await this.searchPlaces(query, 5);
        allResults.push(...results);
      }

      // Remove duplicates based on coordinates
      const uniqueResults = allResults.filter((place, index, self) => 
        index === self.findIndex(p => 
          Math.abs(p.lat - place.lat) < 0.001 && Math.abs(p.lng - place.lng) < 0.001
        )
      );

      return uniqueResults.slice(0, 20);
    } catch (error) {
      console.error('Search tourist places error:', error);
      return [];
    }
  },

  // Get directions between two points
  async getDirections(start: { lat: number; lng: number }, end: { lat: number; lng: number }): Promise<Route | null> {
    try {
      const response = await fetch(
        `${OPENROUTE_BASE_URL}/v2/directions/driving-car?api_key=${OPENROUTE_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}&format=json&instructions=true`,
        {
          headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const route = data.features[0];
        const summary = route.properties.summary;
        const segments = route.properties.segments || [];

        const steps: DirectionStep[] = [];
        segments.forEach((segment: any) => {
          if (segment.steps) {
            segment.steps.forEach((step: any) => {
              steps.push({
                instruction: step.instruction || 'Continue',
                distance: `${(step.distance / 1000).toFixed(1)} km`,
                duration: `${Math.round(step.duration / 60)} min`
              });
            });
          }
        });

        return {
          distance: `${(summary.distance / 1000).toFixed(1)} km`,
          duration: `${Math.round(summary.duration / 60)} min`,
          steps,
          coordinates: route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number])
        };
      }
      
      return null;
    } catch (error) {
      console.error('Directions error:', error);
      return null;
    }
  },

  // Get category from Nominatim type/class
  getCategoryFromType(type: string, osmClass: string): string {
    const typeMap: { [key: string]: string } = {
      'place_of_worship': 'temple',
      'tourism': 'attraction',
      'historic': 'historical',
      'natural': 'nature',
      'leisure': 'park',
      'amenity': 'attraction'
    };

    if (type && typeMap[type]) {
      return typeMap[type];
    }
    
    if (osmClass && typeMap[osmClass]) {
      return typeMap[osmClass];
    }

    return 'attraction';
  }
};
