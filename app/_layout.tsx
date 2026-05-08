import { CartProvider } from "@/context/CartContext";
import { ChatProvider } from "@/context/ChatContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PushNotificationsProvider } from "@/context/PushNotificationsProvider";
import { ProfileProvider } from "@/context/ProfileContext";
import { ToastProvider } from "@/context/ToastContext";
import { WishlistProvider } from "@/context/WishlistContext";
import AppLoadingOverlay from "@/components/loaders/AppLoadingOverlay";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
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
  const { isHydrating, isRefreshingSession } = useAuth();

  if (!isHydrating && !isRefreshingSession) {
    return null;
  }

  return (
    <AppLoadingOverlay
      label={isHydrating ? "Preparing ODOS" : "Refreshing your account"}
      sublabel={
        isHydrating
          ? "We’re loading your saved session, storefront data, and account state."
          : "We’re syncing the latest account access and vendor permissions."
      }
    />
  );
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
        </PushNotificationsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
