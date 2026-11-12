import { useAuth } from "@/context/AuthContext";
import * as AppleAuthentication from "expo-apple-authentication";
import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

const isExpoGo = Constants.appOwnership === "expo";

export type AppleSignInControls = {
  signIn: () => Promise<void>;
  error: string;
  clearError: () => void;
  isLoading: boolean;
  /** False on Android, on simulators without an Apple ID, and in Expo Go. */
  isAvailable: boolean;
};

/**
 * Sign in with Apple.
 *
 * Availability is asked of the OS rather than assumed from the platform:
 * Apple's own API answers for the device, which also covers an iOS version
 * too old for it. The button is hidden when unavailable, because an Apple
 * button that cannot work is worse than no Apple button.
 */
export function useAppleSignIn(onSuccess?: () => void): AppleSignInControls {
  const { signInWithApple } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (Platform.OS !== "ios") {
      return;
    }
    void AppleAuthentication.isAvailableAsync()
      .then((available) => {
        if (!cancelled) {
          setIsAvailable(available);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAvailable(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async () => {
    setError("");

    if (isExpoGo) {
      setError(
        "Apple sign-in needs a development or production build. Expo Go can't complete this flow.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        setError("Apple didn't return a sign-in token. Please try again.");
        return;
      }

      // The name comes back only on the first authorization for this app, so
      // it is assembled here and sent once; later sign-ins carry no name and
      // rely on what the account already holds.
      const fullName = [
        credential.fullName?.givenName,
        credential.fullName?.familyName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      const result = await signInWithApple(credential.identityToken, fullName || null);
      if (result.success) {
        onSuccess?.();
        return;
      }
      setError(result.fieldErrors?.general ?? "We couldn't sign you in with Apple.");
    } catch (caught) {
      // Dismissing the sheet is a decision, not a failure — say nothing.
      if ((caught as { code?: string })?.code === "ERR_REQUEST_CANCELED") {
        return;
      }
      setError(
        caught instanceof Error ? caught.message : "We couldn't sign you in with Apple.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, signInWithApple]);

  return {
    signIn,
    error,
    clearError: () => setError(""),
    isLoading,
    isAvailable,
  };
}
