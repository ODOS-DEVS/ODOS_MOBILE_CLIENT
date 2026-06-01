import { resolveApiMediaUrl, resolveImageSource } from "@/utils/media";
import type { ImageSourcePropType } from "react-native";

const GENERIC_ACTIVITY_IMAGE_KEYS = new Set([
  "bag",
  "handbag",
  "odos",
  "placeholder",
  "market",
]);

export function resolveActivityImageSource(payload: {
  image_url?: string | null;
  image_key?: string | null;
}): ImageSourcePropType | undefined {
  const imageUrl = resolveApiMediaUrl(payload.image_url);
  if (imageUrl) {
    return { uri: imageUrl };
  }

  const imageKey = payload.image_key?.trim();
  if (!imageKey) {
    return undefined;
  }

  const normalizedKey = imageKey.toLowerCase();
  if (GENERIC_ACTIVITY_IMAGE_KEYS.has(normalizedKey)) {
    return undefined;
  }

  const resolved = resolveImageSource(null, imageKey);
  if (
    typeof resolved === "number" &&
    normalizedKey === "bag"
  ) {
    return undefined;
  }

  return resolved;
}

export function activityKindUsesProductImage(kind?: string) {
  return (
    kind === "order_placed" ||
    kind === "order_delivered" ||
    kind === "order_cancelled" ||
    kind === "return_requested" ||
    kind === "wallet_credit" ||
    kind === "wallet_reversal"
  );
}
