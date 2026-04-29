import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { resolveCatalogImage } from "@/constants/catalogImages";
import { useAuth } from "@/context/AuthContext";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "expo-router";
import { AppState } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";

export type ActivityRoute =
  | { type: "order"; orderId: string }
  | { type: "profile" }
  | { type: "orders" };

export type ActivityItem = {
  id: string;
  title: string;
  body: string;
  occurredAt: string;
  relativeTime: string;
  icon: "bag-handle-outline" | "checkmark-done-outline" | "close-circle-outline" | "person-outline" | "mail-outline";
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
  created_at: string;
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
    { title: "This Week", data: thisWeek },
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
  return undefined;
}

function mapNotification(
  item: NotificationEventPayload,
  readKeySet: Set<string>,
): ActivityItem {
  return {
    id: item.id,
    title: item.title,
    body: item.body,
    occurredAt: item.created_at,
    relativeTime: formatRelativeTime(item.created_at),
    icon: item.icon,
    accent: item.accent,
    isRead: readKeySet.has(item.id),
    productImage: item.image_key ? resolveCatalogImage(item.image_key) : undefined,
    actionLabel: item.action_label || undefined,
    route: mapRoute(item.route_type, item.route_target_id),
  };
}

export function useActivityFeed() {
  const { user, accessToken } = useAuth();
  const [notifications, setNotifications] = useState<NotificationEventPayload[]>([]);
  const [readKeys, setReadKeys] = useState<string[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  const getToken = useCallback(async () => {
    return accessToken || (await SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY));
  }, [accessToken]);

  const refreshActivity = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setReadKeys([]);
      setIsLoadingActivity(false);
      return;
    }

    const token = await getToken();
    if (!token) {
      setNotifications([]);
      setReadKeys([]);
      setIsLoadingActivity(false);
      return;
    }

    setIsLoadingActivity(true);
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
      setNotifications(notificationsPayload);

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
      setNotifications([]);
      setReadKeys([]);
    } finally {
      setIsLoadingActivity(false);
    }
  }, [getToken, user]);

  useEffect(() => {
    void refreshActivity();
  }, [refreshActivity]);

  useFocusEffect(
    useCallback(() => {
      void refreshActivity();
    }, [refreshActivity]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshActivity();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshActivity]);

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

  return {
    sections,
    items,
    unreadCount,
    markAsRead,
    refreshActivity,
    isLoadingActivity,
  };
}
