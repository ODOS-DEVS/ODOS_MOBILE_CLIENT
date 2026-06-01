import { useTheme } from "@/context/ThemeContext";
import React, { type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

type ThemedScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
  safe?: boolean;
};

export default function ThemedScreen({
  children,
  style,
  edges = ["top"],
  safe = true,
}: ThemedScreenProps) {
  const { colors } = useTheme();
  const shellStyle = [{ flex: 1, backgroundColor: colors.screen }, style];

  if (safe) {
    return (
      <SafeAreaView style={shellStyle} edges={edges}>
        {children}
      </SafeAreaView>
    );
  }

  return <View style={shellStyle}>{children}</View>;
}
