import { useState, useEffect } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';

const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';

export const useGoogleAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Login Success:', tokenResponse);
      setIsSignedIn(true);
      setError(null);
      localStorage.setItem('google_access_token', tokenResponse.access_token);
    },
    onError: () => {
      console.error('Login Failed');
      setError('Failed to sign in. Please try again.');
    },
    scope: SCOPES,
  });

  useEffect(() => {
    const token = localStorage.getItem('google_access_token');
    if (token) {
      setIsSignedIn(true);
    }
    setIsLoading(false);
  }, []);

  const signIn = () => {
    login();
  };

  const signOut = () => {
    googleLogout();
    setIsSignedIn(false);
    localStorage.removeItem('google_access_token');
  };

  return {
    isSignedIn,
    isLoading,
    error,
    signIn,
    signOut,
  };
};
