import { Image } from "expo-image";

type ImageLike = {
  id?: string;
  imageUrl?: string | null;
  image?: { uri?: string } | number | null;
};

function extractUri(item: ImageLike): string | null {
  if (typeof item.imageUrl === "string" && item.imageUrl.trim()) {
    return item.imageUrl.trim();
  }
  if (item.image && typeof item.image === "object" && typeof item.image.uri === "string") {
    const uri = item.image.uri.trim();
    return uri || null;
  }
  return null;
}

/** Stable key for the first visible product batch so the gate re-arms on data changes. */
export function buildImageReadyResetKey(items: ImageLike[], limit = 12): string {
  return items
    .slice(0, limit)
    .map((item) => item.id || extractUri(item) || "")
    .filter(Boolean)
    .join("|");
}

/** Warm the disk/memory cache for the first batch of product images. */
export function prefetchCommerceImages(items: ImageLike[], limit = 12): void {
  const uris = items
    .slice(0, limit)
    .map(extractUri)
    .filter((uri): uri is string => Boolean(uri));

  if (uris.length === 0) {
    return;
  }

  void Image.prefetch(uris);
}
