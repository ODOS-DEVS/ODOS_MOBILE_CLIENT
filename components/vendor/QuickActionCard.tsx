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
  tag?: string;
  highlight?: boolean;
  onPress: () => void;
};

export function QuickActionCard({
  highlight = false,
  icon,
  onPress,
  subtitle,
  tag,
  title,
}: QuickActionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, highlight && styles.cardHighlight]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, highlight && styles.iconWrapHighlight]}>
          <Ionicons
            name={icon}
            size={rMS(18)}
            color={highlight ? AppColors.white : AppColors.text}
          />
        </View>
        <View style={[styles.arrowWrap, highlight && styles.arrowWrapHighlight]}>
          <Ionicons
            name="chevron-forward"
            size={rMS(15)}
            color={highlight ? AppColors.white : AppColors.secondary}
          />
        </View>
      </View>
      {tag ? (
        <View style={[styles.tagChip, highlight && styles.tagChipHighlight]}>
          <Text style={[styles.tagLabel, highlight && styles.tagLabelHighlight]}>
            {tag}
          </Text>
        </View>
      ) : null}
      <Text style={[styles.title, highlight && styles.titleHighlight]}>{title}</Text>
      <Text style={[styles.subtitle, highlight && styles.subtitleHighlight]}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: rS(150),
    backgroundColor: "#FCFDFE",
    borderRadius: rMS(24),
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardHighlight: {
    backgroundColor: "#0B1526",
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#EFF4FA",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapHighlight: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  arrowWrap: {
    width: rMS(28),
    height: rMS(28),
    borderRadius: rMS(14),
    backgroundColor: "#F3F6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowWrapHighlight: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tagChip: {
    alignSelf: "flex-start",
    marginTop: rV(14),
    borderRadius: rMS(999),
    backgroundColor: "#F8EFE4",
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
  },
  tagChipHighlight: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  tagLabel: {
    color: "#8B5E34",
    fontFamily: Fonts.textBold,
    fontSize: rMS(10.5),
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },
  tagLabelHighlight: {
    color: "rgba(255,255,255,0.8)",
  },
  title: {
    marginTop: rV(14),
    fontFamily: Fonts.title,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  titleHighlight: {
    color: AppColors.white,
  },
  subtitle: {
    marginTop: rV(6),
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: AppColors.secondary,
    lineHeight: rMS(18),
  },
  subtitleHighlight: {
    color: "rgba(255,255,255,0.72)",
  },
});
