import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import { useRealtime } from "@/context/RealtimeContext";
import { resolveActivityImageSource } from "@/utils/activityImages";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "expo-router";
import { AppState } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ActivityRoute =
  | { type: "order"; orderId: string }
  | { type: "profile" }
  | { type: "orders" }
  | { type: "vendor_wallet" };

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
    | "refresh-circle-outline";
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

type RefreshOptions = {
  /** Skip full-screen loader; update list in place */
  silent?: boolean;
  /** Pull-to-refresh spinner only */
  pull?: boolean;
};

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
  notifications: NotificationEventPayload[],
  token: string,
): Promise<NotificationEventPayload[]> {
  const needsPreview = notifications.some(
    (item) =>
      item.route_type === "order" &&
      item.route_target_id &&
      !item.image_url?.trim(),
  );

  if (!needsPreview) {
    return notifications;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return notifications;
    }

    const orders = (await response.json()) as OrderPreviewPayload[];
    const previewByOrderId = new Map<
      string,
      { image_url?: string | null; image_key?: string | null }
    >();

    for (const order of orders) {
      const firstItem = order.items?.[0];
      if (!firstItem) {
        continue;
      }
      previewByOrderId.set(order.id, {
        image_url: firstItem.image_url ?? null,
        image_key: firstItem.image_key ?? null,
      });
    }

    return notifications.map((item) => {
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
  } catch {
    return notifications;
  }
}

function mapNotification(
  item: NotificationEventPayload,
  readKeySet: Set<string>,
): ActivityItem {
  return {
    id: item.id,
    kind: item.kind,
    title: item.title,
    body: item.body,
    occurredAt: item.created_at,
    relativeTime: formatRelativeTime(item.created_at),
    icon: item.icon,
    accent: item.accent,
    isRead: readKeySet.has(item.id),
    productImage: resolveActivityImageSource(item),
    actionLabel: item.action_label || undefined,
    route: mapRoute(item.route_type, item.route_target_id),
  };
}

export function useActivityFeed() {
  const { user, accessToken } = useAuth();
  const { subscribe } = useRealtime();
  const [notifications, setNotifications] = useState<NotificationEventPayload[]>([]);
  const [readKeys, setReadKeys] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const hasLoadedOnceRef = useRef(false);
  const refreshInFlightRef = useRef(false);

  const getToken = useCallback(async () => {
    return accessToken || (await SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY));
  }, [accessToken]);

  const refreshActivity = useCallback(
    async (options?: RefreshOptions) => {
      if (!user) {
        setNotifications([]);
        setReadKeys([]);
        setIsInitialLoading(false);
        setIsPullRefreshing(false);
        hasLoadedOnceRef.current = false;
        setHasLoadedOnce(false);
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
        const notificationsResponse = await fetch(`${API_BASE_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!notificationsResponse.ok) {
          throw new Error("Failed to load activity.");
        }

        const notificationsPayload =
          (await notificationsResponse.json()) as NotificationEventPayload[];
        const enrichedNotifications = await enrichNotificationsWithOrderImages(
          notificationsPayload,
          token,
        );
        setNotifications(enrichedNotifications);

        try {
          const readStateResponse = await fetch(`${API_BASE_URL}/notifications/read-state`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!readStateResponse.ok) {
            throw new Error("Failed to load read state.");
          }

          const readStatePayload = (await readStateResponse.json()) as {
            read_keys: string[];
          };

          setReadKeys(readStatePayload.read_keys || []);
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

  useFocusEffect(
    useCallback(() => {
      void refreshActivity({ silent: hasLoadedOnceRef.current });
    }, [refreshActivity]),
  );

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
    });
  }, [subscribe, user]);

  const items = useMemo(() => {
    const readKeySet = new Set(readKeys);
    return notifications.map((item) => mapNotification(item, readKeySet));
  }, [notifications, readKeys]);

  const sections = useMemo(() => buildSections(items), [items]);
  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items],
  );

  const markAsRead = useCallback(
    async (keys: string[]) => {
      if (!user) {
        return;
      }

      const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
      if (uniqueKeys.length === 0) {
        return;
      }

      setReadKeys((current) => Array.from(new Set([...current, ...uniqueKeys])));

      const token = await getToken();
      if (!token) {
        return;
      }

      try {
        await fetch(`${API_BASE_URL}/notifications/read-state`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ keys: uniqueKeys }),
        });
      } catch {
        // Keep optimistic read state for now.
      }
    },
    [getToken, user],
  );

  const pullToRefresh = useCallback(() => {
    void refreshActivity({ silent: true, pull: true });
  }, [refreshActivity]);

  return {
    sections,
    items,
    unreadCount,
    markAsRead,
    refreshActivity,
    pullToRefresh,
    hasLoadedOnce,
    isInitialLoading,
    isPullRefreshing,
    /** @deprecated use isInitialLoading */
    isLoadingActivity: isInitialLoading,
  };
}
