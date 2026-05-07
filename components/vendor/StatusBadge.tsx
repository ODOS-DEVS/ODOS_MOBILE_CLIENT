import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import type { VendorStatus } from "@/types/vendor";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const STATUS_STYLES: Record<
  VendorStatus,
  { backgroundColor: string; color: string; label: string }
> = {
  none: {
    backgroundColor: "#EEF2F7",
    color: AppColors.secondary,
    label: "Not Applied",
  },
  pending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    label: "Pending",
  },
  under_review: {
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
    label: "Under Review",
  },
  approved: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
    label: "Approved",
  },
  rejected: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    label: "Rejected",
  },
  suspended: {
    backgroundColor: "#F3E8FF",
    color: "#7C3AED",
    label: "Suspended",
  },
};

type StatusBadgeProps = {
  status: VendorStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const palette = STATUS_STYLES[status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: palette.color,
          },
        ]}
      >
        {palette.label}
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
