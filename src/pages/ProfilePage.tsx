
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User as UserIcon, Camera, Upload, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const { user, logout, isLoading, deleteAccount } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setImageUrl(user.profileImage || '');
    }
  }, [user]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      let profileImageUrl = imageUrl;
      
      // Upload new profile image if selected
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('profiles')
          .upload(`public/${fileName}`, profileImage);
        
        if (uploadError) {
          throw uploadError;
        }
        
        if (data) {
          // Get public URL
          const { data: publicURL } = supabase.storage
            .from('profiles')
            .getPublicUrl(`public/${fileName}`);
          
          profileImageUrl = publicURL.publicUrl;
        }
      }
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          profile_image: profileImageUrl
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });
      
      // Refresh page to show updated profile
      window.location.reload();
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const { error } = await deleteAccount();
      
      if (error) throw error;
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted."
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Deletion failed",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="container max-w-3xl py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border-2">
                {(profileImagePreview || imageUrl) ? (
                  <AvatarImage src={profileImagePreview || imageUrl} alt={name} />
                ) : (
                  <AvatarFallback>
                    <UserIcon className="w-12 h-12" />
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div>
                <Label htmlFor="profileImage" className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted">
                  <Camera className="w-4 h-4" />
                  Change Photo
                </Label>
                <Input 
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </div>
            </div>
            
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={email} 
                disabled 
              />
              <p className="text-sm text-muted-foreground">Email cannot be changed. Please contact support if you need to update your email address.</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </Button>
            
            <Button 
              type="submit" 
              onClick={handleUpdateProfile}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  This action is permanent and cannot be undone. This will delete your account and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;
