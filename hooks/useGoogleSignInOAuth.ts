import {
  getGoogleAuthClientIds,
  getGoogleAuthConfigError,
  getGoogleIosUrlScheme,
} from "@/constants/googleAuth";
import { useAuth } from "@/context/AuthContext";
import type { GoogleSignInControls } from "@/hooks/useGoogleSignIn";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { resolveGoogleProfilePicture } from "@/utils/googleProfile";

WebBrowser.maybeCompleteAuthSession();

const isExpoGo = Constants.appOwnership === "expo";

function mapGoogleOAuthError(params: Record<string, string> | undefined): string {
  const code = (params?.error || "").toLowerCase();
  const description = (params?.error_description || "").replace(/\+/g, " ");

  if (code === "access_denied") {
    return "Google sign-in was cancelled or blocked for this account.";
  }

  if (code === "invalid_request" || /oauth 2\.0 policy|invalid_request/i.test(description)) {
    return "Google blocked this sign-in (invalid OAuth setup). This build needs the correct iOS/Android client ID — not the Web client ID.";
  }

  if (code) {
    return description || `Google sign-in failed (${code}). Please try again.`;
  }

  return "Google sign-in failed. Please try again.";
}

export function useGoogleSignInOAuth(): GoogleSignInControls {
  const { signInWithGoogle, isSigningInWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [isPrompting, setIsPrompting] = useState(false);
  const handledResponseRef = useRef<string | null>(null);
  const clientIds = getGoogleAuthClientIds();
  const configError = getGoogleAuthConfigError();

  // Google iOS clients require the reversed client-ID scheme, not the app scheme.
  // Using odosmobileexpo:// or a Web client ID causes Error 400: invalid_request.
  const redirectUri = useMemo(() => {
    const iosScheme = getGoogleIosUrlScheme(clientIds.iosClientId);
    if (Platform.OS === "ios" && iosScheme) {
      return makeRedirectUri({
        native: `${iosScheme}:/oauthredirect`,
      });
    }

    if (Platform.OS === "android") {
      return makeRedirectUri({
        native: "com.paul.odos:/oauthredirect",
      });
    }

    return makeRedirectUri();
  }, [clientIds.iosClientId]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: clientIds.webClientId,
    iosClientId: clientIds.iosClientId,
    androidClientId: clientIds.androidClientId,
    scopes: ["openid", "profile", "email"],
    redirectUri,
    selectAccount: true,
  });

  useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === "dismiss" || response.type === "cancel") {
      return;
    }

    if (response.type === "error") {
      setError(mapGoogleOAuthError(response.params as Record<string, string>));
      return;
    }

    if (response.type !== "success") {
      return;
    }

    const params = response.params as Record<string, string>;
    if (params.error) {
      setError(mapGoogleOAuthError(params));
      return;
    }

    const responseKey = JSON.stringify(params);
    if (handledResponseRef.current === responseKey) {
      return;
    }
    handledResponseRef.current = responseKey;

    const idToken =
      params.id_token ??
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

    if (configError) {
      setError(configError);
      return;
    }

    if (!request) {
      setError("Google sign-in is still loading. Wait a moment and try again.");
      return;
    }

    setIsPrompting(true);
    try {
      const result = await promptAsync();
      if (result.type === "error") {
        setError(mapGoogleOAuthError(result.params as Record<string, string>));
      }
    } finally {
      setIsPrompting(false);
    }
  }, [configError, promptAsync, request]);

  return {
    signIn,
    error,
    clearError: () => setError(""),
    isLoading: isSigningInWithGoogle || isPrompting,
    isConfigured: !configError,
    isExpoGo,
  };
}
