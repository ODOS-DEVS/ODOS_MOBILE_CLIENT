import { API_BASE_URL } from "@/constants/auth";

export async function registerPushToken(accessToken: string, expoPushToken: string) {
  const response = await fetch(`${API_BASE_URL}/notifications/push-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ expo_push_token: expoPushToken }),
  });

  return response.ok;
}

export async function unregisterPushToken(accessToken: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/push-token`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
