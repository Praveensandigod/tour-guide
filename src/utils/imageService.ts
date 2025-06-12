
export const generatePlaceImageUrl = (placeName: string, width: number = 400, height: number = 300): string => {
  console.log('Generating image for place:', placeName);
  
  // Clean the place name for better image results
  const cleanPlaceName = placeName
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  // Create search terms for better image matching with specific place names
  const searchTerms = [
    cleanPlaceName,
    'tourist attraction',
    'landmark',
    'travel destination'
  ].join(' ');
  
  const imageUrl = `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(searchTerms)}&auto=format&fit=crop`;
  console.log('Generated image URL:', imageUrl);
  
  return imageUrl;
};

export const generateMultiplePlaceImages = (placeName: string, count: number = 6): string[] => {
  const images: string[] = [];
  const baseTerms = [
    'landmark architecture',
    'scenic view photography',
    'travel destination photo',
    'tourist attraction image',
    'cultural heritage site',
    'historical monument'
  ];
  
  for (let i = 0; i < count; i++) {
    const searchTerm = `${placeName} ${baseTerms[i % baseTerms.length]}`;
    const imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerm)}&auto=format&fit=crop&sig=${i}`;
    images.push(imageUrl);
    console.log(`Generated image ${i + 1}:`, imageUrl);
  }
  
  return images;
};

export const getCategoryImageUrl = (category: string, placeName?: string): string => {
  const categoryMap: Record<string, string> = {
    historical: 'historical monument architecture heritage',
    temple: 'temple religious architecture sacred',
    nature: 'natural landscape scenic beauty',
    mountain: 'mountain landscape scenic peak',
    beach: 'beach ocean tropical paradise',
    monument: 'monument landmark architecture famous',
    statue: 'statue sculpture landmark art',
    attraction: 'tourist attraction landmark destination'
  };
  
  const categoryTerm = categoryMap[category] || 'landmark tourism';
  const searchTerm = placeName 
    ? `${placeName} ${categoryTerm}`
    : categoryTerm;
  
  const imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerm)}&auto=format&fit=crop`;
  console.log('Generated category image URL:', imageUrl);
  
  return imageUrl;
};

// Helper function to get a better image URL for specific places
export const getPlaceSpecificImageUrl = (placeName: string, category?: string): string => {
  const cleanName = placeName.toLowerCase();
  
  // Specific image mappings for popular places
  const specificMappings: Record<string, string> = {
    'taj mahal': 'taj mahal agra india monument',
    'red fort': 'red fort delhi india historical',
    'gateway india': 'gateway of india mumbai landmark',
    'india gate': 'india gate delhi memorial',
    'qutub minar': 'qutub minar delhi tower',
    'lotus temple': 'lotus temple delhi bahai',
    'golden temple': 'golden temple amritsar sikh',
    'charminar': 'charminar hyderabad monument',
    'mysore palace': 'mysore palace karnataka royal',
    'hawa mahal': 'hawa mahal jaipur pink city'
  };
  
  // Check for specific mappings
  for (const [key, value] of Object.entries(specificMappings)) {
    if (cleanName.includes(key)) {
      return `https://source.unsplash.com/400x300/?${encodeURIComponent(value)}&auto=format&fit=crop`;
    }
  }
  
  // Fall back to category-based or general search
  return category 
    ? getCategoryImageUrl(category, placeName)
    : generatePlaceImageUrl(placeName);
};
