import Constants from "expo-constants";

export async function syncAppBadgeCount(count: number) {
  if (Constants.appOwnership === "expo") {
    return;
  }

  try {
    const Notifications = await import("expo-notifications");
    await Notifications.setBadgeCountAsync(Math.max(0, Math.floor(count)));
  } catch {
    // Badge updates are best-effort.
  }
}
