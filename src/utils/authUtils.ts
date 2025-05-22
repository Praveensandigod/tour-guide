
import { User } from '@/types';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Helper function to convert Supabase user to our app's User format
export const formatUser = (user: SupabaseUser | null, profileData: any = null): User | null => {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email || '',
    name: profileData?.name || user.user_metadata?.name || '',
    profileImage: profileData?.profile_image || user.user_metadata?.avatar_url || '',
    createdAt: profileData?.created_at || user.created_at || new Date().toISOString()
  };
};
