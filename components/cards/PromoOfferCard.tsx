import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { StoreVoucherOffer } from "@/hooks/useVouchers";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
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

type PromoOfferCardProps = {
  offer: StoreVoucherOffer;
  isBusy?: boolean;
  compact?: boolean;
  onClaim?: (offer: StoreVoucherOffer) => void;
  onUse?: (offer: StoreVoucherOffer) => void;
};

export default function PromoOfferCard({
  offer,
  isBusy,
  compact = false,
  onClaim,
  onUse,
}: PromoOfferCardProps) {
  const { colors, isDark } = useTheme();
  const isClaimable = offer.availability === "claim" || offer.availability === "auto";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: compact ? rS(210) : rS(228),
          marginRight: rS(10),
          marginTop: rV(4),
          marginBottom: rV(8),
          paddingHorizontal: rS(14),
          paddingVertical: rV(14),
          borderRadius: rMS(20),
          backgroundColor: isDark ? colors.cardElevated : colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
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
          backgroundColor: isDark ? "#3F2E12" : "#FFF6E6",
        },
        pillText: {
          color: isDark ? "#FCD34D" : AppColors.primary,
          fontFamily: Fonts.title,
          fontSize: rMS(10),
        },
        code: {
          color: colors.textMuted,
          fontFamily: Fonts.textBold,
          fontSize: rMS(10.5),
          letterSpacing: 0.5,
        },
        title: {
          marginTop: rV(12),
          color: colors.text,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(compact ? 14 : 15.5),
        },
        reward: {
          marginTop: rV(7),
          color: colors.text,
          fontFamily: Fonts.black,
          fontSize: rMS(compact ? 18 : 20.5),
        },
        meta: {
          marginTop: rV(4),
          color: colors.textMuted,
          fontFamily: Fonts.text,
          fontSize: rMS(11),
        },
        description: {
          marginTop: rV(8),
          color: colors.textSecondary,
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
          color: colors.textMuted,
          fontFamily: Fonts.text,
          fontSize: rMS(10),
          textTransform: "uppercase",
        },
        expiryValue: {
          marginTop: rV(3),
          color: colors.text,
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
          backgroundColor: colors.primary,
        },
        actionButtonDark: {
          backgroundColor: colors.text,
        },
        actionButtonDisabled: {
          opacity: 0.65,
        },
        actionText: {
          color: colors.onPrimary,
          fontFamily: Fonts.textBold,
          fontSize: rMS(11),
        },
        actionTextDark: {
          color: isDark ? colors.screen : colors.inverseText,
          fontFamily: Fonts.textBold,
          fontSize: rMS(11),
        },
      }),
    [colors, compact, isDark],
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.pill}>
          <Ionicons
            name="pricetag-outline"
            size={rMS(13)}
            color={isDark ? "#FCD34D" : AppColors.primary}
          />
          <Text style={styles.pillText}>ODOS promo</Text>
        </View>
        <Text style={styles.code}>{offer.code}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {offer.title}
      </Text>
      <Text style={styles.reward}>{offer.rewardText}</Text>
      <Text style={styles.meta}>
        {offer.minSubtotal > 0
          ? `Min. spend ${offer.minSubtotal.toFixed(2)} GHS`
          : "No minimum spend"}
      </Text>
      {offer.description && !compact ? (
        <Text style={styles.description} numberOfLines={3}>
          {offer.description}
        </Text>
      ) : null}

      {onClaim || onUse ? (
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.expiryLabel}>Valid until</Text>
            <Text style={styles.expiryValue}>{formatExpiry(offer.expiresAt)}</Text>
          </View>

          {offer.claimed ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDark]}
              activeOpacity={0.88}
              onPress={() => onUse?.(offer)}
            >
              <Text style={styles.actionTextDark}>Use</Text>
            </TouchableOpacity>
          ) : isClaimable ? (
            <TouchableOpacity
              style={[styles.actionButton, isBusy && styles.actionButtonDisabled]}
              activeOpacity={0.88}
              onPress={() => onClaim?.(offer)}
              disabled={isBusy}
            >
              <Text style={styles.actionText}>{isBusy ? "Saving..." : "Save promo"}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <View style={{ marginTop: rV(12) }}>
          <Text style={styles.expiryLabel}>Valid until</Text>
          <Text style={styles.expiryValue}>{formatExpiry(offer.expiresAt)}</Text>
        </View>
      )}
    </View>
  );
}
