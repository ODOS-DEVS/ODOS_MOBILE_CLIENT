import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import * as SecureStore from "expo-secure-store";

export const BEHAVIOR_EVENT_TYPES = {
  PRODUCT_VIEW: "product_view",
  PRODUCT_CLICK: "product_click",
  SEARCH_QUERY: "search_query",
  SEARCH_RESULT_CLICK: "search_result_click",
  ADD_TO_CART: "add_to_cart",
  REMOVE_FROM_CART: "remove_from_cart",
  ADD_TO_WISHLIST: "add_to_wishlist",
  REMOVE_FROM_WISHLIST: "remove_from_wishlist",
} as const;

export type BehaviorEventType =
  (typeof BEHAVIOR_EVENT_TYPES)[keyof typeof BEHAVIOR_EVENT_TYPES];

export type BehaviorEventInput = {
  eventType: BehaviorEventType;
  productId?: string | null;
  storeId?: string | null;
  category?: string | null;
  searchQuery?: string | null;
  sourceScreen?: string | null;
  metadata?: Record<string, unknown> | null;
};

type QueuedEvent = BehaviorEventInput & {
  occurredAt: string;
};

const FLUSH_INTERVAL_MS = 15_000;
const MAX_BATCH_SIZE = 40;
const MAX_QUEUE_SIZE = 200;
const PRODUCT_VIEW_DEDUPE_MS = 30_000;

let sessionId = createSessionId();
let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isFlushing = false;
let trackingEnabled = true;
let accessTokenProvider: (() => Promise<string | null>) | null = null;
const recentProductViews = new Map<string, number>();

function createSessionId() {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function resetSessionId() {
  sessionId = createSessionId();
  recentProductViews.clear();
}

async function getAccessToken() {
  if (accessTokenProvider) {
    const token = await accessTokenProvider();
    if (token) {
      return token;
    }
  }
  return SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY);
}

function shouldSkipProductView(productId: string) {
  const lastSeen = recentProductViews.get(productId);
  const now = Date.now();
  if (lastSeen && now - lastSeen < PRODUCT_VIEW_DEDUPE_MS) {
    return true;
  }
  recentProductViews.set(productId, now);
  return false;
}

function scheduleFlush() {
  if (flushTimer) {
    return;
  }
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushBehaviorEvents();
  }, FLUSH_INTERVAL_MS);
}

function mapEventForApi(event: QueuedEvent) {
  return {
    event_type: event.eventType,
    product_id: event.productId ?? null,
    store_id: event.storeId ?? null,
    category: event.category ?? null,
    search_query: event.searchQuery ?? null,
    source_screen: event.sourceScreen ?? null,
    metadata: event.metadata ?? null,
    occurred_at: event.occurredAt,
  };
}

export function configureBehaviorTracking(options: {
  enabled: boolean;
  getAccessToken?: () => Promise<string | null>;
}) {
  trackingEnabled = options.enabled;
  accessTokenProvider = options.getAccessToken ?? null;

  if (!trackingEnabled) {
    queue = [];
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
  }
}

export function trackBehaviorEvent(input: BehaviorEventInput) {
  if (!trackingEnabled) {
    return;
  }

  if (
    input.eventType === BEHAVIOR_EVENT_TYPES.PRODUCT_VIEW &&
    input.productId &&
    shouldSkipProductView(input.productId)
  ) {
    return;
  }

  queue.push({
    ...input,
    occurredAt: new Date().toISOString(),
  });

  if (queue.length > MAX_QUEUE_SIZE) {
    queue = queue.slice(queue.length - MAX_QUEUE_SIZE);
  }

  if (queue.length >= MAX_BATCH_SIZE) {
    void flushBehaviorEvents();
    return;
  }

  scheduleFlush();
}

export async function flushBehaviorEvents(force = false) {
  if (!trackingEnabled || queue.length === 0 || isFlushing) {
    return;
  }

  const token = await getAccessToken();
  if (!token) {
    if (force) {
      queue = [];
    }
    return;
  }

  isFlushing = true;
  const batch = queue.splice(0, MAX_BATCH_SIZE);

  try {
    const response = await fetch(`${API_BASE_URL}/behavior/events/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        session_id: sessionId,
        events: batch.map(mapEventForApi),
      }),
    });

    if (!response.ok) {
      queue = [...batch, ...queue].slice(-MAX_QUEUE_SIZE);
    }
  } catch {
    queue = [...batch, ...queue].slice(-MAX_QUEUE_SIZE);
  } finally {
    isFlushing = false;
    if (queue.length > 0) {
      scheduleFlush();
    }
  }
}

export function beginBehaviorSession() {
  resetSessionId();
}
