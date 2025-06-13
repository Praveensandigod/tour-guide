
export const generatePlaceImageUrl = (placeName: string, width: number = 400, height: number = 300): string => {
  console.log('Generating image for place:', placeName);
  
  // Clean the place name for better image results
  const cleanPlaceName = placeName
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  // Create search terms for better image matching
  const searchTerms = `${cleanPlaceName} tourist attraction landmark destination`;
  
  // Use Unsplash with timestamp to avoid caching issues
  const timestamp = Date.now();
  const imageUrl = `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(searchTerms)}&auto=format&fit=crop&t=${timestamp}`;
  console.log('Generated image URL:', imageUrl);
  
  return imageUrl;
};

export const generateMultiplePlaceImages = (placeName: string, count: number = 6): string[] => {
  const images: string[] = [];
  const baseTerms = [
    'landmark architecture monument',
    'scenic view photography tourist',
    'travel destination famous place',
    'tourist attraction beautiful',
    'cultural heritage historic site',
    'architectural wonder building'
  ];
  
  for (let i = 0; i < count; i++) {
    const searchTerm = `${placeName} ${baseTerms[i % baseTerms.length]}`;
    const timestamp = Date.now() + i;
    const imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerm)}&auto=format&fit=crop&t=${timestamp}`;
    images.push(imageUrl);
    console.log(`Generated image ${i + 1}:`, imageUrl);
  }
  
  return images;
};

export const getCategoryImageUrl = (category: string, placeName?: string): string => {
  const categoryMap: Record<string, string> = {
    historical: 'historical monument architecture heritage building',
    temple: 'temple religious architecture sacred shrine',
    nature: 'natural landscape scenic beauty park',
    mountain: 'mountain landscape scenic peak hiking',
    beach: 'beach ocean tropical paradise coastline',
    monument: 'monument landmark architecture famous building',
    statue: 'statue sculpture landmark art memorial',
    attraction: 'tourist attraction landmark destination famous'
  };
  
  const categoryTerm = categoryMap[category] || 'landmark tourism destination';
  const searchTerm = placeName 
    ? `${placeName} ${categoryTerm}`
    : categoryTerm;
  
  const timestamp = Date.now();
  const imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerm)}&auto=format&fit=crop&t=${timestamp}`;
  console.log('Generated category image URL:', imageUrl);
  
  return imageUrl;
};

// Enhanced place-specific image URL generator
export const getPlaceSpecificImageUrl = (placeName: string, category?: string): string => {
  const cleanName = placeName.toLowerCase();
  
  // Specific image mappings for popular places
  const specificMappings: Record<string, string> = {
    'taj mahal': 'taj mahal agra india monument white marble',
    'red fort': 'red fort delhi india historical mughal architecture',
    'gateway india': 'gateway of india mumbai landmark arch',
    'india gate': 'india gate delhi memorial war monument',
    'qutub minar': 'qutub minar delhi tower minaret historical',
    'lotus temple': 'lotus temple delhi bahai architecture modern',
    'golden temple': 'golden temple amritsar sikh gurudwara gold',
    'charminar': 'charminar hyderabad monument four minarets',
    'mysore palace': 'mysore palace karnataka royal architecture',
    'hawa mahal': 'hawa mahal jaipur pink city palace windows',
    'agra fort': 'agra fort uttar pradesh mughal architecture',
    'fatehpur sikri': 'fatehpur sikri agra ghost city mughal',
    'ellora caves': 'ellora caves maharashtra rock cut temples',
    'ajanta caves': 'ajanta caves maharashtra buddhist paintings',
    'hampi': 'hampi karnataka ruins vijayanagara empire stones',
    'khajuraho': 'khajuraho madhya pradesh temples sculptures',
    'konark sun temple': 'konark sun temple odisha chariot wheels',
    'mahabalipuram': 'mahabalipuram tamil nadu shore temple sculptures',
    'sanchi stupa': 'sanchi stupa madhya pradesh buddhist monument',
    'goa beaches': 'goa beaches palm trees coconut sand ocean'
  };
  
  // Check for specific mappings
  for (const [key, value] of Object.entries(specificMappings)) {
    if (cleanName.includes(key)) {
      const timestamp = Date.now();
      return `https://source.unsplash.com/400x300/?${encodeURIComponent(value)}&auto=format&fit=crop&t=${timestamp}`;
    }
  }
  
  // Enhanced fallback with better search terms
  const enhancedSearchTerms = category 
    ? `${placeName} ${category} tourist destination landmark`
    : `${placeName} tourist attraction landmark destination famous place`;
  
  const timestamp = Date.now();
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(enhancedSearchTerms)}&auto=format&fit=crop&t=${timestamp}`;
};

// Alternative image source for better reliability
export const getAlternativeImageUrl = (placeName: string, category?: string): string => {
  // Using Lorem Picsum as backup with search-like parameters
  const seed = placeName.replace(/\s+/g, '').toLowerCase();
  return `https://picsum.photos/seed/${seed}/400/300`;
};

// Combined image URL with fallback strategy
export const getReliableImageUrl = (placeName: string, category?: string): string => {
  // Primary: Enhanced Unsplash
  const primaryUrl = getPlaceSpecificImageUrl(placeName, category);
  
  // For immediate display, return the primary URL
  // The onError handler in components will handle fallbacks
  return primaryUrl;
};
