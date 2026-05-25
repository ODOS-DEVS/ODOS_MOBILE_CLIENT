import Colors from "@/constants/Colors";
import LoadingSpinner from "@/components/loaders/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { rS, rV } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Image, View } from "react-native";

const SPLASH_HOLD_MS = 700;

export default function SplashScreen() {
  const { isHydrating } = useAuth();

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    const timer = setTimeout(() => {
      router.replace("./(tabs)");
    }, SPLASH_HOLD_MS);

    return () => clearTimeout(timer);
  }, [isHydrating]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: rS(32),
      }}
    >
      <Image
        source={require("@/assets/images/splash.png")}
        style={{
          width: rS(188),
          height: rV(156),
          resizeMode: "contain",
        }}
      />

      <View style={{ marginTop: rV(48), minHeight: rV(88) }}>
        <LoadingSpinner
          tone="inverse"
          label={isHydrating ? "Starting ODOS" : "Welcome back"}
          sublabel={
            isHydrating
              ? "Connecting to your account"
              : "Opening your storefront"
          }
        />
      </View>
    </View>
  );
}
