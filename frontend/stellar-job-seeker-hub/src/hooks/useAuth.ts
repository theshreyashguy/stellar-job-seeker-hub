// src/hooks/useAuth.tsx
import { useState } from "react";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import * as api from "@/lib/api";

export const useAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(
    !!localStorage.getItem("auth_token")
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Traditional email/password login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token } = await api.login(email, password);
      localStorage.setItem("auth_token", token);
      setIsSignedIn(true);
      setError(null);
      navigate("/");
    } catch (err) {
      setError("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Traditional registration
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token } = await api.register(name, email, password);
      localStorage.setItem("auth_token", token);
      setIsSignedIn(true);
      setError(null);
      navigate("/");
    } catch (err) {
      setError("Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google one‑tap / pop‑up login (implicit flow for ID‑token)
  const googleLogin = useGoogleLogin({
    flow: "implicit", // ← request the ID‑token credential
    onSuccess: async (resp) => {
      setIsLoading(true);
      try {
        // resp.credential is the JWT (ey…)
        const idToken = resp.credential;
        const { token } = await api.loginWithGoogle(idToken);
        localStorage.setItem("auth_token", token);
        setIsSignedIn(true);
        setError(null);
        navigate("/");
      } catch (err) {
        setError("Failed to login with Google. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError("Google Sign‑In failed. Please try again.");
    },
  });

  // Exposed functions
  const signInWithGoogle = () => {
    setError(null);
    googleLogin();
  };

  const signOut = () => {
    googleLogout();
    localStorage.removeItem("auth_token");
    setIsSignedIn(false);
    navigate("/login");
  };

  return {
    isSignedIn,
    isLoading,
    error,
    login,
    register,
    signInWithGoogle,
    signOut,
  };
};
