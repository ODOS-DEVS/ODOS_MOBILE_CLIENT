import {
  APP_DOWNLOAD_URL,
  APP_LINK_SCHEME,
  SHARE_HASHTAGS,
  SHARE_WEB_BASE_URL,
} from "@/constants/share";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { Platform, Share } from "react-native";

export type StoreSharePayload = {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  city?: string;
  region?: string;
};

export type StoreShareContent = {
  title: string;
  message: string;
  shareLink: string;
  qrImageUrl: string;
};

export function buildStoreDeepLink(storeId: string) {
  return Linking.createURL(`/screens/stores/${storeId}`, {
    scheme: APP_LINK_SCHEME,
  });
}

export function buildStoreWebLink(store: StoreSharePayload) {
  if (SHARE_WEB_BASE_URL) {
    const slug = store.slug?.trim() || store.id;
    return `${SHARE_WEB_BASE_URL}/stores/${slug}`;
  }

  return buildStoreDeepLink(store.id);
}

export function buildStoreShareContent(store: StoreSharePayload): StoreShareContent {
  const shareLink = buildStoreWebLink(store);
  const location = [store.city, store.region].filter(Boolean).join(", ");
  const lines = [
    "🏪 Shop on ODOS",
    "",
    store.name,
    [store.category, location].filter(Boolean).join(" · "),
    "",
    "Open storefront 👇",
    shareLink,
    "",
    `Get the app: ${APP_DOWNLOAD_URL}`,
    SHARE_HASHTAGS,
  ].filter(Boolean);

  return {
    title: store.name,
    message: lines.join("\n"),
    shareLink,
    qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
      shareLink,
    )}`,
  };
}

export async function copyStoreShareLink(store: StoreSharePayload) {
  const content = buildStoreShareContent(store);
  await Clipboard.setStringAsync(content.shareLink);
  return content.shareLink;
}

export async function shareStore(store: StoreSharePayload) {
  const content = buildStoreShareContent(store);

  if (Platform.OS === "web") {
    await Share.share({
      title: content.title,
      message: content.message,
    });
    return { shared: true as const };
  }

  const result = await Share.share({
    title: `${store.name} · ODOS`,
    message: content.message,
    url: Platform.OS === "ios" ? content.shareLink : undefined,
  });

  return {
    shared: result.action === Share.sharedAction,
    cancelled: result.action === Share.dismissedAction,
  };
}
