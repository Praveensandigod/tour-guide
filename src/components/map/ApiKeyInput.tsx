import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Key } from 'lucide-react';
import { getMapsApiKey, setMapsApiKey } from '@/config/apiConfig';

const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState<string>(getMapsApiKey());
  const { toast } = useToast();

  const handleSaveApiKey = () => {
    setMapsApiKey(apiKey);
    toast({
      title: "API Key Saved",
      description: "Your LocationIQ API key has been saved successfully.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="mr-2 h-4 w-4" />
          LocationIQ API Key
        </CardTitle>
        <CardDescription>
          Enter your LocationIQ API key to enable map functionality.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Input
            id="api-key"
            placeholder="Enter your API key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <Button onClick={handleSaveApiKey}>Save API Key</Button>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;

