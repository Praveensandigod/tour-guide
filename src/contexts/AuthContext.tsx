
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { formatUser } from '@/utils/authUtils';
import {
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  logoutUser,
  sendPasswordResetEmail,
  resetUserPassword,
  deleteUserAccount
} from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: AuthError }>;
  register: (email: string, password: string, name: string) => Promise<{ error?: AuthError }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<{ error?: AuthError }>;
  isAuthenticated: boolean;
  deleteAccount: () => Promise<{ error?: AuthError }>;
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
              // Check if this is a verification event
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                const { data: userMetadata } = await supabase.auth.getUser();
                
                if (userMetadata?.user?.email_confirmed_at && !user?.email) {
                  toast({
                    title: "Email verified successfully",
                    description: "Your email has been verified. Welcome!",
                  });
                }
              }
              
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
      const result = await loginWithEmailAndPassword(email, password);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const result = await registerWithEmailAndPassword(email, password, name);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(email);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetPassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      return await resetUserPassword(newPassword);
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      return await deleteUserAccount();
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
    resetPassword,
    isAuthenticated: !!user,
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
