
import React from 'react';
import { Star, MapPin, Globe, Clock, Phone, Camera, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { imageService } from '@/utils/imageService';

interface PlaceDetailsTemplateProps {
  place: {
    name: string;
    formatted_address?: string;
    rating?: number;
    photos?: string[];
    website?: string;
    opening_hours?: any;
    international_phone_number?: string;
    description?: string;
    category?: string;
    budget?: string;
    types?: string[];
  };
  onViewOnMap?: () => void;
}

const PlaceDetailsTemplate: React.FC<PlaceDetailsTemplateProps> = ({ 
  place, 
  onViewOnMap 
}) => {
  const getBudgetInfo = (budget?: string) => {
    switch (budget) {
      case 'low':
        return { label: 'Budget Friendly', class: 'bg-green-100 text-green-800', icon: '$' };
      case 'medium':
        return { label: 'Mid-range', class: 'bg-yellow-100 text-yellow-800', icon: '$$' };
      case 'high':
        return { label: 'Luxury', class: 'bg-red-100 text-red-800', icon: '$$$' };
      default:
        return { label: 'Standard', class: 'bg-blue-100 text-blue-800', icon: '$$' };
    }
  };

  // Generate unique images for this place
  const placeImages = place.photos?.length 
    ? place.photos 
    : imageService.getPlaceGallery(place.name, place.category, 6);

  const budgetInfo = getBudgetInfo(place.budget);

  return (
    <div className="bg-background rounded-lg shadow-lg overflow-hidden">
      {/* Hero Image Section */}
      {placeImages.length > 0 && (
        <div className="relative h-64 md:h-80">
          <img
            src={placeImages[0]}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = imageService.getPlaceImage('fallback', 'attraction');
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{place.name}</h1>
            {place.formatted_address && (
              <p className="text-sm opacity-90 flex items-center">
                <MapPin size={14} className="mr-1" />
                {place.formatted_address}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Title and Rating (if no hero image) */}
        {(!placeImages || placeImages.length === 0) && (
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{place.name}</h1>
            {place.formatted_address && (
              <p className="text-muted-foreground flex items-center">
                <MapPin size={16} className="mr-2" />
                {place.formatted_address}
              </p>
            )}
          </div>
        )}

        {/* Rating and Budget */}
        <div className="flex items-center justify-between mb-6">
          {place.rating && place.rating > 0 && (
            <div className="flex items-center">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(place.rating!)
                        ? 'text-yellow-500'
                        : i < place.rating!
                        ? 'text-yellow-300'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="ml-2 text-sm font-medium">{place.rating.toFixed(1)} / 5</span>
            </div>
          )}
          
          {budgetInfo.label && (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${budgetInfo.class} flex items-center gap-1`}>
              <DollarSign size={14} />
              {budgetInfo.label}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">About this place</h2>
          <p className="text-muted-foreground leading-relaxed">
            {place.description || `Discover ${place.name}, a wonderful destination offering unique experiences and cultural richness. Perfect for travelers seeking authentic local experiences and memorable adventures.`}
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {place.website && (
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-primary" />
              <a 
                href={place.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Visit Website
              </a>
            </div>
          )}
          
          {place.international_phone_number && (
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-primary" />
              <span className="text-sm">{place.international_phone_number}</span>
            </div>
          )}
          
          {place.opening_hours && (
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span className="text-sm">Check opening hours</span>
            </div>
          )}
        </div>

        {/* Photo Gallery */}
        {placeImages.length > 1 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 flex items-center">
              <Camera size={20} className="mr-2" />
              Photos ({placeImages.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {placeImages.slice(1, 7).map((photo, index) => (
                <img 
                  key={index}
                  src={photo} 
                  alt={`${place.name} ${index + 2}`} 
                  className="rounded-lg h-32 w-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = imageService.getPlaceImage(`${place.name}_${index}`, place.category);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {onViewOnMap && (
          <Button onClick={onViewOnMap} className="w-full md:w-auto">
            <MapPin className="mr-2" size={16} />
            View on Map
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlaceDetailsTemplate;
