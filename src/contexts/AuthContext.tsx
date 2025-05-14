
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: AuthError }>;
  register: (email: string, password: string, name: string) => Promise<{ error?: AuthError }>;
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

// Helper function to convert Supabase user to our app's User format
const formatUser = (user: SupabaseUser | null, profileData: any = null): User | null => {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email || '',
    name: profileData?.name || user.user_metadata?.name || '',
    profileImage: profileData?.profile_image || user.user_metadata?.avatar_url || '',
    createdAt: profileData?.created_at || user.created_at || new Date().toISOString()
  };
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Setup auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);

        if (currentSession?.user) {
          // Use setTimeout to prevent potential deadlock
          setTimeout(async () => {
            try {
              // Fetch user profile data
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
              
              setUser(formatUser(currentSession.user, profileData));
              console.log("User authenticated:", currentSession.user.email);
            } catch (error) {
              console.error("Error fetching user profile:", error);
              setUser(formatUser(currentSession.user));
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();
          
          setUser(formatUser(initialSession.user, profileData));
          console.log("Session initialized for:", initialSession.user.email);
        }
        setSession(initialSession);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message || "Something went wrong",
          variant: "destructive"
        });
        return { error };
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      return {};
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
      return { error: error as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      console.log("Registering user:", email, name);
      
      // Register the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name // This will be available in user_metadata
          }
        }
      });
      
      if (error) {
        console.error("Registration error:", error);
        return { error };
      }
      
      console.log("Registration response:", data);
      
      // Unlike login, we won't automatically set the user here
      // The user will need to verify their email first (if required)
      
      return {};
    } catch (error: any) {
      console.error("Registration exception:", error);
      return { error: error as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset link sent",
        description: `If ${email} exists in our database, you will receive a password reset link shortly.`,
      });
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message || "Something went wrong",
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
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
