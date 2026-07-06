import { AccountBadge } from "@/components/account/AccountUi";
import { AccountListCard } from "@/components/account/AccountUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { VendorFlashSaleNomination } from "@/types/store";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type VendorFlashSaleNominationCardProps = {
  nomination: VendorFlashSaleNomination;
};

function statusTone(status: string): "success" | "warning" | "neutral" {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  return "neutral";
}

export default function VendorFlashSaleNominationCard({
  nomination,
}: VendorFlashSaleNominationCardProps) {
  const { colors } = useTheme();

  return (
    <AccountListCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {nomination.productTitle || "Product nomination"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
            {nomination.eventTitle || "Open flash sale event"}
          </Text>
        </View>
        <AccountBadge label={nomination.status} tone={statusTone(nomination.status)} />
      </View>

      <View style={styles.metaRow}>
        {nomination.proposedPrice != null ? (
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            Flash price GHS {nomination.proposedPrice.toFixed(2)}
          </Text>
        ) : null}
        {nomination.proposedOldPrice != null ? (
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            Was GHS {nomination.proposedOldPrice.toFixed(2)}
          </Text>
        ) : null}
      </View>

      {nomination.reviewNotes ? (
        <Text style={[styles.reviewNotes, { color: colors.textSecondary }]}>
          {nomination.reviewNotes}
        </Text>
      ) : null}

      {nomination.productImageUrl ? (
        <Image source={{ uri: nomination.productImageUrl }} style={styles.image} />
      ) : null}
    </AccountListCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: rV(10),
    marginBottom: rV(10),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(10),
  },
  copy: {
    flex: 1,
    gap: rV(4),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    lineHeight: rMS(19),
  },
  subtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(12),
  },
  meta: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  reviewNotes: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
  image: {
    width: "100%",
    height: rV(120),
    borderRadius: rMS(14),
    backgroundColor: "#F3F4F6",
  },
});
