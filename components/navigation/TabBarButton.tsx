import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, StyleSheet } from "react-native";

export default function TabBarButton(props: BottomTabBarButtonProps) {
  const { onPressIn, style, ...rest } = props;

  return (
    <PlatformPressable
      {...rest}
      style={[style, styles.pressable]}
      onPressIn={(event) => {
        if (Platform.OS === "ios") {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(event);
      }}
      android_ripple={{
        color: "rgba(105,105,105,0.1)",
        borderless: true,
      }}
    />
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
  },
});
