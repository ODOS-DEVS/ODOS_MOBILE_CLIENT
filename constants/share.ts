/** Deep link scheme from app.json */
export const APP_LINK_SCHEME = "odosmobileexpo";

/**
 * Public web base for share links (e.g. https://odos.app).
 * When set, shared links use /p/{productId} for richer link previews in chat apps.
 */
export const SHARE_WEB_BASE_URL = (
  process.env.EXPO_PUBLIC_SHARE_WEB_BASE_URL ?? ""
).replace(/\/$/, "");

/** Marketing / store listing page shown when someone opens a link without the app */
export const APP_DOWNLOAD_URL =
  process.env.EXPO_PUBLIC_APP_DOWNLOAD_URL ?? "https://odos.app";

export const SHARE_HASHTAGS = "#ODOS #ShopLocal #Ghana";
