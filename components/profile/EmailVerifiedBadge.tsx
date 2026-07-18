import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Reanimated from "react-native-reanimated";

type EmailVerifiedBadgeProps = {
  email: string;
};

export default function EmailVerifiedBadge({ email }: EmailVerifiedBadgeProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        chip: {
          alignSelf: "flex-start",
          marginTop: rV(8),
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          maxWidth: "100%",
          paddingHorizontal: rS(10),
          paddingVertical: rV(6),
          borderRadius: rMS(999),
          backgroundColor: colors.successSoft,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: `${colors.successText}28`,
        },
        label: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11.5),
          color: colors.successText,
        },
        divider: {
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: `${colors.successText}66`,
        },
        email: {
          flexShrink: 1,
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
          color: colors.textMuted,
        },
      }),
    [colors],
  );

  return (
    <Reanimated.View style={styles.chip}>
      <Ionicons name="checkmark-circle" size={rMS(14)} color={colors.successText} />
      <Text style={styles.label}>Verified</Text>
      <Text style={styles.divider}>·</Text>
      <Text style={styles.email} numberOfLines={1}>
        {email}
      </Text>
    </Reanimated.View>
  );
}
