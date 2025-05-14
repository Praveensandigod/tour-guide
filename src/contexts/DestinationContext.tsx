import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Destination } from '@/types';
import destinationsData from '@/data/destinations';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  advancedFilter: (options: AdvancedFilterOptions) => Destination[];
}

export interface AdvancedFilterOptions {
  budget?: string;
  category?: string;
  state?: string;
  sortBy?: 'popular' | 'rating' | 'newest';
  features?: string[];
  season?: string[];
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
  const { user, isAuthenticated } = useAuth();

  // Load destinations on mount
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        // In a real app, this would be an API call to Supabase
        // For demo, we're using static data
        setDestinations(destinationsData);
      } catch (error) {
        console.error('Failed to load destinations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDestinations();
  }, []);

  // Load saved destinations from Supabase when user changes
  useEffect(() => {
    const fetchSavedDestinations = async () => {
      if (!user) {
        setSavedDestinations([]);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get user's saved destinations from Supabase
        const { data, error } = await supabase
          .from('user_destinations')
          .select('destination_id')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Map destination_ids to full destination objects
          const savedIds = data.map(item => item.destination_id);
          const saved = destinationsData.filter(dest => savedIds.includes(dest.id));
          setSavedDestinations(saved);
        } else {
          setSavedDestinations([]);
        }
      } catch (error) {
        console.error('Failed to load saved destinations:', error);
        toast({
          title: "Error",
          description: "Failed to load your saved destinations.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if user is authenticated
    if (isAuthenticated) {
      fetchSavedDestinations();
    } else {
      setSavedDestinations([]);
    }
  }, [user, isAuthenticated, toast]);

  const saveDestination = async (destination: Destination) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save destinations",
        variant: "destructive"
      });
      return;
    }
    
    if (!isSaved(destination.id)) {
      try {
        // Save to Supabase
        const { error } = await supabase
          .from('user_destinations')
          .insert({
            user_id: user.id,
            destination_id: destination.id
          });
        
        if (error) throw error;
        
        // Update local state
        setSavedDestinations(prev => [...prev, destination]);
        
        toast({
          title: "Destination saved",
          description: `${destination.name} has been added to your saved list`,
        });
      } catch (error) {
        console.error('Failed to save destination:', error);
        toast({
          title: "Error",
          description: "Failed to save destination.",
          variant: "destructive"
        });
      }
    }
  };

  const removeSavedDestination = async (destinationId: string) => {
    if (!user) return;
    
    try {
      // Remove from Supabase
      const { error } = await supabase
        .from('user_destinations')
        .delete()
        .eq('user_id', user.id)
        .eq('destination_id', destinationId);
      
      if (error) throw error;
      
      // Update local state
      setSavedDestinations(prev => prev.filter(dest => dest.id !== destinationId));
      
      toast({
        title: "Destination removed",
        description: "The destination has been removed from your saved list",
      });
    } catch (error) {
      console.error('Failed to remove destination:', error);
      toast({
        title: "Error",
        description: "Failed to remove destination.",
        variant: "destructive"
      });
    }
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

  // Advanced filter function
  const advancedFilter = (options: AdvancedFilterOptions) => {
    let filtered = [...destinations];
    
    // Filter by budget
    if (options.budget && options.budget !== 'all') {
      filtered = filtered.filter(dest => dest.budget === options.budget);
    }
    
    // Filter by category
    if (options.category && options.category !== 'all') {
      filtered = filtered.filter(dest => dest.category === options.category);
    }
    
    // Filter by state
    if (options.state && options.state !== 'All States') {
      filtered = filtered.filter(dest => {
        const state = dest.location.split(',').pop()?.trim();
        return state === options.state;
      });
    }
    
    // Filter by features
    if (options.features && options.features.length > 0) {
      // This is a placeholder - in a real app, destinations would have a "features" property
      // For now, we'll just simulate this behavior
      if (options.features.includes('family-friendly')) {
        // Example: Consider nature, beach, and temple categories as family-friendly
        filtered = filtered.filter(dest => 
          ['nature', 'beach', 'temple'].includes(dest.category)
        );
      }
      
      if (options.features.includes('guided-tours')) {
        // Example: Consider historical, monument, and statue categories as having guided tours
        filtered = filtered.filter(dest => 
          ['historical', 'monument', 'statue'].includes(dest.category)
        );
      }
      
      if (options.features.includes('wheelchair')) {
        // Example: Consider some categories as wheelchair accessible
        filtered = filtered.filter(dest => 
          ['temple', 'monument', 'statue'].includes(dest.category)
        );
      }
    }
    
    // Filter by season
    if (options.season && options.season.length > 0) {
      // This is a placeholder - in a real app, destinations would have a "bestSeason" property
      // For example, mountains are best visited in summer/winter, beaches in winter/spring
      if (options.season.includes('summer')) {
        filtered = filtered.filter(dest => 
          ['mountain', 'nature'].includes(dest.category)
        );
      }
      
      if (options.season.includes('monsoon')) {
        filtered = filtered.filter(dest => 
          ['nature', 'temple'].includes(dest.category)
        );
      }
      
      if (options.season.includes('winter')) {
        filtered = filtered.filter(dest => 
          ['beach', 'historical', 'monument', 'statue'].includes(dest.category)
        );
      }
    }
    
    // Sort results
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'popular':
          // Assuming higher-rated places are more popular for this example
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          // For demonstration, we'll just randomize the order for "newest"
          filtered.sort(() => Math.random() - 0.5);
          break;
      }
    }
    
    return filtered;
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
    advancedFilter,
  };

  return <DestinationContext.Provider value={value}>{children}</DestinationContext.Provider>;
};
