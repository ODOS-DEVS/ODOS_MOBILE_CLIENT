import { CartProvider } from "@/context/CartContext";
import { ChatProvider } from "@/context/ChatContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ActivityFeedProvider } from "@/context/ActivityFeedContext";
import { PushNotificationsProvider } from "@/context/PushNotificationsProvider";
import { ProfileProvider } from "@/context/ProfileContext";
import { RealtimeProvider } from "@/context/RealtimeContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { VendorOrderAlertProvider } from "@/context/VendorOrderAlertProvider";
import { WishlistProvider } from "@/context/WishlistContext";
import { BehaviorTrackingProvider } from "@/context/BehaviorTrackingContext";
import { useRealtime } from "@/context/RealtimeContext";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
import { useVendorSession } from "@/hooks/useVendorSession";
import {
  cancelVendorOrderReminders,
  triggerVendorOrderAlert,
} from "@/context/VendorOrderAlertProvider";
import { mapRealtimeVendorOrderPayload } from "@/services/storeService";
import {
  vendorOrderAlertFromRealtimePayload,
} from "@/utils/vendorOrderAlertBus";
import { useFonts } from "expo-font";
import { SplashScreen as ExpoSplashScreen, Stack } from "expo-router";
import { AppState, InteractionManager, View } from "react-native";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableFreeze } from "react-native-screens";
import "./global.css";

ExpoSplashScreen.preventAutoHideAsync();
// Freeze + Reanimated + Fabric stack pops caused TestFlight SIGSEGV/SIGBUS
// (RNSScreen snapshot vs Reanimated commit). Keep freeze off in production builds.
enableFreeze(false);

function VendorStateBridge() {
  const { accessToken, user } = useAuth();
  const clearStoreState = useStoreStore((state) => state.clearStoreState);
  const clearVendorState = useVendorStore((state) => state.clearVendorState);
  const hydrateFromSession = useVendorStore((state) => state.hydrateFromSession);

  const session = useMemo(
    () => ({
      accessToken,
      userId: user?.id ?? null,
      fullName: user?.full_name ?? null,
      email: user?.email ?? null,
      phoneNumber: user?.phone_number ?? null,
      roles: user?.roles,
      vendorId: user?.vendorId ?? null,
      vendorStatus: user?.vendorStatus,
      vendorRejectionReason: user?.vendorRejectionReason ?? null,
    }),
    [accessToken, user],
  );

  useEffect(() => {
    if (!user) {
      clearVendorState();
      clearStoreState();
      return;
    }

    hydrateFromSession(session);
  }, [clearStoreState, clearVendorState, hydrateFromSession, session, user]);

  return null;
}

function VendorRealtimeBridge() {
  const { session, user } = useVendorSession();
  const { subscribe } = useRealtime();
  const orders = useStoreStore((state) => state.orders);
  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  const upsertRealtimeOrder = useStoreStore((state) => state.upsertRealtimeOrder);
  const fetchOrders = useStoreStore((state) => state.fetchOrders);
  const fetchProducts = useStoreStore((state) => state.fetchProducts);
  const fetchVendorDashboard = useVendorStore((state) => state.fetchVendorDashboard);
  const setRealtimeVendorDashboard = useVendorStore(
    (state) => state.setRealtimeVendorDashboard,
  );

  useEffect(() => {
    if (!user?.roles?.includes("vendor") || !session.accessToken) {
      return;
    }

    const unsubscribeOrder = subscribe("vendor.order.updated", (event) => {
      if (!event.payload || typeof event.payload !== "object") {
        return;
      }

      const payload = event.payload as Record<string, unknown>;
      const existingOrder = ordersRef.current.find(
        (item) => item.id === String(payload.id ?? ""),
      );
      const alertPayload = vendorOrderAlertFromRealtimePayload(payload);
      const status = String(payload.status ?? "");
      const isActionableStatus = ["pending", "confirmed", "processing"].includes(status);
      const createdAtMs = Date.parse(String(payload.created_at ?? ""));
      const isRecentOrder =
        Number.isFinite(createdAtMs) && Date.now() - createdAtMs < 10 * 60 * 1000;
      const isNewOrder = !existingOrder && isActionableStatus && isRecentOrder;
      const isStillActive = ["pending", "confirmed", "processing", "ready", "out_for_delivery"].includes(
        status,
      );

      if (!isStillActive && alertPayload) {
        InteractionManager.runAfterInteractions(() => {
          void cancelVendorOrderReminders(alertPayload.orderId);
        });
      }

      if (alertPayload && isNewOrder) {
        triggerVendorOrderAlert(alertPayload);
      }

      if (alertPayload) {
        const mappedOrder = mapRealtimeVendorOrderPayload(payload);
        InteractionManager.runAfterInteractions(() => {
          upsertRealtimeOrder(mappedOrder);
        });
      } else {
        InteractionManager.runAfterInteractions(() => {
          void fetchOrders(session);
        });
      }
    });

    const unsubscribeProduct = subscribe("vendor.product.updated", (event) => {
      if (!event.payload) return;
      void fetchProducts(session);
      void fetchVendorDashboard(session);
    });

    const unsubscribeDashboard = subscribe("vendor.dashboard.updated", (event) => {
      if (!event.payload || typeof event.payload !== "object") {
        return;
      }

      setRealtimeVendorDashboard(event.payload as any);
    });

    return () => {
      unsubscribeOrder();
      unsubscribeProduct();
      unsubscribeDashboard();
    };
  }, [
    fetchOrders,
    fetchProducts,
    fetchVendorDashboard,
    session,
    setRealtimeVendorDashboard,
    subscribe,
    upsertRealtimeOrder,
    user?.roles,
  ]);

  return null;
}

function ThemedAppShell({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.screen }}>{children}</View>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Black": require("@/assets/fonts/Montserrat-Black.ttf"),
    "Montserrat-Bold": require("@/assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("@/assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-Light": require("@/assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Regular": require("@/assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-SemiBold": require("@/assets/fonts/Montserrat-SemiBold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <VendorStateBridge />
            <RealtimeProvider>
              <ActivityFeedProvider>
                <PushNotificationsProvider>
                  <VendorOrderAlertProvider>
                    <VendorRealtimeBridge />
                    <ChatProvider>
                    <ProfileProvider>
                      <BehaviorTrackingProvider>
                        <CartProvider>
                          <WishlistProvider>
                            <ThemedAppShell>
                              <Stack
                                screenOptions={{
                                  headerShown: false,
                                  freezeOnBlur: false,
                                  animation: "default",
                                  // Avoid snapshot/detach races with Reanimated during stack pop.
                                  fullScreenGestureEnabled: false,
                                }}
                              />
                            </ThemedAppShell>
                          </WishlistProvider>
                        </CartProvider>
                      </BehaviorTrackingProvider>
                    </ProfileProvider>
                  </ChatProvider>
                  </VendorOrderAlertProvider>
                </PushNotificationsProvider>
              </ActivityFeedProvider>
            </RealtimeProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
