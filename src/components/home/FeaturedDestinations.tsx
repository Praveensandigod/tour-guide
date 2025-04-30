
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Destination } from '@/types';

interface FeaturedDestinationsProps {
  destinations: Destination[];
}

const FeaturedDestinations = ({ destinations }: FeaturedDestinationsProps) => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

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
          {destinations.map((destination) => (
            <Link 
              key={destination.id} 
              to={`/destinations/${destination.id}`}
              className="destination-card group"
            >
              <div className="relative overflow-hidden rounded-lg h-64">
                <img
                  src={destination.imageUrl}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="font-bold text-xl">{destination.name}</h3>
                  <p className="text-white/80">{destination.location}</p>
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
