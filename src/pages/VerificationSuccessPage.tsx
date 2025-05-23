
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const VerificationSuccessPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Show a toast notification
    toast({
      title: "Email verified successfully",
      description: "Your email has been verified. You can now log in to your account.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Email Verified Successfully</h1>
          <p className="mb-6 text-muted-foreground">
            Your email has been successfully verified. You can now log in to your account and enjoy all features.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerificationSuccessPage;
