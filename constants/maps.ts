/** Set EXPO_PUBLIC_ENABLE_GOOGLE_MAPS=true when Google Maps API keys are configured. */
export const isGoogleMapsEnabled =
  process.env.EXPO_PUBLIC_ENABLE_GOOGLE_MAPS === "true";
