import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rV } from "@/styles/responsive";
import React from "react";
import { StyleSheet, Text } from "react-native";

type AuthLegalFooterProps = {
  action?: "signin" | "signup";
};

export default function AuthLegalFooter({ action = "signin" }: AuthLegalFooterProps) {
  const { colors } = useTheme();
  const verb = action === "signup" ? "signing up" : "continuing";

  return (
    <Text style={[styles.legal, { color: colors.textMuted }]}>
      {`By ${verb} you agree to our `}
      <Text style={[styles.bold, { color: colors.text }]}>Terms</Text> and{" "}
      <Text style={[styles.bold, { color: colors.text }]}>Privacy Policy</Text>.
    </Text>
  );
}

const styles = StyleSheet.create({
  legal: {
    marginTop: rV(24),
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
    textAlign: "center",
  },
  bold: {
    fontFamily: Fonts.titleBold,
  },
});
