
import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDestinations } from '@/contexts/DestinationContext';
import SearchBar from '@/components/destinations/SearchBar';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { destinations } = useDestinations();
  const [scrollY, setScrollY] = useState(0);
  const featuredDestinations = destinations.slice(0, 3);
  
  const { ref: titleRef, inView: titleInView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });
  
  const { ref: subtitleRef, inView: subtitleInView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
    delay: 300,
  });
  
  const { ref: searchRef, inView: searchInView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
    delay: 600,
  });
  
  const { ref: sectionOneRef, inView: sectionOneInView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  
  const { ref: sectionTwoRef, inView: sectionTwoInView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  
  const { ref: sectionThreeRef, inView: sectionThreeInView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div className="pb-24">
      {/* Hero Section with Parallax */}
      <section className="parallax-container h-[70vh] flex items-center justify-center">
        <div 
          className="parallax-layer bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80')] bg-cover bg-center"
          style={{ transform: `translateY(${scrollY * 0.4}px)` }}
        ></div>
        <div 
          className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background"
        ></div>
        
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h1 
            ref={titleRef}
            className={`text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg transition-all duration-700 ${
              titleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Discover Your Next Adventure
          </h1>
          <p 
            ref={subtitleRef}
            className={`text-xl md:text-2xl mb-8 text-white/90 transition-all duration-700 delay-300 ${
              subtitleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Explore breathtaking destinations and create unforgettable memories
          </p>
          <div 
            ref={searchRef} 
            className={`transition-all duration-700 delay-500 ${
              searchInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <SearchBar />
            <div className="mt-6">
              <Link to="/recommendations">
                <Button className="bg-white text-primary hover:bg-white/90">
                  Explore Destinations <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Destinations */}
      <section 
        ref={sectionOneRef}
        className={`py-16 px-4 transition-all duration-700 ${
          sectionOneInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDestinations.map((destination, index) => (
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
      
      {/* Travel Tips Section */}
      <section 
        ref={sectionTwoRef}
        className={`py-16 px-4 bg-muted/30 transition-all duration-700 ${
          sectionTwoInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Travel Inspiration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover-scale">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Embrace the Unknown</h3>
              <p className="text-muted-foreground">Step outside your comfort zone and discover new perspectives that will transform your worldview.</p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover-scale">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Connect with Cultures</h3>
              <p className="text-muted-foreground">Immerse yourself in local traditions and create authentic connections with people around the world.</p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover-scale">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Collect Moments</h3>
              <p className="text-muted-foreground">Focus on experiences rather than things. The memories you create will last a lifetime.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Us Section */}
      <section 
        ref={sectionThreeRef}
        className={`py-16 px-4 transition-all duration-700 ${
          sectionThreeInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
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
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg mb-8 text-white/80">
            Explore destinations, save your favorites, and plan your next adventure with us.
          </p>
          <Link to="/recommendations">
            <Button variant="secondary" size="lg">
              Explore Destinations <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
