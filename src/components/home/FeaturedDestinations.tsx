
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Destination } from '@/types';
import { useState, useEffect } from 'react';
import { mapboxService } from '@/utils/mapboxService';
import { generatePlaceImageUrl } from '@/utils/imageService';

interface FeaturedDestinationsProps {
  destinations: Destination[];
}

interface EnhancedDestination extends Destination {
  enhancedImage?: string;
  enhancedRating?: number;
}

const FeaturedDestinations = ({ destinations }: FeaturedDestinationsProps) => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const [enhancedDestinations, setEnhancedDestinations] = useState<EnhancedDestination[]>([]);

  useEffect(() => {
    const enhanceDestinations = async () => {
      const enhanced = await Promise.all(
        destinations.map(async (destination): Promise<EnhancedDestination> => {
          try {
            // Always generate better images using our image service
            const enhancedImage = generatePlaceImageUrl(destination.name);
            
            const searchResults = await mapboxService.searchPlaces(destination.name);
            
            if (searchResults && searchResults.results && searchResults.results.length > 0) {
              const place = searchResults.results[0];
              
              return {
                ...destination,
                enhancedImage,
                enhancedRating: place.rating || destination.rating
              };
            }
          } catch (error) {
            console.error('Error enhancing destination:', error);
          }
          
          return {
            ...destination,
            enhancedImage: generatePlaceImageUrl(destination.name)
          };
        })
      );
      
      setEnhancedDestinations(enhanced);
    };

    if (destinations.length > 0) {
      enhanceDestinations();
    }
  }, [destinations]);

  const displayDestinations = enhancedDestinations.length > 0 ? enhancedDestinations : destinations;

  return (
    <section 
      ref={ref}
      className={`py-16 px-4 transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayDestinations.map((destination) => (
            <Link 
              key={destination.id} 
              to={`/places/${destination.id}`}
              className="destination-card group"
            >
              <div className="relative overflow-hidden rounded-lg h-64">
                <img
                  src={(destination as EnhancedDestination).enhancedImage || destination.imageUrl}
                  alt={destination.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const fallbackUrl = generatePlaceImageUrl(destination.name);
                    (e.target as HTMLImageElement).src = fallbackUrl;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="font-bold text-xl mb-1">{destination.name}</h3>
                  <p className="text-white/80 text-sm mb-2">{destination.location}</p>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor((destination as EnhancedDestination).enhancedRating || destination.rating)
                              ? 'text-yellow-500'
                              : 'text-gray-400'
                          }`}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                    <span className="ml-1 text-sm">
                      {((destination as EnhancedDestination).enhancedRating || destination.rating).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/recommendations">
            <Button variant="outline">
              View All Destinations <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
