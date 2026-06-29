import type { ActivityRoute } from "@/hooks/useActivityFeed";
import { router } from "expo-router";

export async function openActivityRoute(route: ActivityRoute) {
  if (route.type === "order") {
    router.push({
      pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
      params: { orderId: route.orderId },
    });
    return;
  }

  if (route.type === "profile") {
    router.push("/(root)/screens/profileScreens/CustomerProfile" as any);
    return;
  }

  if (route.type === "vendor_wallet") {
    router.push("/vendor/wallet" as any);
    return;
  }

  router.push("/(root)/screens/profileScreens/orders" as any);
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function routeFromPushData(
  data: Record<string, unknown>,
): ActivityRoute | null {
  const routeType = readString(data.routeType);
  const routeTargetId = readString(data.routeTargetId);
  const orderId = readString(data.orderId) ?? routeTargetId;

  if (routeType === "order" && orderId) {
    return { type: "order", orderId };
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

  if (readString(data.type) === "order_update" && orderId) {
    return { type: "order", orderId };
  }

  return null;
}

export function notificationIdFromPushData(
  data: Record<string, unknown>,
): string | null {
  return readString(data.notificationId);
}

export async function navigateFromPushData(data: Record<string, unknown>) {
  const route = routeFromPushData(data);
  if (!route) {
    router.push("/(root)/screens/Notification" as any);
    return;
  }

  await openActivityRoute(route);
}
