import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { SkeletonBlock, SkeletonPulse } from "@/components/loaders/Skeleton";

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
      <SkeletonPulse style={styles.skeletonWrap}>
        <SkeletonBlock width="100%" height={rV(18)} radius={10} />
        <SkeletonBlock width="84%" height={rV(18)} radius={10} style={styles.mt8} />
        <SkeletonBlock width="52%" height={rV(18)} radius={10} style={styles.mt8} />
      </SkeletonPulse>
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
    width: "100%",
  },
  skeletonWrap: {
    width: "100%",
    gap: rV(8),
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
  mt8: {
    marginTop: rV(8),
  },
});
