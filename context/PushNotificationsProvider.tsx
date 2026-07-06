import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import {
  navigateFromPushData,
  notificationIdFromPushData,
} from "@/utils/activityNavigation";
import { syncAppBadgeCount } from "@/utils/appBadge";
import { registerPushToken, unregisterPushToken } from "@/utils/pushTokenApi";
import {
  emitVendorOrderAlert,
  vendorOrderAlertFromPushData,
} from "@/utils/vendorOrderAlertBus";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

async function getAccessToken(currentToken: string | null) {
  return currentToken || (await SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY));
}

async function getProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId ||
    null
  );
}

export function PushNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, accessToken } = useAuth();
  const isExpoGo = Constants.appOwnership === "expo";
  const registeredTokenRef = useRef<string | null>(null);
  const expoGoWarningShownRef = useRef(false);
  const pendingPushDataRef = useRef<Record<string, unknown> | null>(null);
  const handledColdStartRef = useRef(false);

  const markPushNotificationRead = useCallback(
    async (notificationId: string) => {
      const token = await getAccessToken(accessToken);
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
          body: JSON.stringify({ keys: [notificationId] }),
        });
      } catch {
        // Best-effort read sync for push taps.
      }
    },
    [accessToken],
  );

  const handleNotificationResponse = useCallback(
    async (data: Record<string, unknown>) => {
      const notificationId = notificationIdFromPushData(data);
      if (notificationId) {
        await markPushNotificationRead(notificationId);
      }

      await navigateFromPushData(data);
    },
    [markPushNotificationRead],
  );

  const queuePushNavigation = useCallback(
    (data: Record<string, unknown>) => {
      if (!user) {
        pendingPushDataRef.current = data;
        return;
      }

      void handleNotificationResponse(data);
    },
    [handleNotificationResponse, user],
  );

  useEffect(() => {
    if (user && pendingPushDataRef.current) {
      const data = pendingPushDataRef.current;
      pendingPushDataRef.current = null;
      void handleNotificationResponse(data);
    }
  }, [handleNotificationResponse, user]);

  useEffect(() => {
    if (isExpoGo) {
      return;
    }

    let responseSubscription: { remove: () => void } | undefined;
    let receivedSubscription: { remove: () => void } | undefined;

    const setupListeners = async () => {
      const Notifications = await import("expo-notifications");

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "General",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
        await Notifications.setNotificationChannelAsync("vendor-orders", {
          name: "Vendor orders",
          description: "High-priority alerts when a shopper places a new order.",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 400, 180, 400, 180, 600],
          lightColor: "#F59E0B",
          sound: "vendor-order.wav",
          enableVibrate: true,
          bypassDnd: false,
        });
        await Notifications.setNotificationChannelAsync("vendor-chats", {
          name: "Shopper messages",
          description: "Alerts when a customer sends your store a chat message.",
          importance: Notifications.AndroidImportance.HIGH,
          enableVibrate: true,
        });
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data;
          queuePushNavigation(
            data && typeof data === "object"
              ? (data as Record<string, unknown>)
              : {},
          );
        },
      );

      receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data;
        if (!data || typeof data !== "object") {
          return;
        }

        const payload = data as Record<string, unknown>;
        const pushType = typeof payload.type === "string" ? payload.type : "";
        if (pushType !== "vendor_order" && pushType !== "vendor_order_reminder") {
          return;
        }

        const alertPayload = vendorOrderAlertFromPushData(payload);
        if (alertPayload) {
          emitVendorOrderAlert(alertPayload);
        }
      });

      if (!handledColdStartRef.current) {
        handledColdStartRef.current = true;
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
          const data = lastResponse.notification.request.content.data;
          queuePushNavigation(
            data && typeof data === "object"
              ? (data as Record<string, unknown>)
              : {},
          );
        }
      }
    };

    void setupListeners();

    return () => {
      responseSubscription?.remove();
      receivedSubscription?.remove();
    };
  }, [isExpoGo, queuePushNavigation]);

  useEffect(() => {
    const register = async () => {
      if (isExpoGo) {
        if (!expoGoWarningShownRef.current) {
          console.warn(
            "Push notifications disabled in Expo Go. Use a development build for real push notifications.",
          );
          expoGoWarningShownRef.current = true;
        }
        return;
      }

      if (!user || !user.allow_notifications || !Device.isDevice) {
        return;
      }

      const Notifications = await import("expo-notifications");
      const projectId = await getProjectId();
      if (!projectId) {
        return;
      }

      const permissionStatus = await Notifications.getPermissionsAsync();
      let finalStatus = permissionStatus.status;

      if (finalStatus !== "granted") {
        const requestStatus = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = requestStatus.status;
      }

      if (finalStatus !== "granted") {
        return;
      }

      const pushToken = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      if (!pushToken || registeredTokenRef.current === pushToken) {
        return;
      }

      const token = await getAccessToken(accessToken);
      if (!token) {
        return;
      }

      const ok = await registerPushToken(token, pushToken);
      if (ok) {
        registeredTokenRef.current = pushToken;
      }
    };

    void register();
  }, [accessToken, isExpoGo, user]);

  useEffect(() => {
    const cleanup = async () => {
      if (user) {
        return;
      }

      registeredTokenRef.current = null;
      await syncAppBadgeCount(0);

      const token = await getAccessToken(accessToken);
      if (token) {
        await unregisterPushToken(token);
      }
    };

    void cleanup();
  }, [accessToken, user]);

  return <>{children}</>;
}
