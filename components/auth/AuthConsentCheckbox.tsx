import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AuthConsentCheckboxProps = {
  checked: boolean;
  onToggle: (next: boolean) => void;
  error?: string;
};

const LEGAL_HREF =
  "/(root)/screens/profileScreens/helpAndSupport/LegalPolicy" as const;

export default function AuthConsentCheckbox({
  checked,
  onToggle,
  error,
}: AuthConsentCheckboxProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => onToggle(!checked)}
          activeOpacity={0.85}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          hitSlop={8}
        >
          <View
            style={[
              styles.box,
              {
                borderColor: error
                  ? colors.dangerText
                  : checked
                    ? colors.primary
                    : colors.inputBorder,
                backgroundColor: checked ? colors.primary : colors.inputBg,
              },
            ]}
          >
            {checked ? (
              <Ionicons name="checkmark" size={rMS(16)} color={colors.onPrimary} />
            ) : null}
          </View>
        </TouchableOpacity>
        <Text style={[styles.label, { color: colors.textBody }]}>
          I agree to the{" "}
          <Text
            style={[styles.link, { color: colors.primary }]}
            onPress={() => router.push(LEGAL_HREF as any)}
          >
            Terms of Use
          </Text>{" "}
          and{" "}
          <Text
            style={[styles.link, { color: colors.primary }]}
            onPress={() => router.push(LEGAL_HREF as any)}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
      {error ? (
        <Text style={[styles.error, { color: colors.dangerText }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: rV(16),
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(12),
  },
  box: {
    width: rMS(22),
    height: rMS(22),
    borderRadius: rMS(6),
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: rV(2),
  },
  label: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
  },
  link: {
    fontFamily: Fonts.titleBold,
  },
  error: {
    marginTop: rV(8),
    marginLeft: rS(34),
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
});
