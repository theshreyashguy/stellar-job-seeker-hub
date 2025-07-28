import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useToast } from "@/hooks/use-toast";

export const useGoogleAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("google_access_token");
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const signIn = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      const token = tokenResponse.access_token;
      setAccessToken(token);
      localStorage.setItem("google_access_token", token);
      toast({
        title: "Signed In",
        description: "Successfully signed in with Google.",
      });
    },
    onError: (errorResponse) => {
      setError(`Sign-in failed: ${errorResponse.error_description}`);
      toast({
        title: "Sign-in Failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    },
    scope:
      "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
  });

  const signOut = () => {
    setAccessToken(null);
    localStorage.removeItem("google_access_token");
    toast({
      title: "Signed Out",
      description: "Successfully signed out from Google.",
    });
  };

  return {
    isSignedIn: !!accessToken,
    isLoading,
    error,
    signIn: () => signIn(),
    signOut,
    accessToken,
  };
};