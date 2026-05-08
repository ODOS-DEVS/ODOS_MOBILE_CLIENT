import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type LoaderPanelProps = {
  label: string;
  sublabel?: string;
};

export default function LoaderPanel({
  label,
  sublabel,
}: LoaderPanelProps) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="small" color={AppColors.primary} />
      <Text style={styles.label}>{label}</Text>
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(20),
    paddingVertical: rV(12),
  },
  label: {
    marginTop: rV(10),
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(14),
    textAlign: "center",
  },
  sublabel: {
    marginTop: rV(6),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    textAlign: "center",
  },
});
