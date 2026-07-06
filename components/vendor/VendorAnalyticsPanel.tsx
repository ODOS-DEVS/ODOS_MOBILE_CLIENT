import { formatVendorCurrency } from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { VendorAnalyticsInsights } from "@/types/vendor";
import { formatCompactCurrency } from "@/utils/vendorAnalytics";
import { resolveApiMediaUrl } from "@/utils/media";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type VendorAnalyticsPanelProps = {
  insights: VendorAnalyticsInsights;
  variant?: "compact" | "full";
  onPress?: () => void;
};

function TrendBars({
  insights,
  height = rV(56),
  compact = false,
  onHero = true,
}: {
  insights: VendorAnalyticsInsights;
  height?: number;
  compact?: boolean;
  onHero?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const maxSales = Math.max(...insights.dailyTrend.map((day) => day.sales), 1);

  return (
    <View
      style={[
        styles.trendWrap,
        compact && styles.trendWrapCompact,
        onHero ? styles.trendWrapHero : null,
      ]}
    >
      {insights.dailyTrend.map((day) => {
        const barHeight = Math.max(
          (day.sales / maxSales) * height,
          day.orders > 0 ? rV(6) : rV(3),
        );
        const isToday = day === insights.dailyTrend[insights.dailyTrend.length - 1];

        const trackColor = onHero
          ? "rgba(255,255,255,0.16)"
          : isDark
            ? colors.surfaceMuted
            : "#EEF2FF";

        const barColor = onHero
          ? isToday
            ? "#FFFFFF"
            : "rgba(255,255,255,0.58)"
          : isToday
            ? colors.primary
            : isDark
              ? "rgba(99, 102, 241, 0.72)"
              : "rgba(99, 102, 241, 0.42)";

        const labelColor = onHero
          ? isToday
            ? "#FFFFFF"
            : "rgba(255,255,255,0.78)"
          : isToday
            ? colors.primary
            : colors.textMuted;

        return (
          <View key={day.label} style={styles.trendColumn}>
            <View style={[styles.trendTrack, { height, backgroundColor: trackColor }]}>
              <View
                style={[
                  styles.trendBar,
                  {
                    height: barHeight,
                    backgroundColor: barColor,
                  },
                  onHero && isToday ? styles.trendBarTodayHero : null,
                ]}
              />
            </View>
            <Text style={[styles.trendLabel, { color: labelColor }]}>{day.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function MetricPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "accent" | "success" | "warning";
}) {
  const { colors, isDark } = useTheme();

  const palette =
    tone === "success"
      ? { bg: isDark ? "#14532D" : "#ECFDF3", text: isDark ? "#86EFAC" : "#166534" }
      : tone === "warning"
        ? { bg: isDark ? "#422006" : "#FFF7ED", text: isDark ? "#FCD34D" : "#B45309" }
        : tone === "accent"
          ? { bg: isDark ? "#1E1B4B" : "#EEF2FF", text: isDark ? "#C7D2FE" : colors.primary }
          : { bg: isDark ? colors.pill : "#F8FAFC", text: colors.text };

  return (
    <View style={[styles.metricPill, { backgroundColor: palette.bg }]}>
      <Text style={[styles.metricPillValue, { color: palette.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.metricPillLabel, { color: colors.textMuted }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function TopProductRow({
  rank,
  title,
  meta,
  imageUrl,
}: {
  rank: number;
  title: string;
  meta: string;
  imageUrl?: string | null;
}) {
  const { colors, isDark } = useTheme();
  const resolved = resolveApiMediaUrl(imageUrl) ?? imageUrl;

  return (
    <View style={styles.productRow}>
      <Text style={[styles.productRank, { color: colors.textMuted }]}>{rank}</Text>
      {resolved ? (
        <Image source={{ uri: resolved }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImageFallback, { backgroundColor: isDark ? colors.pill : "#EEF2FF" }]}>
          <Ionicons name="cube-outline" size={rMS(14)} color={colors.primary} />
        </View>
      )}
      <View style={styles.productCopy}>
        <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.productMeta, { color: colors.textMuted }]} numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </View>
  );
}

export default function VendorAnalyticsPanel({
  insights,
  variant = "compact",
  onPress,
}: VendorAnalyticsPanelProps) {
  const { colors, isDark } = useTheme();
  const { currency, period, operations, finance, catalog, topProducts } = insights;

  const heroGradient = isDark
    ? (["#312E81", "#1E1B4B"] as const)
    : (["#4338CA", "#6366F1"] as const);

  const headline = useMemo(() => {
    if (period.week.orders === 0) {
      return "No sales yet this week";
    }
    return `${period.week.orders} order${period.week.orders === 1 ? "" : "s"} · ${formatVendorCurrency(
      period.week.avgOrderValue,
      currency,
    )} avg`;
  }, [currency, period.week.avgOrderValue, period.week.orders]);

  const content = (
    <View style={[styles.shell, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
      <LinearGradient colors={heroGradient} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Last 7 days</Text>
            <Text style={styles.heroValue}>
              {formatCompactCurrency(period.week.sales, currency)}
            </Text>
            <Text style={styles.heroSub}>{headline}</Text>
          </View>
          {onPress ? (
            <View style={styles.heroAction}>
              <Ionicons name="arrow-forward" size={rMS(16)} color="#FFFFFF" />
            </View>
          ) : null}
        </View>
        <View style={styles.heroChartPanel}>
          <Text style={styles.heroChartTitle}>Daily sales</Text>
          <TrendBars
            insights={insights}
            height={rV(variant === "compact" ? 44 : 64)}
            compact={variant === "compact"}
            onHero
          />
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.metricRow}>
          <MetricPill
            label="Today"
            value={formatCompactCurrency(period.today.sales, currency)}
            tone="accent"
          />
          <MetricPill
            label="30 days"
            value={formatCompactCurrency(period.month.sales, currency)}
          />
          <MetricPill
            label="Ship rate"
            value={`${operations.fulfillmentRate}%`}
            tone={operations.fulfillmentRate >= 90 ? "success" : "warning"}
          />
        </View>

        {variant === "full" ? (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Store health</Text>
            </View>
            <View style={styles.metricRow}>
              <MetricPill label="Pending" value={String(operations.pending)} tone="warning" />
              <MetricPill label="Delivered" value={String(operations.delivered)} tone="success" />
              <MetricPill
                label="Returns"
                value={String(operations.openReturns)}
                tone={operations.openReturns > 0 ? "warning" : "default"}
              />
            </View>

            <View style={[styles.financeStrip, { backgroundColor: isDark ? colors.surfaceSubtle : "#F8FAFC" }]}>
              <View style={styles.financeItem}>
                <Text style={[styles.financeLabel, { color: colors.textMuted }]}>Wallet</Text>
                <Text style={[styles.financeValue, { color: colors.text }]}>
                  {formatCompactCurrency(finance.availableBalance, currency)}
                </Text>
              </View>
              <View style={[styles.financeDivider, { backgroundColor: colors.border }]} />
              <View style={styles.financeItem}>
                <Text style={[styles.financeLabel, { color: colors.textMuted }]}>Lifetime</Text>
                <Text style={[styles.financeValue, { color: colors.text }]}>
                  {formatCompactCurrency(finance.lifetimeEarnings, currency)}
                </Text>
              </View>
              <View style={[styles.financeDivider, { backgroundColor: colors.border }]} />
              <View style={styles.financeItem}>
                <Text style={[styles.financeLabel, { color: colors.textMuted }]}>Live SKUs</Text>
                <Text style={[styles.financeValue, { color: colors.text }]}>
                  {catalog.activeProducts}/{catalog.totalProducts || "—"}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        {topProducts.length > 0 ? (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {variant === "compact" ? "Top sellers" : "Top products · 30 days"}
              </Text>
            </View>
            {topProducts.slice(0, variant === "compact" ? 3 : 5).map((product, index) => (
              <TopProductRow
                key={product.productId}
                rank={index + 1}
                title={product.productTitle}
                imageUrl={product.productImageUrl}
                meta={`${product.unitsSold} sold · ${formatVendorCurrency(product.grossSales, currency)}`}
              />
            ))}
          </>
        ) : variant === "full" ? (
          <Text style={[styles.emptyCopy, { color: colors.textMuted }]}>
            Delivered orders will populate your product rankings here.
          </Text>
        ) : null}

        {insights.usedFallback && variant === "full" ? (
          <Text style={[styles.syncNote, { color: colors.textMuted }]}>
            Live sync pending — showing insights from your recent orders.
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: rMS(20),
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  hero: {
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
    paddingBottom: rV(14),
    gap: rV(12),
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
  },
  heroCopy: {
    flex: 1,
    gap: rV(4),
  },
  heroEyebrow: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    letterSpacing: 0.45,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.72)",
  },
  heroValue: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(28),
    lineHeight: rMS(32),
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  heroSub: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "rgba(255,255,255,0.86)",
  },
  heroAction: {
    width: rMS(32),
    height: rMS(32),
    borderRadius: rMS(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroChartPanel: {
    borderRadius: rMS(14),
    paddingHorizontal: rS(10),
    paddingTop: rV(10),
    paddingBottom: rV(8),
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.22)",
    gap: rV(8),
  },
  heroChartTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    letterSpacing: 0.35,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.82)",
  },
  trendWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: rS(6),
  },
  trendWrapCompact: {
    paddingTop: 0,
  },
  trendWrapHero: {
    paddingTop: 0,
  },
  trendColumn: {
    flex: 1,
    alignItems: "center",
    gap: rV(6),
  },
  trendTrack: {
    width: "100%",
    maxWidth: rS(28),
    borderRadius: rMS(6),
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  trendBar: {
    width: "100%",
    borderRadius: rMS(6),
  },
  trendBarTodayHero: {
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  trendLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10),
  },
  body: {
    paddingHorizontal: rS(14),
    paddingTop: rV(14),
    paddingBottom: rV(16),
    gap: rV(12),
  },
  metricRow: {
    flexDirection: "row",
    gap: rS(8),
  },
  metricPill: {
    flex: 1,
    borderRadius: rMS(14),
    paddingHorizontal: rS(10),
    paddingVertical: rV(10),
    gap: rV(2),
    minWidth: 0,
  },
  metricPillValue: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
    lineHeight: rMS(17),
  },
  metricPillLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(10.5),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
    lineHeight: rMS(18),
  },
  financeStrip: {
    flexDirection: "row",
    borderRadius: rMS(14),
    paddingVertical: rV(12),
    paddingHorizontal: rS(10),
  },
  financeItem: {
    flex: 1,
    alignItems: "center",
    gap: rV(3),
  },
  financeDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
  },
  financeLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(10.5),
  },
  financeValue: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12.5),
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
  },
  productRank: {
    width: rS(14),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    textAlign: "center",
  },
  productImage: {
    width: rMS(36),
    height: rMS(36),
    borderRadius: rMS(10),
  },
  productImageFallback: {
    width: rMS(36),
    height: rMS(36),
    borderRadius: rMS(10),
    alignItems: "center",
    justifyContent: "center",
  },
  productCopy: {
    flex: 1,
    minWidth: 0,
    gap: rV(2),
  },
  productTitle: {
    fontFamily: Fonts.title,
    fontSize: rMS(13),
    lineHeight: rMS(17),
  },
  productMeta: {
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
  emptyCopy: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    textAlign: "center",
    paddingVertical: rV(8),
  },
  syncNote: {
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
    lineHeight: rMS(16),
    textAlign: "center",
  },
});
