
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const loginWithEmailAndPassword = async (email: string, password: string) => {
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
  }
};

export const registerWithEmailAndPassword = async (email: string, password: string, name: string) => {
  try {    
    console.log("Registering user:", email, name);
    
    // Get the current site URL to use for verification redirects
    const siteUrl = window.location.origin;
    
    // Register the user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name // This will be available in user_metadata
        },
        emailRedirectTo: `${siteUrl}/login` // Redirect to login page after verification
      }
    });
    
    if (error) {
      console.error("Registration error:", error);
      return { error };
    }
    
    console.log("Registration response:", data);
    
    // Check if email confirmation is required
    if (data?.user?.identities && data.user.identities.length === 0) {
      toast({
        title: "Email already registered",
        description: "This email address is already registered. Please log in instead.",
        variant: "destructive"
      });
      
      return { error: { message: "Email already registered", name: "EmailInUse" } as AuthError };
    }
    
    return {};
  } catch (error: any) {
    console.error("Registration exception:", error);
    return { error: error as AuthError };
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });

    return { error: null };
  } catch (error: any) {
    toast({
      title: "Logout failed",
      description: error.message || "Something went wrong",
      variant: "destructive"
    });
    return { error: error as AuthError };
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  try {
    const siteUrl = window.location.origin;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });
    
    if (error) throw error;
    
    toast({
      title: "Password reset link sent",
      description: `If ${email} exists in our database, you will receive a password reset link shortly.`,
    });
    
    return { error: null };
  } catch (error: any) {
    toast({
      title: "Password reset failed",
      description: error.message || "Something went wrong",
      variant: "destructive"
    });
    return { error: error as AuthError };
  }
};

export const resetUserPassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({ 
      password: newPassword 
    });
    
    if (error) {
      toast({
        title: "Password reset failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
      return { error };
    }
    
    toast({
      title: "Password reset successful",
      description: "Your password has been updated. Please log in with your new password.",
    });
    
    return {};
  } catch (error: any) {
    toast({
      title: "Password reset failed",
      description: error.message || "Something went wrong",
      variant: "destructive"
    });
    return { error: error as AuthError };
  }
};

export const deleteUserAccount = async () => {
  try {
    // We'll use a custom RPC function to delete the user's data
    const { error } = await supabase.rpc('delete_current_user');
    
    if (error) throw error;
    
    // Sign out after successful deletion
    await supabase.auth.signOut();
    
    return {};
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return { error: error as AuthError };
  }
};
