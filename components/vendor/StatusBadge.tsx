import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import type { VendorStatus } from "@/types/vendor";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

const STATUS_LABELS: Record<VendorStatus, string> = {
  none: "Not Applied",
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

type StatusBadgeProps = {
  status: VendorStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors } = useTheme();

  const palette = useMemo(() => {
    switch (status) {
      case "pending":
        return { backgroundColor: colors.warningSoft, color: colors.warningText };
      case "under_review":
        return { backgroundColor: colors.infoSoft, color: colors.infoText };
      case "approved":
        return { backgroundColor: colors.successSoft, color: colors.successText };
      case "rejected":
        return { backgroundColor: colors.dangerSoft, color: colors.dangerText };
      case "suspended":
        return { backgroundColor: colors.infoSoft, color: colors.infoText };
      default:
        return { backgroundColor: colors.surfaceMuted, color: colors.textMuted };
    }
  }, [colors, status]);

  return (
    <View style={[styles.badge, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.label, { color: palette.color }]}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: rMS(999),
    paddingHorizontal: rS(12),
    paddingVertical: rV(6),
  },
  label: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.5),
  },
});
