import { AppColors } from "@/constants/Colors";
import { rS } from "@/styles/responsive";
import { useCommerceEmptyStyles } from "@/styles/themedCommerce";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type CommerceEmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  primaryLabel?: string;
  onPrimaryPress?: () => void;
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
  const styles = useCommerceEmptyStyles();

  return (
    <View style={styles.wrap}>
      <View style={styles.iconShell}>
        <Ionicons name={icon} size={rS(30)} color={AppColors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {primaryLabel && onPrimaryPress ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onPrimaryPress}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
        </TouchableOpacity>
      ) : null}

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
