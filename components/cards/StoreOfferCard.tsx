import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import type { StoreVoucherOffer } from "@/hooks/useVouchers";
import { productCardGapX, rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

function formatExpiry(value?: string | null) {
  if (!value) {
    return "No expiry";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

type Props = {
  offer: StoreVoucherOffer;
  isBusy?: boolean;
  onClaim: (offer: StoreVoucherOffer) => void;
  onUse: (offer: StoreVoucherOffer) => void;
};

export default function StoreOfferCard({ offer, isBusy, onClaim, onUse }: Props) {
  const isClaimable = offer.availability === "claim" || offer.availability === "auto";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.pill}>
          <Ionicons name="sparkles-outline" size={rMS(13)} color={AppColors.primary} />
          <Text style={styles.pillText}>
            {offer.availability === "assigned" ? "Gifted offer" : "Store offer"}
          </Text>
        </View>
        <Text style={styles.code}>{offer.code}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {offer.title}
      </Text>
      <Text style={styles.reward}>{offer.rewardText}</Text>
      <Text style={styles.meta}>Min. spend GHS {offer.minSubtotal.toFixed(2)}</Text>
      {offer.description ? (
        <Text style={styles.description} numberOfLines={3}>
          {offer.description}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.expiryLabel}>Valid</Text>
          <Text style={styles.expiryValue}>{formatExpiry(offer.expiresAt)}</Text>
        </View>

        {offer.claimed ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDark]}
            activeOpacity={0.88}
            onPress={() => onUse(offer)}
          >
            <Text style={styles.actionTextDark}>Use</Text>
          </TouchableOpacity>
        ) : isClaimable ? (
          <TouchableOpacity
            style={[styles.actionButton, isBusy && styles.actionButtonDisabled]}
            activeOpacity={0.88}
            onPress={() => onClaim(offer)}
            disabled={isBusy}
          >
            <Text style={styles.actionText}>{isBusy ? "Saving..." : "Save offer"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: rS(228),
    marginRight: productCardGapX(),
    marginTop: rV(12),
    marginBottom: rV(8),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    borderRadius: rMS(20),
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: "#E7EBF0",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(10),
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    paddingHorizontal: rS(9),
    paddingVertical: rV(5),
    borderRadius: rMS(999),
    backgroundColor: "#FFF6E6",
  },
  pillText: {
    color: AppColors.primary,
    fontFamily: Fonts.title,
    fontSize: rMS(10),
  },
  code: {
    color: AppColors.secondary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(10.5),
    letterSpacing: 0.5,
  },
  title: {
    marginTop: rV(12),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15.5),
  },
  reward: {
    marginTop: rV(7),
    color: AppColors.text,
    fontFamily: Fonts.black,
    fontSize: rMS(20.5),
  },
  meta: {
    marginTop: rV(4),
    color: AppColors.subtext[100],
    fontFamily: Fonts.text,
    fontSize: rMS(11),
  },
  description: {
    marginTop: rV(8),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(11.25),
    lineHeight: rMS(17),
  },
  footerRow: {
    marginTop: rV(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(10),
  },
  expiryLabel: {
    color: AppColors.subtext[100],
    fontFamily: Fonts.text,
    fontSize: rMS(10),
    textTransform: "uppercase",
  },
  expiryValue: {
    marginTop: rV(3),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.25),
  },
  actionButton: {
    minWidth: rS(86),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(14),
    paddingVertical: rV(9),
    borderRadius: rMS(999),
    backgroundColor: AppColors.primary,
  },
  actionButtonDark: {
    backgroundColor: AppColors.text,
  },
  actionButtonDisabled: {
    opacity: 0.65,
  },
  actionText: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
  },
  actionTextDark: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
  },
});
