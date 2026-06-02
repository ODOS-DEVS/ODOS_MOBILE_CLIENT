import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type AuthFormCardProps = {
  children: ReactNode;
};

export default function AuthFormCard({ children }: AuthFormCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadow,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: rMS(20),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(18),
    paddingVertical: rV(20),
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
