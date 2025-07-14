import { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';

// Load credentials from the credentials.json file
const CLIENT_ID = '851068951455-4u7jf9lpg9a646tqe3uffdmouk1cc40e.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';

export const useGoogleAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGapi = async () => {
      try {
        console.log('Initializing Google API...');
        
        // Load and initialize the API
        await new Promise<void>((resolve, reject) => {
          gapi.load('auth2', {
            callback: () => {
              console.log('Auth2 loaded successfully');
              resolve();
            },
            onerror: () => {
              console.error('Failed to load auth2');
              reject(new Error('Failed to load auth2'));
            }
          });
        });

        // Initialize auth2
        const authInstance = await gapi.auth2.init({
          client_id: CLIENT_ID,
          scope: SCOPES
        });

        console.log('Auth2 initialized successfully');
        
        // Check if user is already signed in
        setIsSignedIn(authInstance.isSignedIn.get());
        
        // Listen for sign-in state changes
        authInstance.isSignedIn.listen((signedIn: boolean) => {
          console.log('Sign-in state changed:', signedIn);
          setIsSignedIn(signedIn);
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing Google API:', error);
        setError('Failed to initialize Google authentication');
        setIsLoading(false);
      }
    };

    // Wait for the script to load
    if (typeof gapi !== 'undefined') {
      initializeGapi();
    } else {
      const script = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
      if (script) {
        script.addEventListener('load', initializeGapi);
      } else {
        setError('Google API script not found');
        setIsLoading(false);
      }
    }
  }, []);

  const signIn = async () => {
    try {
      console.log('Attempting to sign in...');
      const authInstance = gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn({
        scope: SCOPES
      });
      
      console.log('Sign in successful:', user.isSignedIn());
      setIsSignedIn(true);
      setError(null);
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to sign in. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      console.log('Sign out successful');
      setIsSignedIn(false);
      setError(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  return {
    isSignedIn,
    isLoading,
    error,
    signIn,
    signOut,
  };
};