
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('journey_nexus_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes only - in a real app, this would be validated by the server
      if (email === 'demo@example.com' && password === 'password') {
        const user: User = {
          id: '1',
          email: email,
          name: 'Demo User',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('journey_nexus_user', JSON.stringify(user));
        
        // Restore saved destinations for this user from their specific storage key
        const userSavedDestinations = localStorage.getItem(`journey_nexus_saved_destinations_${email}`);
        if (userSavedDestinations) {
          localStorage.setItem('journey_nexus_saved_destinations', userSavedDestinations);
        }
        
        setUser(user);
        toast({
          title: "Login successful",
          description: "Welcome back! Your saved destinations have been restored.",
        });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('journey_nexus_user', JSON.stringify(user));
      
      // Initialize empty saved destinations for new user
      localStorage.setItem(`journey_nexus_saved_destinations_${email}`, JSON.stringify([]));
      localStorage.setItem('journey_nexus_saved_destinations', JSON.stringify([]));
      
      setUser(user);
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (user?.email) {
      // Save current destinations to user-specific storage before logout
      const currentDestinations = localStorage.getItem('journey_nexus_saved_destinations');
      if (currentDestinations) {
        localStorage.setItem(`journey_nexus_saved_destinations_${user.email}`, currentDestinations);
      }
    }
    
    localStorage.removeItem('journey_nexus_user');
    localStorage.removeItem('journey_nexus_saved_destinations');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    setIsLoading(false);
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password reset link sent",
        description: `If ${email} exists in our database, you will receive a password reset link shortly.`,
      });
    } catch (error) {
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    isAuthenticated: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
