
export const generatePlaceImageUrl = (placeName: string, width: number = 400, height: number = 300): string => {
  // Clean the place name for better image results
  const cleanPlaceName = placeName
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  // Create search terms for better image matching
  const searchTerms = [
    cleanPlaceName,
    'landmark',
    'architecture',
    'travel',
    'destination'
  ].join(' ');
  
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(searchTerms)}`;
};

export const generateMultiplePlaceImages = (placeName: string, count: number = 6): string[] => {
  const images: string[] = [];
  const baseTerms = [
    'landmark architecture',
    'scenic view',
    'travel destination',
    'tourist attraction',
    'cultural site',
    'historical place'
  ];
  
  for (let i = 0; i < count; i++) {
    const searchTerm = `${placeName} ${baseTerms[i % baseTerms.length]}`;
    images.push(`https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerm)}&sig=${i}`);
  }
  
  return images;
};

export const getCategoryImageUrl = (category: string, placeName?: string): string => {
  const categoryMap: Record<string, string> = {
    historical: 'historical monument architecture',
    temple: 'temple religious architecture',
    nature: 'natural landscape scenic',
    mountain: 'mountain landscape scenic',
    beach: 'beach ocean tropical',
    monument: 'monument landmark architecture',
    statue: 'statue sculpture landmark',
    attraction: 'tourist attraction landmark'
  };
  
  const searchTerm = placeName 
    ? `${placeName} ${categoryMap[category] || 'landmark'}`
    : categoryMap[category] || 'landmark';
  
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerm)}`;
};
