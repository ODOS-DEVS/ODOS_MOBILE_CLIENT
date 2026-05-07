import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCard({ hint, label, value }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: rS(140),
    backgroundColor: AppColors.white,
    borderRadius: rMS(20),
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  label: {
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  value: {
    marginTop: rV(8),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(24),
  },
  hint: {
    marginTop: rV(6),
    color: AppColors.subtext[100],
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
});
