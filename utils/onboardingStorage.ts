import * as SecureStore from "expo-secure-store";

export const ONBOARDING_COMPLETE_KEY = "odos_onboarding_complete";

export async function hasCompletedOnboarding() {
  try {
    const value = await SecureStore.getItemAsync(ONBOARDING_COMPLETE_KEY);
    return value === "1";
  } catch {
    return false;
  }
}

export async function markOnboardingComplete() {
  await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, "1");
}
