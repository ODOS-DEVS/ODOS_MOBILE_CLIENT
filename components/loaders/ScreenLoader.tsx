import LoadingSpinner from "@/components/loaders/LoadingSpinner";
import { useTheme } from "@/context/ThemeContext";
import { rS, rV } from "@/styles/responsive";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

type ScreenLoaderProps = {
  label?: string;
  sublabel?: string;
};

export default function ScreenLoader({
  label = "Loading",
  sublabel,
}: ScreenLoaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: rS(24),
          paddingVertical: rV(40),
          minHeight: rV(280),
          backgroundColor: colors.screen,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.container}>
      <LoadingSpinner label={label} sublabel={sublabel} />
    </View>
  );
}
