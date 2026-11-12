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
  /**
   * "card" is the full panel: icon badge, filled button, outlined second
   * action. "quiet" is a line of text and one text link.
   *
   * Empty is not always a problem to solve. An empty cart is just a cart you
   * have not filled yet, and answering that with a bordered card, a 76pt icon
   * and two buttons gives it more weight than the state deserves.
   */
  variant?: "card" | "quiet";
};

export default function CommerceEmptyState({
  icon = "bag-outline",
  title,
  message,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  variant = "card",
}: CommerceEmptyStateProps) {
  const styles = useCommerceEmptyStyles();

  if (variant === "quiet") {
    // One action only. Offering both "start shopping" and "browse categories"
    // asks the shopper to choose a route before they have chosen anything.
    const linkLabel = primaryLabel ?? secondaryLabel;
    const onLinkPress = primaryLabel ? onPrimaryPress : onSecondaryPress;

    return (
      <View style={styles.quietWrap}>
        <Text style={styles.quietTitle}>{title}</Text>
        <Text style={styles.quietMessage}>{message}</Text>

        {linkLabel && onLinkPress ? (
          <TouchableOpacity
            style={styles.quietLink}
            onPress={onLinkPress}
            activeOpacity={0.7}
            accessibilityRole="link"
          >
            <Text style={styles.quietLinkText}>{linkLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

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
