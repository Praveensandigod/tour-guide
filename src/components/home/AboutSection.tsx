
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';

const AboutSection = () => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">About Journey Nexus</h2>
            <p className="text-lg mb-6 text-muted-foreground">
              We're passionate travelers who believe that exploring the world shouldn't be complicated. Our mission is to help you discover amazing destinations, plan your trips with ease, and create unforgettable memories along the way.
            </p>
            <p className="text-lg mb-6 text-muted-foreground">
              Whether you're a budget backpacker, a luxury traveler, or somewhere in between, we've curated destinations for every type of adventurer. Use our interactive map features to plan your routes and make the most of your travels.
            </p>
            <Button variant="outline">Learn More About Us</Button>
          </div>
          <div className="relative">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1519055548599-6d4d129508c4" 
                alt="Team of travelers" 
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-primary/10 rounded-lg -z-10"></div>
            <div className="absolute -top-6 -left-6 w-40 h-40 bg-secondary/20 rounded-lg -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
