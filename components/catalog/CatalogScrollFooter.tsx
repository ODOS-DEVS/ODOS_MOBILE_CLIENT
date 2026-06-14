import { AppColors } from "@/constants/Colors";
import { rV } from "@/styles/responsive";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type CatalogScrollFooterProps = {
  isLoadingMore?: boolean;
};

export default function CatalogScrollFooter({ isLoadingMore }: CatalogScrollFooterProps) {
  if (!isLoadingMore) {
    return null;
  }

  return (
    <View style={styles.footer}>
      <ActivityIndicator color={AppColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(18),
  },
});
