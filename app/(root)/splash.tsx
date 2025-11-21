import Colors from "@/constants/Colors";
import { rS, rV } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, View } from "react-native";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("./(auth)/onboarding");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: rV(40),
      }}
    >
      <Image
        source={require("@/assets/images/splash.png")}
        style={{
          width: rS(200),
          height: rV(170),
          marginBottom: rV(300),
          resizeMode: "contain",
        }}
      />

      <ActivityIndicator
        color={"#ffffff"}
        size="large"
        style={{ marginTop: rV(40) }}
      />
    </View>
  );
}
