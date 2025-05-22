import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast"
import { AuthError, AuthResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, username: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast()

  useEffect(() => {
    const session = supabase.auth.getSession()

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } else {
        setUser(user);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        })
        return { error };
      }

      setUser(data.user);
      navigate('/');
      toast({
        title: "Login Successful",
        description: "You have successfully logged in.",
      })
      return { data };
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      })
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // In the register function, fix the error cast
  const register = async (email: string, password: string, username: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // Validate inputs
      if (!email || !password || !username) {
        toast({
          title: "Registration Failed",
          description: "Please fill in all fields.",
          variant: "destructive"
        });
        return { error: { message: "Please fill in all fields.", name: "MissingFields" } as unknown as AuthError };
      }
      
      // Check password length
      if (password.length < 6) {
        toast({
          title: "Registration Failed",
          description: "Password must be at least 6 characters long.",
          variant: "destructive"
        });
        return { error: { message: "Password must be at least 6 characters long.", name: "PasswordTooShort" } as unknown as AuthError };
      }
      
      // Check if the email is already registered
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);
        
      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Registration Failed",
          description: "Email already registered",
          variant: "destructive"
        });
        
        return { error: { message: "Email already registered", name: "EmailInUse" } as unknown as AuthError };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            email,
          }
        }
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        })
        return { error };
      }

      setUser(data.user);
      navigate('/');
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
      })
      return { data };
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      })
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
      toast({
        title: "Logout Successful",
        description: "You have successfully logged out.",
      })
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(user);
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
