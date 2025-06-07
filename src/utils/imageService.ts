
// Enhanced image service for generating unique place-specific images
export const imageService = {
  // Generate unique image URL based on place details
  getPlaceImage: (placeName: string, category?: string, types?: string[]): string => {
    const name = placeName.toLowerCase();
    const placeTypes = types || [];
    
    // Religious places
    if (name.includes('temple') || name.includes('church') || name.includes('mosque') || 
        name.includes('shrine') || name.includes('monastery') || 
        placeTypes.some(type => ['temple', 'church', 'mosque', 'religious'].includes(type))) {
      const templeImages = [
        'photo-1466442929976-97f336a657be', // Temple architecture
        'photo-1492321936769-b49830bc1d1e', // Traditional temple
        'photo-1565552391875-6e690e99b5df', // Buddhist temple
        'photo-1478436127897-769e1b3f0f36', // Hindu temple
        'photo-1516026672322-bc52d61a55d5'  // Golden temple
      ];
      const randomImage = templeImages[Math.abs(hashString(placeName)) % templeImages.length];
      return `https://images.unsplash.com/${randomImage}?w=400&h=300&fit=crop`;
    }
    
    // Museums and historical sites
    if (name.includes('museum') || name.includes('fort') || name.includes('palace') || 
        name.includes('heritage') || name.includes('historical') ||
        placeTypes.some(type => ['museum', 'historical', 'heritage'].includes(type))) {
      const museumImages = [
        'photo-1527576539890-dfa815648363', // Museum exterior
        'photo-1488970073972-7f93fe33e297', // Historical building
        'photo-1518709268805-4e9042af2176', // Palace architecture
        'photo-1470219556762-1771e7f9427d', // Fort walls
        'photo-1582555002c8e-4a3f4d0b1e6f'  // Heritage site
      ];
      const randomImage = museumImages[Math.abs(hashString(placeName)) % museumImages.length];
      return `https://images.unsplash.com/${randomImage}?w=400&h=300&fit=crop`;
    }
    
    // Parks and gardens
    if (name.includes('park') || name.includes('garden') || name.includes('botanical') ||
        name.includes('zoo') || placeTypes.some(type => ['park', 'garden', 'nature'].includes(type))) {
      const parkImages = [
        'photo-1469474968028-56623f02e42e', // Beautiful park
        'photo-1523712999610-f77fbcfc3843', // Garden landscape
        'photo-1506905925346-21bda4d32df4', // National park
        'photo-1441974231531-c6227db76b6e', // Forest path
        'photo-1475924156734-496f6cac6ec1'  // Botanical garden
      ];
      const randomImage = parkImages[Math.abs(hashString(placeName)) % parkImages.length];
      return `https://images.unsplash.com/${randomImage}?w=400&h=300&fit=crop`;
    }
    
    // Beaches and water bodies
    if (name.includes('beach') || name.includes('lake') || name.includes('river') ||
        name.includes('waterfall') || placeTypes.some(type => ['beach', 'water'].includes(type))) {
      const beachImages = [
        'photo-1500375592092-40eb2168fd21', // Tropical beach
        'photo-1506905925346-21bda4d32df4', // Lake view
        'photo-1439066615861-d1af74d74000', // Ocean waves
        'photo-1507525428034-b723cf961d3e', // Beach sunset
        'photo-1518837695005-2083093ee35b'  // Waterfall
      ];
      const randomImage = beachImages[Math.abs(hashString(placeName)) % beachImages.length];
      return `https://images.unsplash.com/${randomImage}?w=400&h=300&fit=crop`;
    }
    
    // Mountains and hills
    if (name.includes('mountain') || name.includes('hill') || name.includes('peak') ||
        name.includes('valley') || placeTypes.some(type => ['mountain', 'hill'].includes(type))) {
      const mountainImages = [
        'photo-1469041797191-50ace28483c3', // Mountain landscape
        'photo-1470071459604-3b5ec3a7fe05', // Snow peaks
        'photo-1464822759844-d150478e0ee2', // Mountain valley
        'photo-1506905925346-21bda4d32df4', // Hill station
        'photo-1433086966358-54859d0ed716'  // Mountain bridge
      ];
      const randomImage = mountainImages[Math.abs(hashString(placeName)) % mountainImages.length];
      return `https://images.unsplash.com/${randomImage}?w=400&h=300&fit=crop`;
    }
    
    // Markets and shopping
    if (name.includes('market') || name.includes('bazaar') || name.includes('mall') ||
        placeTypes.some(type => ['market', 'shopping'].includes(type))) {
      const marketImages = [
        'photo-1441986300917-64674bd600d8', // Traditional market
        'photo-1558618666-fcd25c85cd64', // Street market
        'photo-1582555002c8e-4a3f4d0b1e6f', // Local bazaar
        'photo-1472396961693-142e6e269027', // Market scene
        'photo-1555396273-367ea4eb4db5'  // Shopping area
      ];
      const randomImage = marketImages[Math.abs(hashString(placeName)) % marketImages.length];
      return `https://images.unsplash.com/${randomImage}?w=400&h=300&fit=crop`;
    }
    
    // Hotels and accommodations
    if (name.includes('hotel') || name.includes('resort') || name.includes('lodge') ||
        placeTypes.some(type => ['hotel', 'accommodation'].includes(type))) {
      const hotelImages = [
        'photo-1721322800607-8c38375eef04', // Luxury hotel
        'photo-1518770660439-4636190af475', // Resort view
        'photo-1578662996442-48f60103fc96', // Hotel exterior
        'photo-1564501049412-61c2a3083791', // Heritage hotel
        'photo-1542314831-068cd1dbfeeb'  // Mountain lodge
      ];
      const randomImage = hotelImages[Math.abs(hashString(placeName)) % hotelImages.length];
      return `https://images.unsplash.com/${randomImage}?w=400&h=300&fit=crop`;
    }
    
    // Restaurants and food
    if (name.includes('restaurant') || name.includes('cafe') || name.includes('food') ||
        placeTypes.some(type => ['restaurant', 'food'].includes(type))) {
      const foodImages = [
        'photo-1618160702438-9b02ab6515c9', // Restaurant interior
        'photo-1517248135467-4c7edcad34c4', // Fine dining
        'photo-1555396273-367ea4eb4db5', // Local cuisine
        'photo-1576013551627-0cc20b96c2a7', // Street food
        'photo-1565299624946-b28f40a0ca4b'  // Traditional food
      ];
      const randomImage = foodImages[Math.abs(hashString(placeName)) % foodImages.length];
      return `https://images.unsplash.com/${randomImage}?w=400&h=300&fit=crop`;
    }
    
    // City-specific images for major Indian cities
    if (name.includes('delhi') || name.includes('new delhi')) {
      return 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop'; // Red Fort Delhi
    }
    if (name.includes('mumbai') || name.includes('bombay')) {
      return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop'; // Mumbai skyline
    }
    if (name.includes('kolkata') || name.includes('calcutta')) {
      return 'https://images.unsplash.com/photo-1558431382-27dd19eada6c?w=400&h=300&fit=crop'; // Victoria Memorial
    }
    if (name.includes('chennai') || name.includes('madras')) {
      return 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop'; // Chennai Marina
    }
    if (name.includes('bangalore') || name.includes('bengaluru')) {
      return 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=300&fit=crop'; // Bangalore palace
    }
    if (name.includes('hyderabad')) {
      return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'; // Charminar
    }
    if (name.includes('jaipur')) {
      return 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=400&h=300&fit=crop'; // Hawa Mahal
    }
    if (name.includes('agra')) {
      return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop'; // Taj Mahal
    }
    
    // Default tourist attraction images
    const defaultImages = [
      'photo-1472396961693-142e6e269027', // Scenic landscape
      'photo-1433086966358-54859d0ed716', // Mountain view
      'photo-1506905925346-21bda4d32df4', // Nature scene
      'photo-1465146344425-f00d5f5c8f07', // Travel destination
      'photo-1482938289607-e9573fc25ebb'  // Tourist spot
    ];
    
    const randomImage = defaultImages[Math.abs(hashString(placeName)) % defaultImages.length];
    return `https://images.unsplash.com/${randomImage}?w=400&h=300&fit=crop`;
  },

  // Generate multiple images for a place gallery
  getPlaceGallery: (placeName: string, category?: string, count: number = 4): string[] => {
    const images = [];
    const baseImage = this.getPlaceImage(placeName, category);
    images.push(baseImage);
    
    // Generate additional related images
    for (let i = 1; i < count; i++) {
      const variantName = `${placeName}_variant_${i}`;
      images.push(this.getPlaceImage(variantName, category));
    }
    
    return images;
  }
};

// Simple hash function to generate consistent randomness for place names
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
