import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type QuickActionCardProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function QuickActionCard({
  icon,
  onPress,
  subtitle,
  title,
}: QuickActionCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={rMS(18)} color={AppColors.text} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: rS(150),
    backgroundColor: AppColors.white,
    borderRadius: rMS(22),
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  iconWrap: {
    width: rMS(38),
    height: rMS(38),
    borderRadius: rMS(19),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: rV(14),
    fontFamily: Fonts.title,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  subtitle: {
    marginTop: rV(6),
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: AppColors.secondary,
    lineHeight: rMS(18),
  },
});
