import { router } from "expo-router";
import { Linking } from "react-native";

export function navigateFromPromoLink(link?: string | null, fallback?: () => void) {
  const trimmed = link?.trim();
  if (!trimmed) {
    fallback?.();
    return;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    void Linking.openURL(trimmed);
    return;
  }

  if (trimmed.startsWith("/")) {
    router.push(trimmed as never);
    return;
  }

  router.push(`../screens/${trimmed}` as never);
}
