import { CartProvider } from "@/context/CartContext";
import { ChatProvider } from "@/context/ChatContext";
import { AuthProvider } from "@/context/AuthContext";
import { PushNotificationsProvider } from "@/context/PushNotificationsProvider";
import { ProfileProvider } from "@/context/ProfileContext";
import { ToastProvider } from "@/context/ToastContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import "./global.css";

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
        <PushNotificationsProvider>
          <ChatProvider>
            <ProfileProvider>
              <CartProvider>
                <WishlistProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                    }}
                  />
                </WishlistProvider>
              </CartProvider>
            </ProfileProvider>
          </ChatProvider>
        </PushNotificationsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
