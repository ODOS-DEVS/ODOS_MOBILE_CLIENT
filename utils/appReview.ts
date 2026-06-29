import * as SecureStore from "expo-secure-store";
import * as StoreReview from "expo-store-review";
import { Linking, Platform } from "react-native";

const STORAGE_PREFIX = "odos_app_review_";
const LAST_PROMPT_AT_KEY = `${STORAGE_PREFIX}last_prompt_at`;
const DECLINED_AT_KEY = `${STORAGE_PREFIX}declined_at`;
const COMPLETED_KEY = `${STORAGE_PREFIX}completed`;
const PROMPTED_ORDER_IDS_KEY = `${STORAGE_PREFIX}prompted_order_ids`;

const MIN_DAYS_BETWEEN_PROMPTS = 90;
const MIN_DAYS_AFTER_DECLINE = 120;
const MAX_STORED_ORDER_IDS = 40;

type ReviewPromptSource = "manual" | "delivered_order";

function daysBetween(earlierMs: number, laterMs: number) {
  return (laterMs - earlierMs) / (1000 * 60 * 60 * 24);
}

async function readTimestamp(key: string) {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

async function writeTimestamp(key: string, value: number) {
  await SecureStore.setItemAsync(key, String(value));
}

async function readPromptedOrderIds() {
  const raw = await SecureStore.getItemAsync(PROMPTED_ORDER_IDS_KEY);
  if (!raw) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

async function rememberPromptedOrderId(orderId: string) {
  const existing = await readPromptedOrderIds();
  if (existing.includes(orderId)) {
    return;
  }

  const next = [orderId, ...existing].slice(0, MAX_STORED_ORDER_IDS);
  await SecureStore.setItemAsync(PROMPTED_ORDER_IDS_KEY, JSON.stringify(next));
}

export async function isNativeAppReviewAvailable() {
  return StoreReview.isAvailableAsync();
}

export async function openAppStoreListing() {
  const storeUrl = StoreReview.storeUrl();
  if (storeUrl) {
    await Linking.openURL(storeUrl);
    return true;
  }

  if (Platform.OS === "ios") {
    return false;
  }

  await Linking.openURL(
    "https://play.google.com/store/apps/details?id=com.paul.odos",
  );
  return true;
}

export async function requestNativeAppReview() {
  if (!(await isNativeAppReviewAvailable())) {
    return openAppStoreListing();
  }

  await StoreReview.requestReview();
  await writeTimestamp(LAST_PROMPT_AT_KEY, Date.now());
  return true;
}

export async function markAppReviewCompleted() {
  await SecureStore.setItemAsync(COMPLETED_KEY, "1");
  await writeTimestamp(LAST_PROMPT_AT_KEY, Date.now());
}

export async function markAppReviewDeclined() {
  await writeTimestamp(DECLINED_AT_KEY, Date.now());
  await writeTimestamp(LAST_PROMPT_AT_KEY, Date.now());
}

export async function shouldShowDeliveredOrderReviewPrompt(orderId: string) {
  const completed = await SecureStore.getItemAsync(COMPLETED_KEY);
  if (completed === "1") {
    return false;
  }

  const promptedOrderIds = await readPromptedOrderIds();
  if (promptedOrderIds.includes(orderId)) {
    return false;
  }

  const now = Date.now();
  const lastPromptAt = await readTimestamp(LAST_PROMPT_AT_KEY);
  if (lastPromptAt && daysBetween(lastPromptAt, now) < MIN_DAYS_BETWEEN_PROMPTS) {
    return false;
  }

  const declinedAt = await readTimestamp(DECLINED_AT_KEY);
  if (declinedAt && daysBetween(declinedAt, now) < MIN_DAYS_AFTER_DECLINE) {
    return false;
  }

  return true;
}

export async function recordDeliveredOrderPrompt(orderId: string) {
  await rememberPromptedOrderId(orderId);
  await writeTimestamp(LAST_PROMPT_AT_KEY, Date.now());
}

export async function submitAppReview(source: ReviewPromptSource, orderId?: string) {
  await requestNativeAppReview();
  await markAppReviewCompleted();
  if (source === "delivered_order" && orderId) {
    await rememberPromptedOrderId(orderId);
  }
}
