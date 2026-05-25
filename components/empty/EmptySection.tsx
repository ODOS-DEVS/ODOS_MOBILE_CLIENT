import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

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

const styles = StyleSheet.create({
  wrap: {
    marginTop: rV(8),
    marginHorizontal: rS(6),
    paddingHorizontal: rS(20),
    paddingVertical: rV(24),
    borderRadius: rMS(24),
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    alignItems: "center",
  },
  iconShell: {
    width: rS(48),
    height: rS(48),
    borderRadius: rS(24),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rV(12),
  },
  title: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    textAlign: "center",
  },
  message: {
    marginTop: rV(6),
    color: "#6B7280",
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    textAlign: "center",
  },
});
