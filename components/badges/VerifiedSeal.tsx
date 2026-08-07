import { useTheme } from "@/context/ThemeContext";
import { rS } from "@/styles/responsive";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type VerifiedSealProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export default function VerifiedSeal({ size = rS(26), style }: VerifiedSealProps) {
  const { colors } = useTheme();
  const ringSize = size + rS(4);

  return (
    <View style={[styles.wrap, { width: ringSize, height: ringSize }, style]}>
      <View
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            backgroundColor: colors.editAvatarBorder,
            borderColor: colors.editAvatarBorder,
            shadowColor: colors.shadow,
          },
        ]}
      />
      <MaterialCommunityIcons
        name="check-decagram"
        size={size}
        color={colors.infoText}
        style={styles.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 2,
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  icon: {
    zIndex: 1,
  },
});
