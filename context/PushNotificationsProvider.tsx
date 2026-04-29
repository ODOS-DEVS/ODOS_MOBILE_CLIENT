import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
  const registeredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const register = async () => {
      if (!user || !user.allow_notifications || !Device.isDevice) {
        return;
      }

      const projectId = await getProjectId();
      if (!projectId) {
        return;
      }

      const permissionStatus = await Notifications.getPermissionsAsync();
      let finalStatus = permissionStatus.status;

      if (finalStatus !== "granted") {
        const requestStatus = await Notifications.requestPermissionsAsync();
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

      const response = await fetch(`${API_BASE_URL}/notifications/push-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ expo_push_token: pushToken }),
      });

      if (response.ok) {
        registeredTokenRef.current = pushToken;
      }
    };

    void register();
  }, [accessToken, user]);

  return children;
}
