import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: any }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: any }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: any }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: any }>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  deleteAccount: async () => ({ success: false }),
  forgotPassword: async () => ({ success: false }),
  updatePassword: async () => ({ success: false }),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for user session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data && data.session) {
          setUser(data.session.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        toast({
          title: "Registration Successful",
          description: "Please check your email to confirm your account.",
        });
        
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Could not create account. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete account function - Updated to use the edge function properly
  const deleteAccount = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error("No user found to delete");
      }
      
      // Call the delete-user edge function
      const { error } = await supabase.functions.invoke('delete-user');
      
      if (error) {
        throw error;
      }
      
      // Sign out after successful deletion
      await supabase.auth.signOut();
      
      // Clear auth state
      setUser(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset (previously handlePasswordReset)
  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Email Sent",
        description: "If an account exists with this email, you will receive a password reset link.",
      });
      
      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Update password function (used by reset password page)
  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      });
      
      return { success: true };
    } catch (error) {
      console.error("Password update error:", error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Creating the context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    deleteAccount,
    forgotPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
