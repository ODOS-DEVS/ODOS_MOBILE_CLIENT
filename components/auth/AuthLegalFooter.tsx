import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rV } from "@/styles/responsive";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text } from "react-native";

type AuthLegalFooterProps = {
  action?: "signin" | "signup";
};

const LEGAL_HREF =
  "/(root)/screens/profileScreens/helpAndSupport/LegalPolicy" as const;

export default function AuthLegalFooter({ action = "signin" }: AuthLegalFooterProps) {
  const { colors } = useTheme();
  const verb = action === "signup" ? "signing up" : "continuing";

  return (
    <Text style={[styles.legal, { color: colors.textMuted }]}>
      {`By ${verb} you agree to our `}
      <Text
        style={[styles.bold, { color: colors.text }]}
        onPress={() => router.push(LEGAL_HREF as any)}
      >
        Terms
      </Text>{" "}
      and{" "}
      <Text
        style={[styles.bold, { color: colors.text }]}
        onPress={() => router.push(LEGAL_HREF as any)}
      >
        Privacy Policy
      </Text>
      .
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
