
export const generatePlaceImageUrl = (placeName: string, width: number = 400, height: number = 300): string => {
  // Clean the place name for better image results
  const cleanPlaceName = placeName
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  // Create more specific search terms for better image matching
  const searchTerms = [
    cleanPlaceName,
    'landmark',
    'architecture',
    'tourist attraction',
    'destination'
  ].join(' ');
  
  // Add a timestamp to ensure unique images
  const timestamp = Date.now();
  
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(searchTerms)}&sig=${timestamp}`;
};

export const generateMultiplePlaceImages = (placeName: string, count: number = 6): string[] => {
  const images: string[] = [];
  const baseTerms = [
    `${placeName} landmark architecture`,
    `${placeName} scenic view tourist`,
    `${placeName} travel destination famous`,
    `${placeName} tourist attraction historical`,
    `${placeName} cultural site heritage`,
    `${placeName} beautiful place visit`
  ];
  
  for (let i = 0; i < count; i++) {
    const searchTerm = baseTerms[i % baseTerms.length];
    const timestamp = Date.now() + i;
    images.push(`https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerm)}&sig=${timestamp}`);
  }
  
  return images;
};

export const getCategoryImageUrl = (category: string, placeName?: string): string => {
  const categoryMap: Record<string, string> = {
    historical: 'historical monument architecture heritage',
    temple: 'temple religious architecture sacred',
    nature: 'natural landscape scenic mountains',
    mountain: 'mountain landscape scenic peaks',
    beach: 'beach ocean tropical paradise',
    monument: 'monument landmark architecture famous',
    statue: 'statue sculpture landmark art',
    attraction: 'tourist attraction landmark famous'
  };
  
  const searchTerm = placeName 
    ? `${placeName} ${categoryMap[category] || 'landmark tourism'}`
    : categoryMap[category] || 'landmark tourism';
  
  const timestamp = Date.now();
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerm)}&sig=${timestamp}`;
};

// Enhanced function to get place-specific images with fallback
export const getPlaceImageWithFallback = async (placeName: string): Promise<string> => {
  try {
    // Try to get a high-quality image for the specific place
    const specificImage = generatePlaceImageUrl(placeName, 800, 600);
    
    // Test if the image loads
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(specificImage);
      img.onerror = () => {
        // Fallback to a more generic search
        const fallbackImage = `https://source.unsplash.com/800x600/?${encodeURIComponent(placeName + ' travel destination')}&sig=${Date.now()}`;
        resolve(fallbackImage);
      };
      img.src = specificImage;
    });
  } catch (error) {
    console.error('Error loading place image:', error);
    return `https://source.unsplash.com/800x600/?travel&sig=${Date.now()}`;
  }
};
