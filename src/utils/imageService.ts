import { Place } from '@/services/freeMapService';

export const imageService = {
  getUnsplashImageUrl: (category: string, placeName: string = ''): string => {
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
    return `https://source.unsplash.com/400x300/?${encodeURIComponent(placeName)} ${encodeURIComponent(query)}`;
  },

  generatePlaceGallery: (placeName: string, count: number = 6): string[] => {
    const gallery: string[] = [];
    const searchTerms = [
      `${placeName} landmark`,
      `${placeName} architecture`, 
      `${placeName} tourist attraction`,
      `${placeName} scenic view`,
      `${placeName} culture`,
      `${placeName} heritage site`
    ];

    for (let i = 0; i < count; i++) {
      const searchTerm = searchTerms[i % searchTerms.length];
      const seed = Math.floor(Math.random() * 1000);
      gallery.push(`https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop&q=80&auto=format&seed=${seed}&sig=${encodeURIComponent(searchTerm)}`);
    }

    return gallery;
  },

  getPlaceImageUrl: (placeName: string, category?: string): string => {
    const categoryKeywords = {
      temple: 'temple ancient architecture',
      historical: 'historical monument heritage',
      nature: 'nature landscape scenic',
      mountain: 'mountain peak landscape',
      beach: 'beach ocean tropical',
      monument: 'monument landmark architecture',
      museum: 'museum art culture',
      park: 'park garden nature',
      restaurant: 'restaurant food cuisine',
      hotel: 'hotel luxury accommodation',
      attraction: 'tourist attraction landmark'
    };

    const keywords = category && categoryKeywords[category as keyof typeof categoryKeywords] 
      ? categoryKeywords[category as keyof typeof categoryKeywords]
      : 'tourist attraction landmark';
    
    const searchQuery = `${placeName} ${keywords}`;
    const seed = Math.abs(placeName.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
    
    return `https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop&q=80&auto=format&seed=${seed}&sig=${encodeURIComponent(searchQuery)}`;
  },

  getCityImageUrl: (cityName: string): string => {
    const seed = Math.abs(cityName.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
    return `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80&auto=format&seed=${seed}&sig=${encodeURIComponent(cityName + ' city skyline')}`;
  },

  getRandomImageUrl: (width: number = 400, height: number = 300): string => {
    const seed = Math.floor(Math.random() * 1000);
    return `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=${width}&h=${height}&fit=crop&q=80&auto=format&seed=${seed}`;
  }
};
