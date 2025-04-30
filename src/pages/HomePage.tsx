
import { useState, useEffect } from 'react';
import { useDestinations } from '@/contexts/DestinationContext';
import HeroSection from '@/components/home/HeroSection';
import FeaturedDestinations from '@/components/home/FeaturedDestinations';
import TravelTips from '@/components/home/TravelTips';
import AboutSection from '@/components/home/AboutSection';
import CtaSection from '@/components/home/CtaSection';

const HomePage = () => {
  const { destinations } = useDestinations();
  const [scrollY, setScrollY] = useState(0);
  const featuredDestinations = destinations.slice(0, 3);
  
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
      <HeroSection scrollY={scrollY} />
      <FeaturedDestinations destinations={featuredDestinations} />
      <TravelTips />
      <AboutSection />
      <CtaSection />
    </div>
  );
};

export default HomePage;
