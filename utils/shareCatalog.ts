import {
  APP_DOWNLOAD_URL,
  APP_LINK_SCHEME,
  SHARE_HASHTAGS,
  SHARE_WEB_BASE_URL,
} from "@/constants/share";
import { resolveApiMediaUrl } from "@/utils/media";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Linking from "expo-linking";
import { Platform, Share } from "react-native";
import type { ImageSourcePropType } from "react-native";

export type ProductSharePayload = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  category?: string;
  subcategory?: string;
  rating?: number;
  reviewsLabel?: string;
  discount?: string;
  storeName?: string;
  imageUrl?: string | null;
  imageUrls?: string[];
};

export type ProductShareContent = {
  title: string;
  message: string;
  shortMessage: string;
  deepLink: string;
  webLink: string;
  shareLink: string;
  imageUri: string | null;
};

function formatPrice(value: number) {
  return `₵${value.toFixed(2)}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildProductDeepLink(productId: string) {
  return Linking.createURL(`/screens/${productId}`, {
    scheme: APP_LINK_SCHEME,
    queryParams: { id: productId },
  });
}

export function buildProductWebLink(productId: string, title?: string) {
  if (SHARE_WEB_BASE_URL) {
    const slug = title ? slugify(title) : "item";
    return `${SHARE_WEB_BASE_URL}/p/${productId}/${slug}`;
  }

  return buildProductDeepLink(productId);
}

export function buildProductShareContent(
  product: ProductSharePayload,
): ProductShareContent {
  const deepLink = buildProductDeepLink(product.id);
  const webLink = buildProductWebLink(product.id, product.title);
  const shareLink = SHARE_WEB_BASE_URL ? webLink : deepLink;
  const imageUri = resolvePrimaryShareImageUri(product);

  const priceLine =
    product.oldPrice && product.oldPrice > product.price
      ? `${formatPrice(product.price)} (was ${formatPrice(product.oldPrice)})`
      : formatPrice(product.price);

  const metaParts = [
    product.category,
    product.subcategory,
    priceLine,
  ].filter(Boolean);

  const ratingLine =
    product.rating && product.rating > 0
      ? `⭐ ${product.rating.toFixed(1)}${
          product.reviewsLabel ? ` · ${product.reviewsLabel}` : ""
        }`
      : product.reviewsLabel ?? null;

  const lines = [
    "✨ Found this on ODOS",
    "",
    product.title,
    metaParts.join(" · "),
    ratingLine,
    product.storeName ? `🏪 ${product.storeName}` : null,
    product.discount ? `🏷️ ${product.discount}` : null,
    imageUri ? `🖼️ ${imageUri}` : null,
    "",
    "Open in ODOS 👇",
    shareLink,
    "",
    `Get the app: ${APP_DOWNLOAD_URL}`,
    SHARE_HASHTAGS,
  ].filter((line): line is string => Boolean(line));

  const message = lines.join("\n");
  const shortMessage = [
    `✨ ${product.title} on ODOS`,
    metaParts.slice(0, 2).join(" · "),
    shareLink,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    title: product.title,
    message,
    shortMessage,
    deepLink,
    webLink,
    shareLink,
    imageUri,
  };
}

function resolvePrimaryShareImageUri(product: ProductSharePayload): string | null {
  const candidates = [product.imageUrl, ...(product.imageUrls ?? [])];

  for (const candidate of candidates) {
    const resolved = resolveApiMediaUrl(candidate);
    if (resolved?.startsWith("http")) {
      return resolved;
    }
  }

  return null;
}

async function cacheShareImage(remoteUri: string, productId: string) {
  const extension = remoteUri.toLowerCase().includes(".png") ? "png" : "jpg";
  const target = `${FileSystem.cacheDirectory}odos-share-${productId}.${extension}`;

  try {
    const info = await FileSystem.getInfoAsync(target);
    if (info.exists) {
      await FileSystem.deleteAsync(target, { idempotent: true });
    }
  } catch {
    // ignore cleanup errors
  }

  const downloaded = await FileSystem.downloadAsync(remoteUri, target);
  return downloaded.uri;
}

export async function copyProductShareLink(product: ProductSharePayload) {
  const content = buildProductShareContent(product);
  await Clipboard.setStringAsync(content.shareLink);
  return content.shareLink;
}

export async function shareProduct(product: ProductSharePayload) {
  const content = buildProductShareContent(product);
  let localImageUri: string | null = null;

  if (Platform.OS === "ios" && content.imageUri) {
    try {
      localImageUri = await cacheShareImage(content.imageUri, product.id);
    } catch {
      localImageUri = null;
    }
  }

  if (Platform.OS === "web") {
    await Share.share({
      title: content.title,
      message: content.message,
    });
    return { shared: true as const };
  }

  // iOS: attach cached product image + caption when available.
  if (Platform.OS === "ios" && localImageUri) {
    const result = await Share.share({
      title: `${product.title} · ODOS`,
      message: content.message,
      url: localImageUri,
    });

    return {
      shared: result.action === Share.sharedAction,
      cancelled: result.action === Share.dismissedAction,
    };
  }

  const result = await Share.share({
    title: `${product.title} · ODOS`,
    message: content.message,
    url: Platform.OS === "ios" ? content.shareLink : undefined,
  });

  return {
    shared: result.action === Share.sharedAction,
    cancelled: result.action === Share.dismissedAction,
  };
}

export function resolveSharePreviewImage(
  product: ProductSharePayload,
  fallback?: ImageSourcePropType,
): ImageSourcePropType | undefined {
  const uri = resolvePrimaryShareImageUri(product);
  if (uri) {
    return { uri };
  }
  return fallback;
}
