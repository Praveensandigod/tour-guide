import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDestinations } from '@/contexts/DestinationContext';
import { Bookmark, Map, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DestinationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { destinations, saveDestination, removeSavedDestination, isSaved } = useDestinations();
  const [destination, setDestination] = useState(destinations.find(d => d.id === id));
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    setDestination(destinations.find(d => d.id === id));
  }, [id, destinations]);
  
  if (!destination) {
    return (
      <div className="container mx-auto max-w-4xl py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Destination not found</h1>
        <p className="mb-6">The destination you're looking for doesn't exist or has been removed.</p>
        <Link to="/recommendations">
          <Button>Explore Other Destinations</Button>
        </Link>
      </div>
    );
  }
  
  const getBudgetLabel = (budget: string) => {
    switch (budget) {
      case 'low':
        return { label: 'Budget Friendly', class: 'bg-green-100 text-green-800' };
      case 'medium':
        return { label: 'Mid-range', class: 'bg-yellow-100 text-yellow-800' };
      case 'high':
        return { label: 'Luxury', class: 'bg-red-100 text-red-800' };
      default:
        return { label: '', class: '' };
    }
  };
  
  const budgetInfo = getBudgetLabel(destination.budget);
  
  const handleSaveToggle = () => {
    if (isSaved(destination.id)) {
      removeSavedDestination(destination.id);
    } else {
      saveDestination(destination);
    }
  };
  
  return (
    <div className="pb-24">
      {/* Hero Image with Parallax */}
      <div className="relative h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${destination.imageUrl})`,
            transform: `translateY(${scrollY * 0.5}px)` 
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/95"></div>
        
        <Link to="/recommendations" className="absolute top-4 left-4 z-10">
          <Button variant="outline" size="icon" className="bg-background/50 backdrop-blur-sm">
            <ArrowLeft size={18} />
          </Button>
        </Link>
      </div>
      
      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4">
        <div className="relative -mt-24 bg-background rounded-t-3xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold mb-2">{destination.name}</h1>
            <button
              onClick={handleSaveToggle}
              className="bg-white p-2 rounded-full shadow-md hover:bg-muted transition-colors"
              title={isSaved(destination.id) ? "Remove from saved" : "Save destination"}
            >
              <Bookmark 
                size={20} 
                fill={isSaved(destination.id) ? "currentColor" : "none"} 
                className={isSaved(destination.id) ? "text-primary" : ""}
              />
            </button>
          </div>
          
          <div className="flex items-center mb-4">
            <p className="text-muted-foreground">{destination.location}</p>
            <span className="mx-2">•</span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${budgetInfo.class}`}>
              {budgetInfo.label}
            </span>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(destination.rating)
                      ? 'text-yellow-500'
                      : i < destination.rating
                      ? 'text-yellow-300'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-sm font-medium">{destination.rating} / 5</span>
          </div>
          
          <h2 className="text-xl font-bold mb-2">About this destination</h2>
          <p className="text-muted-foreground mb-6">
            {destination.description}
          </p>
          
          <Link 
            to={`/map?destination=${destination.id}`}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Map size={18} />
            View on Map
          </Link>
        </div>
      </div>
      
      {/* Photos Section */}
      <div className="container mx-auto max-w-4xl px-4 mt-8">
        <h2 className="text-xl font-bold mb-4">Photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <img 
            src={destination.imageUrl} 
            alt={destination.name} 
            className="rounded-lg h-40 w-full object-cover"
          />
          <img 
            src={destination.imageUrl + '?q=80'} 
            alt={destination.name} 
            className="rounded-lg h-40 w-full object-cover"
          />
          <img 
            src={destination.imageUrl + '?q=75'} 
            alt={destination.name} 
            className="rounded-lg h-40 w-full object-cover"
          />
        </div>
      </div>
      
      {/* Recommendations Section */}
      <div className="container mx-auto max-w-4xl px-4 mt-8">
        <h2 className="text-xl font-bold mb-4">You might also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {destinations
            .filter(d => d.id !== destination.id && d.budget === destination.budget)
            .slice(0, 3)
            .map(d => (
              <Link 
                key={d.id} 
                to={`/destinations/${d.id}`}
                className="group"
              >
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={d.imageUrl} 
                    alt={d.name} 
                    className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-medium mt-2">{d.name}</h3>
                <p className="text-sm text-muted-foreground">{d.location}</p>
              </Link>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default DestinationDetailPage;
