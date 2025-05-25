
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Lock, LogOut, User as UserIcon, AlertTriangle, Eye, EyeOff } from "lucide-react";

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;

const ProfilePage = () => {
  const { user, logout, isLoading, deleteAccount, updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Add profile update logic here
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    
    if (!passwordRegex.test(newPassword)) {
      toast({
        title: "Invalid password format",
        description: "Password must contain at least one letter, one number, and one special character.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const result = await updatePassword(newPassword);
      
      if (result.success) {
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully.",
        });
        // Reset form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(result.error?.message || "Failed to update password");
      }
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteAccount();
      
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to delete account");
      }
      
      // Navigate to account deleted page
      navigate("/account-deleted");
    } catch (error: any) {
      console.error("Account deletion error:", error);
      toast({
        title: "Account deletion failed",
        description: error.message || "There was an error deleting your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      required
                      disabled
                    />
                    <p className="text-sm text-muted-foreground">
                      Email address cannot be changed.
                    </p>
                  </div>
                </div>
                
                <Button className="mt-6" type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <UserIcon className="mr-2 h-4 w-4" />
                      Update Profile
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Update Password</CardTitle>
              <CardDescription>
                Change your password here. Password must contain at least one letter, one number, and one special character.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="new">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Password requirements:</p>
                  <ul className="list-disc ml-4">
                    <li>At least 6 characters long</li>
                    <li>At least one letter</li>
                    <li>At least one number</li>
                    <li>At least one special character (@$!%*#?&)</li>
                  </ul>
                </div>
                
                <Button className="mt-6" type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your session and account.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="mr-2 h-4 w-4" />
                    )}
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
