import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type CommerceEmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
};

export default function CommerceEmptyState({
  icon = "bag-outline",
  title,
  message,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: CommerceEmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconShell}>
        <Ionicons name={icon} size={rS(30)} color={AppColors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onPrimaryPress}
        activeOpacity={0.88}
      >
        <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
      </TouchableOpacity>

      {secondaryLabel && onSecondaryPress ? (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onSecondaryPress}
          activeOpacity={0.82}
        >
          <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: rV(28),
    paddingHorizontal: rS(24),
    paddingVertical: rV(32),
    borderRadius: rMS(28),
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    alignItems: "center",
  },
  iconShell: {
    width: rS(76),
    height: rS(76),
    borderRadius: rS(38),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rV(18),
  },
  title: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(21),
    textAlign: "center",
    marginBottom: rV(8),
  },
  message: {
    color: "#6B7280",
    fontFamily: Fonts.text,
    fontSize: rMS(13.5),
    lineHeight: rMS(20),
    textAlign: "center",
    marginBottom: rV(22),
  },
  primaryButton: {
    minWidth: "100%",
    minHeight: rV(50),
    borderRadius: rMS(16),
    backgroundColor: AppColors.text,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(20),
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  secondaryButton: {
    marginTop: rV(12),
    paddingVertical: rV(8),
  },
  secondaryButtonText: {
    color: AppColors.primary,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
  },
});
