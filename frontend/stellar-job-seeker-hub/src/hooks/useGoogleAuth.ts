
import { useState, useEffect, useCallback } from 'react';
import { gapi } from 'gapi-script';
import { useToast } from '@/hooks/use-toast';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';

export const useGoogleAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateSigninStatus = useCallback((isSignedIn: boolean) => {
    setIsSignedIn(isSignedIn);
    setIsLoading(false);
  }, []);

  const initClient = useCallback(async () => {
    try {
      await new Promise<void>((resolve) => gapi.load('client:auth2', resolve));
      await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      });
      
      const authInstance = gapi.auth2.getAuthInstance();
      authInstance.isSignedIn.listen(updateSigninStatus);
      updateSigninStatus(authInstance.isSignedIn.get());

    } catch (e: any) {
      setError(`Error initializing GAPI client: ${e.message}`);
      toast({
        title: 'GAPI Initialization Failed',
        description: 'Could not initialize Google API client. Please check your API key and client ID.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }, [updateSigninStatus, toast]);

  useEffect(() => {
    initClient();
  }, [initClient]);

  const signIn = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.signIn();
        setIsSignedIn(true);
        toast({
          title: 'Signed In',
          description: 'Successfully signed in with Google.',
        });
      } else {
        throw new Error("Google Auth instance is not available.");
      }
    } catch (e: any) {
      setError(`Sign-in failed: ${e.message}`);
      toast({
        title: 'Sign-in Failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.signOut();
        setIsSignedIn(false);
        toast({
          title: 'Signed Out',
          description: 'Successfully signed out from Google.',
        });
      } else {
        throw new Error("Google Auth instance is not available.");
      }
    } catch (e: any) {
      setError(`Sign-out failed: ${e.message}`);
      toast({
        title: 'Sign-out Failed',
        description: 'Could not sign out from Google.',
        variant: 'destructive',
      });
    }
  };

  return { isSignedIn, isLoading, error, signIn, signOut };
};
