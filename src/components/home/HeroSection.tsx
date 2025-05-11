
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Logo from "../navigation/Logo";

interface HeroSectionProps {
  scrollY: number;
}

const HeroSection = ({ scrollY }: HeroSectionProps) => {
  const parallaxOffset = scrollY * 0.5;
  
  return (
    <section className="relative h-[80vh] min-h-[500px] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1469474968028-56623f02e42e)',
          transform: `translateY(${parallaxOffset}px)`,
          backgroundPositionY: `calc(50% + ${parallaxOffset * 0.5}px)`
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="relative container mx-auto h-full flex flex-col justify-center px-4">
        <div className="flex flex-col items-start max-w-xl">
          <div className="mb-4 transform scale-150">
            <Logo />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Discover Amazing Destinations
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Explore beautiful places around the world. Plan your next adventure with us!
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link to="/recommendations">Start Exploring</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/map">View on Map</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
