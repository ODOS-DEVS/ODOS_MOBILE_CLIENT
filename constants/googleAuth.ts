import { Platform } from "react-native";

export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? "";

export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ?? "";

export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() ?? "";

/** Resolved IDs passed to expo-auth-session (platform IDs fall back to web). */
export function getGoogleAuthClientIds() {
  const webClientId = GOOGLE_WEB_CLIENT_ID;
  const iosClientId = GOOGLE_IOS_CLIENT_ID || webClientId;
  const androidClientId = GOOGLE_ANDROID_CLIENT_ID || webClientId;

  return {
    webClientId: webClientId || undefined,
    iosClientId: iosClientId || undefined,
    androidClientId: androidClientId || undefined,
  };
}

/** True when this platform has enough client IDs to initialize the Google auth hook. */
export function canUseGoogleAuthRequest() {
  const { webClientId, iosClientId, androidClientId } = getGoogleAuthClientIds();

  if (Platform.OS === "ios") {
    return Boolean(iosClientId);
  }

  if (Platform.OS === "android") {
    return Boolean(androidClientId);
  }

  return Boolean(webClientId);
}

export function isGoogleAuthConfigured() {
  return canUseGoogleAuthRequest();
}
