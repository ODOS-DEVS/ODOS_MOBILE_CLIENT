import React, { useEffect } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import Colors from "@/constants/Colors"
import { router } from "expo-router";

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
      }}
    >
      <Image
        source={require("@/assets/images/splash.png")}
        style={{ width: 200, height: 170, marginBottom: 300 }}
      />
      
      <ActivityIndicator color={"#ffffff"} style={{ marginTop: 40 }} />
    </View>
  );
}
