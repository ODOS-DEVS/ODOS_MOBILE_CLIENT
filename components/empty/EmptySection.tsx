import { AppColors } from "@/constants/Colors";
import { useEmptySectionStyles } from "@/styles/themedCommerce";
import { rS } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

type EmptySectionProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
};

export default function EmptySection({
  icon = "cube-outline",
  title,
  message,
}: EmptySectionProps) {
  const styles = useEmptySectionStyles();

  return (
    <View style={styles.wrap}>
      <View style={styles.iconShell}>
        <Ionicons name={icon} size={rS(22)} color={AppColors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}
