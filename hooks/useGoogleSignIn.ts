import Constants from "expo-constants";
import { useCallback, useState } from "react";

const isExpoGo = Constants.appOwnership === "expo";

export type GoogleSignInControls = {
  signIn: () => Promise<void>;
  error: string;
  clearError: () => void;
  isLoading: boolean;
  isConfigured: boolean;
  isExpoGo: boolean;
};

/** Used when Google OAuth client IDs are not configured (e.g. Expo Go without env). */
export function useGoogleSignInFallback(): GoogleSignInControls {
  const [error, setError] = useState("");

  const signIn = useCallback(async () => {
    setError("");

    if (isExpoGo) {
      setError(
        "Google sign-in needs a development or production build. Expo Go can't complete this flow yet.",
      );
      return;
    }

    setError(
      "Google sign-in isn't set up yet. Add your Google client IDs to the app environment.",
    );
  }, []);

  return {
    signIn,
    error,
    clearError: () => setError(""),
    isLoading: false,
    isConfigured: false,
    isExpoGo,
  };
}
