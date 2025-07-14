import { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';

const CLIENT_ID = '851068951455-4u7jf9lpg9a646tqe3uffdmouk1cc40e.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBvqVYiTBQKvJ8JfGtF7h9K6BdC8PzP5Wk'; // You'll need to add this
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';

export const useGoogleAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeGapi = async () => {
      try {
        await gapi.load('auth2', async () => {
          await gapi.auth2.init({
            client_id: CLIENT_ID,
          });
          
          const authInstance = gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error initializing Google API:', error);
        setIsLoading(false);
      }
    };

    initializeGapi();
  }, []);

  const signIn = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      setIsSignedIn(true);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      setIsSignedIn(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    isSignedIn,
    isLoading,
    signIn,
    signOut,
  };
};