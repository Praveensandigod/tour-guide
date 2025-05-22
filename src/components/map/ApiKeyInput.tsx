
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { getGoogleMapsApiKey, setGoogleMapsApiKey } from '@/config/apiConfig';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeyInput = ({ onApiKeySet }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = getGoogleMapsApiKey();
    if (storedApiKey) {
      setSavedKey(storedApiKey);
      onApiKeySet(storedApiKey);
    }
  }, [onApiKeySet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('API key cannot be empty');
      return;
    }
    
    try {
      setGoogleMapsApiKey(apiKey);
      setSavedKey(apiKey);
      onApiKeySet(apiKey);
      setError(null);
      setApiKey('');
    } catch (err) {
      setError('Failed to save API key');
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('googleMapsApiKey');
    setSavedKey(null);
    onApiKeySet('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Google Maps API Key</CardTitle>
        <CardDescription>
          You need to provide a Google Maps API key to use the map features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {savedKey ? (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4 mr-2" />
              <AlertDescription>API key is set and ready to use</AlertDescription>
            </Alert>
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearApiKey}>
                Clear API Key
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
                Enter your Google Maps API Key
              </label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google Maps API Key"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your API key should have Maps JavaScript API, Directions API, Places API, and Geocoding API enabled.
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save API Key</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;
