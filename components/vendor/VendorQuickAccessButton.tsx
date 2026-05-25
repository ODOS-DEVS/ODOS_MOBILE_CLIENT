import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useVendorQuickAccess } from "@/hooks/useVendorQuickAccess";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type VendorQuickAccessButtonProps = {
  compact?: boolean;
};

export default function VendorQuickAccessButton({
  compact = false,
}: VendorQuickAccessButtonProps) {
  const { isApprovedVendor, storeLabel, openDashboard } = useVendorQuickAccess();

  if (!isApprovedVendor) {
    return null;
  }

  if (compact) {
    return (
      <TouchableOpacity
        onPress={openDashboard}
        activeOpacity={0.86}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.compactButton}
      >
        <Ionicons name="storefront" size={rS(20)} color={AppColors.primary} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={openDashboard}
      activeOpacity={0.88}
      style={styles.button}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="storefront" size={rS(18)} color={AppColors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Vendor</Text>
        <Text style={styles.label} numberOfLines={1}>
          {storeLabel}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={rS(16)} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  compactButton: {
    width: rS(40),
    height: rS(40),
    borderRadius: rS(20),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#C7D2FE",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    borderRadius: rMS(18),
    backgroundColor: "#EEF2FF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#C7D2FE",
    paddingHorizontal: rS(12),
    paddingVertical: rV(10),
  },
  iconWrap: {
    width: rS(36),
    height: rS(36),
    borderRadius: rS(12),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: rV(1),
  },
  eyebrow: {
    color: AppColors.primary,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  label: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
  },
});
