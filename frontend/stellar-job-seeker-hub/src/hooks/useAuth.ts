import { useState, useEffect } from "react";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import * as api from "@/lib/api";

export const useAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(
    !!localStorage.getItem("auth_token")
  );
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (isSignedIn) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }
    };

    fetchUser();
  }, [isSignedIn]);

  // Traditional email/password login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token } = await api.login(email, password);
      localStorage.setItem("auth_token", token);
      setIsSignedIn(true);
      setError(null);
      navigate("/", { replace: true });
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
      navigate("/", { replace: true });
    } catch (err) {
      setError("Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google one‑tap / pop‑up login (implicit flow for ID‑token)
  const googleLogin = useGoogleLogin({
    flow: "implicit", // keep the implicit flow
    scope: "openid email profile", // ← request an ID‑token (JWT)
    onSuccess: async (resp) => {
      console.log("Google response:", resp);
      const idToken = resp.credential;
      if (!idToken) {
        setError("No ID‑token returned by Google.");
        return;
      }
      console.log("Logging in with Google token:", idToken);
      setIsLoading(true);
      try {
        const { token } = await api.loginWithGoogle(idToken);
        localStorage.setItem("auth_token", token);
        setIsSignedIn(true);
        setError(null);
        navigate("/", { replace: true });
      } catch {
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
    setUser(null);
    navigate("/auth");
  };

  return {
    isSignedIn,
    user,
    isLoading,
    error,
    login,
    register,
    signInWithGoogle,
    signOut,
  };
};
