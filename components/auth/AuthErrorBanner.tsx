import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type AuthErrorBannerProps = {
  message: string;
};

export default function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  const { colors } = useTheme();

  if (!message) {
    return null;
  }

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.dangerSoft,
          borderColor: `${colors.dangerText}33`,
        },
      ]}
    >
      <Ionicons name="alert-circle-outline" size={rMS(18)} color={colors.dangerText} />
      <Text style={[styles.text, { color: colors.dangerText }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
    borderWidth: 1,
    borderRadius: rMS(14),
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
    marginBottom: rV(14),
  },
  text: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
  },
});
