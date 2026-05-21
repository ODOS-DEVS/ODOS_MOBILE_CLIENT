import { CartProvider } from "@/context/CartContext";
import { ChatProvider } from "@/context/ChatContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PushNotificationsProvider } from "@/context/PushNotificationsProvider";
import { ProfileProvider } from "@/context/ProfileContext";
import { RealtimeProvider } from "@/context/RealtimeContext";
import { ToastProvider } from "@/context/ToastContext";
import { WishlistProvider } from "@/context/WishlistContext";
import AppLoadingOverlay from "@/components/loaders/AppLoadingOverlay";
import { useRealtime } from "@/context/RealtimeContext";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
import { useVendorSession } from "@/hooks/useVendorSession";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import "./global.css";

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

function AppBootOverlay() {
  const { isHydrating } = useAuth();

  if (!isHydrating) {
    return null;
  }

  return (
    <AppLoadingOverlay
      label="Preparing ODOS"
      sublabel="We’re loading your saved session, storefront data, and account state."
    />
  );
}

function VendorRealtimeBridge() {
  const { session, user } = useVendorSession();
  const { subscribe } = useRealtime();
  const fetchOrders = useStoreStore((state) => state.fetchOrders);
  const fetchProducts = useStoreStore((state) => state.fetchProducts);
  const fetchVendorDashboard = useVendorStore((state) => state.fetchVendorDashboard);

  useEffect(() => {
    if (!user?.roles?.includes("vendor") || !session.accessToken) {
      return;
    }

    const unsubscribeOrder = subscribe("vendor.order.updated", (event) => {
      if (!event.payload) return;
      void fetchOrders(session);
      void fetchVendorDashboard(session);
    });

    const unsubscribeProduct = subscribe("vendor.product.updated", (event) => {
      if (!event.payload) return;
      void fetchProducts(session);
      void fetchVendorDashboard(session);
    });

    const unsubscribeDashboard = subscribe("vendor.dashboard.updated", (event) => {
      if (!event.payload) return;
      void fetchVendorDashboard(session);
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
    subscribe,
    user?.roles,
  ]);

  return null;
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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // wait until fonts are loaded
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <VendorStateBridge />
        <PushNotificationsProvider>
          <RealtimeProvider>
            <VendorRealtimeBridge />
            <ChatProvider>
              <ProfileProvider>
                <CartProvider>
                  <WishlistProvider>
                    <View style={{ flex: 1 }}>
                      <Stack
                        screenOptions={{
                          headerShown: false,
                        }}
                      />
                      <AppBootOverlay />
                    </View>
                  </WishlistProvider>
                </CartProvider>
              </ProfileProvider>
            </ChatProvider>
          </RealtimeProvider>
        </PushNotificationsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
