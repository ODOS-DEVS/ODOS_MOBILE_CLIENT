import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type VendorEmptyStateProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function VendorEmptyState({
  actionLabel,
  icon,
  message,
  onAction,
  title,
}: VendorEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={rMS(28)} color={AppColors.secondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(24),
    paddingVertical: rV(32),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  iconWrap: {
    width: rMS(60),
    height: rMS(60),
    borderRadius: rMS(30),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: rV(16),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    color: AppColors.text,
    textAlign: "center",
  },
  message: {
    marginTop: rV(8),
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    color: AppColors.secondary,
    textAlign: "center",
    lineHeight: rMS(20),
  },
  button: {
    marginTop: rV(20),
    backgroundColor: AppColors.primary,
    borderRadius: rMS(999),
    paddingHorizontal: rS(18),
    paddingVertical: rV(12),
  },
  buttonLabel: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
});
