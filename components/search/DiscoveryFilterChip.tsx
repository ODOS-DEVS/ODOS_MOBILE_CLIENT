import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type DiscoveryFilterChipProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export default function DiscoveryFilterChip({
  label,
  active = false,
  onPress,
}: DiscoveryFilterChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipDefault]}
    >
      <Text style={[styles.label, active ? styles.labelActive : styles.labelDefault]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: rS(12),
    paddingVertical: rV(7),
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipDefault: {
    backgroundColor: "#F7FAFC",
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  label: {
    fontSize: rMS(11.5),
    fontFamily: Fonts.title,
  },
  labelDefault: {
    color: AppColors.text,
  },
  labelActive: {
    color: AppColors.white,
  },
});
