import { getGoogleAuthClientIds } from "@/constants/googleAuth";
import { useAuth } from "@/context/AuthContext";
import type { GoogleSignInControls } from "@/hooks/useGoogleSignIn";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { resolveGoogleProfilePicture } from "@/utils/googleProfile";

WebBrowser.maybeCompleteAuthSession();

const isExpoGo = Constants.appOwnership === "expo";

export function useGoogleSignInOAuth(): GoogleSignInControls {
  const { signInWithGoogle, isSigningInWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [isPrompting, setIsPrompting] = useState(false);
  const handledResponseRef = useRef<string | null>(null);
  const clientIds = getGoogleAuthClientIds();

  const redirectUri = makeRedirectUri({
    scheme: "odosmobileexpo",
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: clientIds.webClientId,
    iosClientId: clientIds.iosClientId,
    androidClientId: clientIds.androidClientId,
    scopes: ["openid", "profile", "email"],
    redirectUri,
  });

  useEffect(() => {
    if (response?.type !== "success") {
      if (response?.type === "error") {
        setError("Google sign-in was cancelled or failed. Please try again.");
      }
      return;
    }

    const responseKey = JSON.stringify(response.params);
    if (handledResponseRef.current === responseKey) {
      return;
    }
    handledResponseRef.current = responseKey;

    const idToken =
      response.params.id_token ??
      response.authentication?.idToken ??
      null;

    if (!idToken) {
      setError("We couldn't get a secure token from Google. Try again.");
      return;
    }

    void (async () => {
      const pictureUrl = await resolveGoogleProfilePicture(
        idToken,
        response.authentication?.accessToken ?? null,
      );
      const result = await signInWithGoogle(idToken, pictureUrl);
      if (!result.success) {
        setError(
          result.fieldErrors?.general ||
            result.message ||
            "Google sign-in failed. Please try again.",
        );
      }
    })();
  }, [response, signInWithGoogle]);

  const signIn = useCallback(async () => {
    setError("");

    if (isExpoGo) {
      setError(
        "Google sign-in needs a development or production build. Expo Go can't complete this flow yet.",
      );
      return;
    }

    if (!request) {
      setError("Google sign-in is still loading. Wait a moment and try again.");
      return;
    }

    setIsPrompting(true);
    try {
      await promptAsync();
    } finally {
      setIsPrompting(false);
    }
  }, [promptAsync, request]);

  return {
    signIn,
    error,
    clearError: () => setError(""),
    isLoading: isSigningInWithGoogle || isPrompting,
    isConfigured: true,
    isExpoGo,
  };
}
