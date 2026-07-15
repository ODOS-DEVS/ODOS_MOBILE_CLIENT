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

  if (route.type === "customer_wallet") {
    router.push("/(root)/screens/profileScreens/Account/Wallet" as any);
    return;
  }

  if (route.type === "vendor_order") {
    if (route.orderId) {
      router.push({
        pathname: "/vendor/orders/[orderId]" as any,
        params: { orderId: route.orderId },
      });
      return;
    }
    router.push("/vendor/orders" as any);
    return;
  }

  if (route.type === "vendor_chat") {
    router.push({
      pathname: "/(root)/screens/productDetails/chat/[vendorId]" as any,
      params: {
        vendorId: route.storeId,
        vendorName: route.storeName ?? "Shopper chat",
        threadId: route.threadId,
        viewer: "vendor",
      },
    });
    return;
  }

  if (route.type === "customer_chat") {
    router.push({
      pathname: "/(root)/screens/productDetails/chat/[vendorId]" as any,
      params: {
        vendorId: route.storeId,
        vendorName: route.storeName ?? "Store",
        threadId: route.threadId,
        viewer: "customer",
      },
    });
    return;
  }

  if (route.type === "vendor_flash_sale") {
    router.push("/vendor/flash-sales" as any);
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
  const threadId = readString(data.threadId) ?? routeTargetId;
  const storeId = readString(data.storeId);

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

  if (routeType === "customer_wallet") {
    return { type: "customer_wallet" };
  }

  if (routeType === "vendor_order") {
    return { type: "vendor_order", orderId: routeTargetId ?? undefined };
  }

  if (routeType === "vendor_chat" || readString(data.type) === "vendor_chat_message") {
    if (threadId) {
      return {
        type: "vendor_chat",
        threadId,
        storeId: storeId ?? "",
        storeName: readString(data.storeName) ?? undefined,
      };
    }
  }

  if (routeType === "customer_chat" || readString(data.type) === "customer_chat_message") {
    if (threadId) {
      return {
        type: "customer_chat",
        threadId,
        storeId: storeId ?? "",
        storeName: readString(data.storeName) ?? undefined,
      };
    }
  }

  if (
    routeType === "vendor_flash_sale" ||
    readString(data.type) === "vendor_flash_sale_nomination"
  ) {
    return { type: "vendor_flash_sale" };
  }

  if (readString(data.type) === "wallet_topup") {
    return { type: "customer_wallet" };
  }

  if (readString(data.type) === "vendor_order") {
    return { type: "vendor_order", orderId: orderId ?? undefined };
  }

  if (readString(data.type) === "vendor_order_reminder") {
    return { type: "vendor_order", orderId: orderId ?? undefined };
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
