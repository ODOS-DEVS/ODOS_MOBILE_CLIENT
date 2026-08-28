import { StatCard } from "@/components/vendor/StatCard";
import {
  formatVendorCurrency,
  VendorSectionHeader,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { VendorPromoOverview } from "@/services/vendorService";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  overview: VendorPromoOverview | null;
  isLoading?: boolean;
  error?: string | null;
  /** Server does not have the promo endpoint yet — render nothing at all. */
  isUnavailable?: boolean;
};

/** Rates arrive from the API already scaled to percent — never multiply again. */
function percent(value: number) {
  return `${value.toFixed(1)}%`;
}

/**
 * Campaign and voucher performance for this store.
 *
 * The funnel is: shoppers saw it (views) → tapped it (clicks) → used it
 * (redemptions). Discount given is what the promotions actually cost, taken
 * from recorded voucher redemptions rather than estimated from clicks.
 */
export default function VendorPromoPerformancePanel({
  overview,
  isLoading = false,
  error = null,
  isUnavailable = false,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Nothing to show, and nothing the vendor could do about it.
  if (isUnavailable) {
    return null;
  }

  const campaigns = overview?.channels.find((c) => c.entityType === "campaign");
  const vouchers = overview?.channels.find((c) => c.entityType === "voucher");

  const totalViews = (campaigns?.impressions ?? 0) + (vouchers?.impressions ?? 0);
  const totalClicks = (campaigns?.clicks ?? 0) + (vouchers?.clicks ?? 0);
  const clickRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

  const hasAnyActivity = totalViews > 0 || totalClicks > 0 || (overview?.totalRedemptions ?? 0) > 0;

  return (
    <View style={vendorStyles.sectionBlock}>
      <VendorSectionHeader
        eyebrow="Marketing"
        title="Promo performance"
        description="How your campaigns and vouchers are doing with shoppers."
      />

      {error ? (
        <View style={styles.noticeCard}>
          <Ionicons name="alert-circle-outline" size={rMS(16)} color={colors.dangerText} />
          <Text style={styles.noticeText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <StatCard label="Views" value={totalViews.toLocaleString()} />
        </View>
        <View style={styles.statCell}>
          <StatCard
            label="Clicks"
            value={totalClicks.toLocaleString()}
            hint={`${percent(clickRate)} of views`}
            tone="accent"
          />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <StatCard
            label="Redemptions"
            value={(overview?.totalRedemptions ?? 0).toLocaleString()}
            tone="success"
          />
        </View>
        <View style={styles.statCell}>
          <StatCard
            label="Discount given"
            value={formatVendorCurrency(overview?.totalDiscountGiven ?? 0)}
            hint="What your promos cost"
            tone="warning"
          />
        </View>
      </View>

      {overview && overview.topPerformers.length > 0 ? (
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Best performers</Text>
          {overview.topPerformers.slice(0, 5).map((performer, index) => (
            <View
              key={performer.entityId}
              style={[
                styles.listRow,
                index === Math.min(overview.topPerformers.length, 5) - 1 && styles.listRowLast,
              ]}
            >
              <View style={styles.listRowMain}>
                <Text style={styles.listRowLabel} numberOfLines={1}>
                  {performer.entityLabel}
                </Text>
                <Text style={styles.listRowMeta}>
                  {performer.impressions.toLocaleString()} views ·{" "}
                  {performer.clicks.toLocaleString()} clicks · {percent(performer.clickThroughRate)}
                </Text>
              </View>
              <View style={styles.listRowValue}>
                <Text style={styles.listRowStrong}>
                  {performer.redemptionCount > 0
                    ? `${performer.redemptionCount} used`
                    : `${performer.conversions} used`}
                </Text>
                {performer.totalDiscountAmount > 0 ? (
                  <Text style={styles.listRowMeta}>
                    {formatVendorCurrency(performer.totalDiscountAmount)}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : !isLoading && !hasAnyActivity ? (
        <View style={styles.emptyCard}>
          <Ionicons name="megaphone-outline" size={rMS(20)} color={colors.iconMuted} />
          <Text style={styles.emptyTitle}>No promo activity yet</Text>
          <Text style={styles.emptyBody}>
            Once shoppers see and tap your campaigns or vouchers in the app, their views, clicks
            and redemptions show up here.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    statsRow: {
      flexDirection: "row",
      gap: rS(10),
      marginTop: rV(10),
    },
    statCell: {
      flex: 1,
    },
    noticeCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(8),
      backgroundColor: colors.dangerSoft,
      borderRadius: rMS(12),
      paddingHorizontal: rS(12),
      paddingVertical: rV(10),
      marginTop: rV(10),
    },
    noticeText: {
      flex: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.dangerText,
    },
    listCard: {
      marginTop: rV(12),
      backgroundColor: colors.card,
      borderRadius: rMS(14),
      borderWidth: 1,
      borderColor: colors.cardBorder,
      paddingHorizontal: rS(14),
      paddingVertical: rV(6),
    },
    listTitle: {
      fontFamily: Fonts.title,
      fontSize: rMS(13),
      color: colors.text,
      paddingTop: rV(10),
      paddingBottom: rV(4),
    },
    listRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(10),
      paddingVertical: rV(11),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listRowLast: {
      borderBottomWidth: 0,
    },
    listRowMain: {
      flex: 1,
      gap: rV(3),
    },
    listRowLabel: {
      fontFamily: Fonts.title,
      fontSize: rMS(13),
      color: colors.text,
    },
    listRowMeta: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: colors.textMuted,
    },
    listRowValue: {
      alignItems: "flex-end",
      gap: rV(3),
    },
    listRowStrong: {
      fontFamily: Fonts.title,
      fontSize: rMS(13),
      color: colors.successText,
    },
    emptyCard: {
      marginTop: rV(12),
      alignItems: "center",
      gap: rV(6),
      backgroundColor: colors.surfaceMuted,
      borderRadius: rMS(14),
      paddingHorizontal: rS(18),
      paddingVertical: rV(20),
    },
    emptyTitle: {
      fontFamily: Fonts.title,
      fontSize: rMS(14),
      color: colors.text,
    },
    emptyBody: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      lineHeight: rMS(18),
      color: colors.textMuted,
      textAlign: "center",
    },
  });
}
