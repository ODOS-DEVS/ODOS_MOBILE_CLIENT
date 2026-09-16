import type { BottomTabBarButtonProps } from "expo-router/build/react-navigation/bottom-tabs/types";
// expo-router's own vendored copy — the same component its default tab button
// renders, and the one the types above already come from. The standalone
// @react-navigation/elements package is what SDK 56 refuses to load.
import { PlatformPressable } from "expo-router/build/react-navigation/elements";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, StyleSheet } from "react-native";

export default function TabBarButton(props: BottomTabBarButtonProps) {
  const { onPressIn, style, ...rest } = props;

  return (
    <PlatformPressable
      // expo-router declares these props more widely than PlatformPressable
      // accepts -- ColorValue rather than string for pressColor and
      // hoverEffect.color. expo-router's own default tab button spreads this
      // exact object into this exact component, so the values are ones
      // PlatformPressable already handles; the disagreement is between the two
      // declarations, not in the data.
      {...(rest as React.ComponentProps<typeof PlatformPressable>)}
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
