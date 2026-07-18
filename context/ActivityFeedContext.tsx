import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import { useRealtime } from "@/context/RealtimeContext";
import { resolveActivityImageSource } from "@/utils/activityImages";
import { syncAppBadgeCount } from "@/utils/appBadge";
import * as SecureStore from "expo-secure-store";
import { AppState } from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ActivityRoute =
  | { type: "order"; orderId: string }
  | { type: "vendor_order"; orderId?: string }
  | {
      type: "vendor_chat";
      threadId: string;
      storeId: string;
      storeName?: string;
    }
  | {
      type: "customer_chat";
      threadId: string;
      storeId: string;
      storeName?: string;
    }
  | { type: "vendor_flash_sale" }
  | { type: "vendor_product"; productId?: string }
  | { type: "profile" }
  | { type: "orders" }
  | { type: "vendor_wallet" }
  | { type: "customer_wallet" };

export type ActivityItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  occurredAt: string;
  relativeTime: string;
  icon:
    | "bag-handle-outline"
    | "checkmark-done-outline"
    | "close-circle-outline"
    | "person-outline"
    | "mail-outline"
    | "wallet-outline"
    | "cash-outline"
    | "refresh-circle-outline"
    | "receipt-outline";
  accent: "neutral" | "success" | "warning";
  isRead?: boolean;
  productImage?: any;
  actionLabel?: string;
  route?: ActivityRoute;
};

export type ActivitySection = {
  title: string;
  data: ActivityItem[];
};

type NotificationEventPayload = {
  id: string;
  kind: string;
  title: string;
  body: string;
  icon: ActivityItem["icon"];
  accent: ActivityItem["accent"];
  action_label: string | null;
  route_type: string | null;
  route_target_id: string | null;
  image_key: string | null;
  image_url: string | null;
  created_at: string;
};

type NotificationPagePayload = {
  items: NotificationEventPayload[];
  has_more: boolean;
  total_count: number;
  unread_count: number;
};

type RefreshOptions = {
  silent?: boolean;
  pull?: boolean;
};

const ACTIVITY_PAGE_SIZE = 25;

type ActivityFeedContextValue = {
  sections: ActivitySection[];
  items: ActivityItem[];
  unreadCount: number;
  totalCount: number;
  hasMoreActivity: boolean;
  markAsRead: (keys: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshActivity: (options?: RefreshOptions) => Promise<void>;
  loadMoreActivity: () => Promise<void>;
  pullToRefresh: () => void;
  hasLoadedOnce: boolean;
  isInitialLoading: boolean;
  isPullRefreshing: boolean;
  isLoadingMore: boolean;
  isLoadingActivity: boolean;
};

const ActivityFeedContext = createContext<ActivityFeedContextValue | null>(null);

function formatRelativeTime(value: string) {
  const now = Date.now();
  const then = new Date(value).getTime();
  const diffMs = Math.max(0, now - then);
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function buildSections(items: ActivityItem[]): ActivitySection[] {
  const now = new Date();
  const today: ActivityItem[] = [];
  const thisWeek: ActivityItem[] = [];
  const earlier: ActivityItem[] = [];

  items.forEach((item) => {
    const occurred = new Date(item.occurredAt);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays =
      (startOfToday.getTime() -
        new Date(
          occurred.getFullYear(),
          occurred.getMonth(),
          occurred.getDate(),
        ).getTime()) /
      86400000;

    if (diffDays <= 0) {
      today.push(item);
    } else if (diffDays < 7) {
      thisWeek.push(item);
    } else {
      earlier.push(item);
    }
  });

  return [
    { title: "Today", data: today },
    { title: "This week", data: thisWeek },
    { title: "Earlier", data: earlier },
  ].filter((section) => section.data.length > 0);
}

function parseChatRouteTarget(
  routeTargetId: string | null,
): { storeId: string; threadId: string } | null {
  if (!routeTargetId?.trim()) {
    return null;
  }

  const separatorIndex = routeTargetId.indexOf(":");
  if (separatorIndex > 0 && separatorIndex < routeTargetId.length - 1) {
    return {
      storeId: routeTargetId.slice(0, separatorIndex),
      threadId: routeTargetId.slice(separatorIndex + 1),
    };
  }

  return {
    storeId: "",
    threadId: routeTargetId,
  };
}

function mapRoute(
  routeType: string | null,
  routeTargetId: string | null,
): ActivityRoute | undefined {
  if (routeType === "order" && routeTargetId) {
    return { type: "order", orderId: routeTargetId };
  }
  if (routeType === "profile") {
    return { type: "profile" };
  }
  if (routeType === "orders") {
    return { type: "orders" };
  }
  if (routeType === "vendor_wallet") {
    return { type: "vendor_wallet" };
  }
  if (routeType === "customer_wallet") {
    return { type: "customer_wallet" };
  }
  if (routeType === "vendor_order") {
    return { type: "vendor_order", orderId: routeTargetId ?? undefined };
  }
  if (routeType === "vendor_chat") {
    const chatRoute = parseChatRouteTarget(routeTargetId);
    if (chatRoute) {
      return {
        type: "vendor_chat",
        threadId: chatRoute.threadId,
        storeId: chatRoute.storeId,
      };
    }
  }
  if (routeType === "customer_chat") {
    const chatRoute = parseChatRouteTarget(routeTargetId);
    if (chatRoute) {
      return {
        type: "customer_chat",
        threadId: chatRoute.threadId,
        storeId: chatRoute.storeId,
      };
    }
  }
  return undefined;
}

type OrderPreviewPayload = {
  id: string;
  items?: {
    image_url?: string | null;
    image_key?: string | null;
  }[];
};

async function enrichNotificationsWithOrderImages(
  notifications: NotificationEventPayload[] | null | undefined,
  token: string,
): Promise<NotificationEventPayload[]> {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const orderIds = Array.from(
    new Set(
      safeNotifications
        .filter(
          (item) =>
            item.route_type === "order" &&
            item.route_target_id &&
            !item.image_url?.trim(),
        )
        .map((item) => item.route_target_id as string),
    ),
  );

  if (orderIds.length === 0) {
    return safeNotifications;
  }

  const previewByOrderId = new Map<
    string,
    { image_url?: string | null; image_key?: string | null }
  >();

  await Promise.all(
    orderIds.map(async (orderId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const order = (await response.json()) as OrderPreviewPayload;
        const firstItem = order.items?.[0];
        if (!firstItem) {
          return;
        }

        previewByOrderId.set(orderId, {
          image_url: firstItem.image_url ?? null,
          image_key: firstItem.image_key ?? null,
        });
      } catch {
        // Best-effort preview enrichment.
      }
    }),
  );

  if (previewByOrderId.size === 0) {
    return safeNotifications;
  }

  return safeNotifications.map((item) => {
    if (item.route_type !== "order" || !item.route_target_id || item.image_url?.trim()) {
      return item;
    }

    const preview = previewByOrderId.get(item.route_target_id);
    if (!preview) {
      return item;
    }

    return {
      ...item,
      image_url: preview.image_url ?? item.image_url,
      image_key: preview.image_key ?? item.image_key,
    };
  });
}

function normalizeNotificationId(value: unknown) {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : String(value ?? "").trim().toLowerCase();
}

type NotificationReadStatePayload = {
  read_keys: string[];
  unread_count?: number;
};

function applyReadStatePayload(
  payload: NotificationReadStatePayload,
  setReadKeys: (value: string[] | ((current: string[]) => string[])) => void,
  setServerUnreadCount: (value: number | ((current: number) => number)) => void,
) {
  const nextReadKeys = (payload.read_keys ?? []).map((key) => normalizeNotificationId(key));
  setReadKeys(nextReadKeys);
  if (typeof payload.unread_count === "number") {
    setServerUnreadCount(Math.max(0, payload.unread_count));
  }
}

function normalizeNotificationPage(payload: unknown): NotificationPagePayload | null {
  if (Array.isArray(payload)) {
    const items = payload
      .filter((item) => item && typeof item === "object")
      .map((item) => item as NotificationEventPayload);

    return {
      items,
      has_more: false,
      total_count: items.length,
      unread_count: items.length,
    };
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const page = payload as Partial<NotificationPagePayload>;
  const items = Array.isArray(page.items)
    ? page.items.filter((item) => item && typeof item === "object")
    : [];

  return {
    items,
    has_more: Boolean(page.has_more),
    total_count:
      typeof page.total_count === "number" ? page.total_count : items.length,
    unread_count:
      typeof page.unread_count === "number" ? page.unread_count : items.length,
  };
}

async function fetchNotificationPage(
  token: string,
  offset: number,
): Promise<NotificationPagePayload | null> {
  const params = new URLSearchParams({
    limit: String(ACTIVITY_PAGE_SIZE),
    offset: String(offset),
  });
  const response = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return normalizeNotificationPage(await response.json());
}

function mapNotification(
  item: NotificationEventPayload,
  readKeySet: Set<string>,
): ActivityItem {
  const notificationId = normalizeNotificationId(item.id);

  return {
    id: notificationId,
    kind: item.kind,
    title: item.title,
    body: item.body,
    occurredAt: item.created_at,
    relativeTime: formatRelativeTime(item.created_at),
    icon: item.icon,
    accent: item.accent,
    isRead: readKeySet.has(notificationId),
    productImage: resolveActivityImageSource(item),
    actionLabel: item.action_label || undefined,
    route: mapRoute(item.route_type, item.route_target_id),
  };
}

export function ActivityFeedProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const { subscribe } = useRealtime();
  const [notifications, setNotifications] = useState<NotificationEventPayload[]>([]);
  const [readKeys, setReadKeys] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [serverUnreadCount, setServerUnreadCount] = useState(0);
  const [hasMoreActivity, setHasMoreActivity] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const hasLoadedOnceRef = useRef(false);
  const refreshInFlightRef = useRef(false);
  const loadMoreInFlightRef = useRef(false);

  const getToken = useCallback(async () => {
    return accessToken || (await SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY));
  }, [accessToken]);

  const refreshActivity = useCallback(
    async (options?: RefreshOptions) => {
      if (!user) {
        setNotifications([]);
        setReadKeys([]);
        setTotalCount(0);
        setServerUnreadCount(0);
        setHasMoreActivity(false);
        setIsInitialLoading(false);
        setIsPullRefreshing(false);
        setIsLoadingMore(false);
        hasLoadedOnceRef.current = false;
        setHasLoadedOnce(false);
        void syncAppBadgeCount(0);
        return;
      }

      if (refreshInFlightRef.current) {
        return;
      }

      const silent = options?.silent ?? hasLoadedOnceRef.current;
      const pull = options?.pull ?? false;

      if (pull) {
        setIsPullRefreshing(true);
      } else if (!silent) {
        setIsInitialLoading(true);
      }

      refreshInFlightRef.current = true;

      const token = await getToken();
      if (!token) {
        setNotifications([]);
        setReadKeys([]);
        setIsInitialLoading(false);
        setIsPullRefreshing(false);
        refreshInFlightRef.current = false;
        return;
      }

      try {
        const page = await fetchNotificationPage(token, 0);
        if (!page) {
          throw new Error("Failed to load activity.");
        }

        const enrichedNotifications = await enrichNotificationsWithOrderImages(page.items, token);
        setNotifications(enrichedNotifications);
        setHasMoreActivity(page.has_more);
        setTotalCount(page.total_count);
        setServerUnreadCount(page.unread_count);

        try {
          const readStateResponse = await fetch(`${API_BASE_URL}/notifications/read-state`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!readStateResponse.ok) {
            throw new Error("Failed to load read state.");
          }

          const readStatePayload = (await readStateResponse.json()) as NotificationReadStatePayload;

          applyReadStatePayload(readStatePayload, setReadKeys, setServerUnreadCount);
        } catch {
          setReadKeys([]);
        }
      } catch {
        if (!hasLoadedOnceRef.current) {
          setNotifications([]);
          setReadKeys([]);
        }
      } finally {
        hasLoadedOnceRef.current = true;
        setHasLoadedOnce(true);
        setIsInitialLoading(false);
        setIsPullRefreshing(false);
        refreshInFlightRef.current = false;
      }
    },
    [getToken, user],
  );

  const loadMoreActivity = useCallback(async () => {
    if (!user || !hasMoreActivity || loadMoreInFlightRef.current || refreshInFlightRef.current) {
      return;
    }

    loadMoreInFlightRef.current = true;
    setIsLoadingMore(true);

    const token = await getToken();
    if (!token) {
      setIsLoadingMore(false);
      loadMoreInFlightRef.current = false;
      return;
    }

    try {
      const page = await fetchNotificationPage(token, notifications.length);
      if (!page) {
        return;
      }

      const enrichedItems = await enrichNotificationsWithOrderImages(page.items, token);
      setNotifications((current) => {
        const seen = new Set(current.map((item) => item.id));
        const nextItems = enrichedItems.filter((item) => !seen.has(item.id));
        return nextItems.length > 0 ? [...current, ...nextItems] : current;
      });
      setHasMoreActivity(page.has_more);
      setTotalCount(page.total_count);
      setServerUnreadCount(page.unread_count);
    } finally {
      setIsLoadingMore(false);
      loadMoreInFlightRef.current = false;
    }
  }, [getToken, hasMoreActivity, notifications.length, user]);

  useEffect(() => {
    void refreshActivity();
  }, [refreshActivity]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && hasLoadedOnceRef.current) {
        void refreshActivity({ silent: true });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshActivity]);

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribe("notification.created", (event) => {
      const payload = event.payload as NotificationEventPayload | undefined;
      if (!payload?.id) {
        return;
      }

      setNotifications((current) => {
        if (current.some((item) => item.id === payload.id)) {
          return current;
        }
        return [payload, ...current];
      });
      setTotalCount((current) => current + 1);
      setServerUnreadCount((current) => current + 1);
    });
  }, [subscribe, user]);

  const items = useMemo(() => {
    const readKeySet = new Set(readKeys.map((key) => normalizeNotificationId(key)));
    return notifications.map((item) => mapNotification(item, readKeySet));
  }, [notifications, readKeys]);

  const sections = useMemo(() => buildSections(items), [items]);

  const unreadCount = useMemo(() => {
    const readKeySet = new Set(readKeys.map((key) => normalizeNotificationId(key)));

    if (totalCount > 0 && readKeySet.size >= totalCount) {
      return 0;
    }

    return Math.max(0, serverUnreadCount);
  }, [readKeys, serverUnreadCount, totalCount]);

  useEffect(() => {
    void syncAppBadgeCount(user ? unreadCount : 0);
  }, [unreadCount, user]);

  const markAsRead = useCallback(
    async (keys: string[]) => {
      if (!user) {
        return;
      }

      const uniqueKeys = Array.from(
        new Set(keys.map((key) => normalizeNotificationId(key)).filter(Boolean)),
      );
      if (uniqueKeys.length === 0) {
        return;
      }

      setReadKeys((current) =>
        Array.from(new Set([...current, ...uniqueKeys])),
      );
      setServerUnreadCount((current) => Math.max(0, current - uniqueKeys.length));

      const token = await getToken();
      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/notifications/read-state`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ keys: uniqueKeys }),
        });
        if (response.ok) {
          const payload = (await response.json()) as NotificationReadStatePayload;
          applyReadStatePayload(payload, setReadKeys, setServerUnreadCount);
        }
      } catch {
        // Keep optimistic read state for now.
      }
    },
    [getToken, user],
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) {
      return;
    }

    const hasUnread =
      serverUnreadCount > 0 || items.some((item) => !item.isRead);
    if (!hasUnread) {
      return;
    }

    const allKnownKeys = Array.from(
      new Set([
        ...readKeys.map((key) => normalizeNotificationId(key)),
        ...items.map((item) => normalizeNotificationId(item.id)),
      ]),
    );
    setReadKeys(allKnownKeys);
    setServerUnreadCount(0);

    const token = await getToken();
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read-state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mark_all: true }),
      });
      if (response.ok) {
        const payload = (await response.json()) as NotificationReadStatePayload;
        applyReadStatePayload(payload, setReadKeys, setServerUnreadCount);
      } else {
        await refreshActivity({ silent: true });
      }
    } catch {
      await refreshActivity({ silent: true });
    }
  }, [getToken, items, readKeys, refreshActivity, serverUnreadCount, user]);

  const pullToRefresh = useCallback(() => {
    void refreshActivity({ silent: true, pull: true });
  }, [refreshActivity]);

  const value = useMemo(
    () => ({
      sections,
      items,
      unreadCount,
      totalCount,
      hasMoreActivity,
      markAsRead,
      markAllAsRead,
      refreshActivity,
      loadMoreActivity,
      pullToRefresh,
      hasLoadedOnce,
      isInitialLoading,
      isPullRefreshing,
      isLoadingMore,
      isLoadingActivity: isInitialLoading,
    }),
    [
      sections,
      items,
      unreadCount,
      totalCount,
      hasMoreActivity,
      markAsRead,
      markAllAsRead,
      refreshActivity,
      loadMoreActivity,
      pullToRefresh,
      hasLoadedOnce,
      isInitialLoading,
      isPullRefreshing,
      isLoadingMore,
    ],
  );

  return (
    <ActivityFeedContext.Provider value={value}>{children}</ActivityFeedContext.Provider>
  );
}

export function useActivityFeedContext() {
  const context = useContext(ActivityFeedContext);
  if (!context) {
    throw new Error("useActivityFeed must be used within ActivityFeedProvider");
  }
  return context;
}
