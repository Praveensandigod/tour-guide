
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Destination } from '@/types';
import destinationsData from '@/data/destinations';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

interface DestinationContextType {
  destinations: Destination[];
  savedDestinations: Destination[];
  saveDestination: (destination: Destination) => void;
  removeSavedDestination: (destinationId: string) => void;
  isSaved: (destinationId: string) => boolean;
  isLoading: boolean;
  filteredDestinations: (budget?: string) => Destination[];
  searchDestinations: (query: string) => Destination[];
  currentSearchQuery: string;
  setCurrentSearchQuery: (query: string) => void;
  selectedBudget: string;
  setSelectedBudget: (budget: string) => void;
  getStatesList: () => string[];
}

const DestinationContext = createContext<DestinationContextType | undefined>(undefined);

export const useDestinations = () => {
  const context = useContext(DestinationContext);
  if (context === undefined) {
    throw new Error('useDestinations must be used within a DestinationProvider');
  }
  return context;
};

interface DestinationProviderProps {
  children: ReactNode;
}

export const DestinationProvider = ({ children }: DestinationProviderProps) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const { toast } = useToast();
  const { user } = useAuth();

  // Load destinations and saved destinations on mount
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        // In a real app, this would be an API call
        // For demo, we're using static data
        setDestinations(destinationsData);
        
        // Load saved destinations from localStorage
        const savedJSON = localStorage.getItem('journey_nexus_saved_destinations');
        if (savedJSON) {
          setSavedDestinations(JSON.parse(savedJSON));
        }
      } catch (error) {
        console.error('Failed to load destinations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDestinations();
  }, []);

  // Update localStorage when user changes
  useEffect(() => {
    if (user?.email) {
      // When user logs in, check if they have saved destinations in their account
      const userSavedDestinations = localStorage.getItem(`journey_nexus_saved_destinations_${user.email}`);
      if (userSavedDestinations) {
        const parsedDestinations = JSON.parse(userSavedDestinations);
        setSavedDestinations(parsedDestinations);
        localStorage.setItem('journey_nexus_saved_destinations', userSavedDestinations);
      }
    }
  }, [user]);

  // Save to localStorage whenever savedDestinations changes
  useEffect(() => {
    if (savedDestinations.length > 0 || user?.email) {
      localStorage.setItem('journey_nexus_saved_destinations', JSON.stringify(savedDestinations));
      
      // If user is logged in, also save to their specific storage key
      if (user?.email) {
        localStorage.setItem(`journey_nexus_saved_destinations_${user.email}`, JSON.stringify(savedDestinations));
      }
    }
  }, [savedDestinations, user]);

  const saveDestination = (destination: Destination) => {
    if (!isSaved(destination.id)) {
      setSavedDestinations([...savedDestinations, destination]);
      toast({
        title: "Destination saved",
        description: `${destination.name} has been added to your saved list`,
      });
    }
  };

  const removeSavedDestination = (destinationId: string) => {
    setSavedDestinations(savedDestinations.filter(dest => dest.id !== destinationId));
    toast({
      title: "Destination removed",
      description: "The destination has been removed from your saved list",
    });
  };

  const isSaved = (destinationId: string) => {
    return savedDestinations.some(destination => destination.id === destinationId);
  };

  const filteredDestinations = (budget?: string) => {
    if (!budget || budget === 'all') {
      return destinations;
    }
    
    return destinations.filter(destination => destination.budget === budget);
  };

  const searchDestinations = (query: string) => {
    if (!query) return destinations;
    
    const normalizedQuery = query.toLowerCase();
    return destinations.filter(dest => 
      dest.name.toLowerCase().includes(normalizedQuery) || 
      dest.location.toLowerCase().includes(normalizedQuery) ||
      dest.description.toLowerCase().includes(normalizedQuery) ||
      dest.category.toLowerCase().includes(normalizedQuery)
    );
  };
  
  // Get all unique states from destinations
  const getStatesList = () => {
    const states = new Set<string>();
    destinations.forEach(dest => {
      const state = dest.location.split(',').pop()?.trim();
      if (state) states.add(state);
    });
    return Array.from(states).sort();
  };

  const value = {
    destinations,
    savedDestinations,
    saveDestination,
    removeSavedDestination,
    isSaved,
    isLoading,
    filteredDestinations,
    searchDestinations,
    currentSearchQuery,
    setCurrentSearchQuery,
    selectedBudget,
    setSelectedBudget,
    getStatesList,
  };

  return <DestinationContext.Provider value={value}>{children}</DestinationContext.Provider>;
};
