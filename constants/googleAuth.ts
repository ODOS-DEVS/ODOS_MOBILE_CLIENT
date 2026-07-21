import { Platform } from "react-native";

export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? "";

export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ?? "";

export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() ?? "";

/**
 * Platform client IDs for expo-auth-session.
 *
 * Important: never fall back iOS/Android to the Web client ID. Google rejects
 * custom-scheme redirects against Web clients with Error 400: invalid_request
 * ("doesn't comply with Google's OAuth 2.0 policy").
 */
export function getGoogleAuthClientIds() {
  return {
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
  };
}

/** True when this platform has a real native (or web) client ID configured. */
export function canUseGoogleAuthRequest() {
  const { webClientId, iosClientId, androidClientId } = getGoogleAuthClientIds();

  if (Platform.OS === "ios") {
    return Boolean(iosClientId);
  }

  if (Platform.OS === "android") {
    // Prefer a dedicated Android client; package-scheme redirect needs one.
    return Boolean(androidClientId);
  }

  return Boolean(webClientId);
}

export function isGoogleAuthConfigured() {
  return canUseGoogleAuthRequest();
}

export function getGoogleAuthConfigError(): string | null {
  if (Platform.OS === "ios" && !GOOGLE_IOS_CLIENT_ID) {
    return "Google Sign-In is missing the iOS client ID in this build. Rebuild with EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID set.";
  }

  if (Platform.OS === "android" && !GOOGLE_ANDROID_CLIENT_ID) {
    return "Google Sign-In is missing the Android client ID in this build. Add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID and rebuild.";
  }

  if (Platform.OS === "web" && !GOOGLE_WEB_CLIENT_ID) {
    return "Google Sign-In is missing the Web client ID.";
  }

  return null;
}

/** iOS reversed client ID URL scheme required for Google OAuth redirect. */
export function getGoogleIosUrlScheme(iosClientId?: string) {
  const clientId = (iosClientId ?? GOOGLE_IOS_CLIENT_ID).trim();
  if (!clientId.endsWith(".apps.googleusercontent.com")) {
    return null;
  }

  const prefix = clientId.replace(/\.apps\.googleusercontent\.com$/, "");
  return prefix ? `com.googleusercontent.apps.${prefix}` : null;
}
