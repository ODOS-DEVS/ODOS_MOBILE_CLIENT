import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProfileHeaderProps {
  title: string;
  onBack?: () => void;
  rightNode?: React.ReactNode;
}

export default function ProfileHeader({
  title,
  onBack,
  rightNode,
}: ProfileHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack ?? (() => router.back())}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color={AppColors.text} />
      </TouchableOpacity>

      <Text numberOfLines={1} style={styles.headerTitle}>
        {title}
      </Text>

      <View style={styles.rightSlot}>{rightNode ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rS(16),
    paddingTop: rV(44),
    paddingBottom: rV(12),
    backgroundColor: AppColors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: rMS(38),
    height: rMS(38),
    borderRadius: rMS(19),
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    marginHorizontal: rS(8),
    fontSize: rMS(18),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  rightSlot: {
    width: rMS(38),
    alignItems: "center",
    justifyContent: "center",
  },
});
