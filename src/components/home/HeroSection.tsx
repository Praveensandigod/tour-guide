
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/destinations/SearchBar';

interface HeroSectionProps {
  scrollY: number;
}

const HeroSection = ({ scrollY }: HeroSectionProps) => {
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

  return (
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
  );
};

export default HeroSection;
