import {
  AccountActionButton,
  AccountActionRow,
  AccountEmptyState,
  AccountInsightCard,
  AccountListCard,
  AccountSectionCard,
  useAccountStyles,
} from "@/components/account/AccountUi";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Fonts from "@/constants/Fonts";
import { lightTheme, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useVendorQuickAccess } from "@/hooks/useVendorQuickAccess";
import type { VendorStatus } from "@/types/vendor";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { StatusBadge } from "./StatusBadge";
import { StatCard } from "./StatCard";
import { QuickActionCard } from "./QuickActionCard";
import { VendorEmptyState } from "./VendorEmptyState";

export {
  AccountActionButton,
  AccountActionRow,
  AccountEmptyState,
  AccountInsightCard,
  AccountListCard,
  AccountSectionCard,
  useAccountStyles,
  StatCard,
  QuickActionCard,
  StatusBadge,
  VendorEmptyState,
};

// `vendorStyles` is imported by many vendor screens for layout-only keys
// (content, contentWrap, listContent, sectionBlock, actionsGrid, statsRow),
// so it stays a plain static export seeded from `lightTheme`. The handful of
// color-bearing keys (sectionEyebrow/sectionTitle/sectionDescription/
// errorText/headerAction) are only consumed by components defined in this
// file, which instead build a live, theme-aware copy via `createVendorStyles`
// so they render correctly in dark mode.
function createVendorStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      paddingHorizontal: rS(16),
      paddingTop: rV(14),
      gap: rV(12),
    },
    contentWrap: {
      width: "100%",
      alignSelf: "center",
      gap: rV(12),
    },
    listContent: {
      paddingHorizontal: rS(16),
      paddingTop: rV(12),
      gap: rV(12),
      flexGrow: 1,
    },
    sectionBlock: {
      gap: rV(10),
    },
    sectionEyebrow: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11),
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    sectionTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(17),
      color: colors.text,
    },
    sectionDescription: {
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      lineHeight: rMS(19),
      color: colors.textMuted,
    },
    errorText: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.dangerText,
    },
    headerAction: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.primary,
    },
    actionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: rS(12),
    },
    statsRow: {
      flexDirection: "row",
      gap: rS(12),
    },
  });
}

export const vendorStyles = createVendorStyles(lightTheme);

export function formatVendorCurrency(value: number, currency = "GHS") {
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function VendorSettingsButton() {
  const { openSettings } = useVendorQuickAccess();
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={openSettings} activeOpacity={0.82}>
      <Ionicons name="settings-outline" size={rMS(20)} color={colors.text} />
    </TouchableOpacity>
  );
}

type VendorScreenShellProps = {
  title: string;
  children?: React.ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  rightNode?: React.ReactNode;
  showSettings?: boolean;
  showBackButton?: boolean;
};

export function VendorScreenShell({
  title,
  children,
  loading = false,
  loadingLabel = "Loading...",
  rightNode,
  showSettings = true,
  showBackButton = true,
}: VendorScreenShellProps) {
  const { colors } = useTheme();
  return (
    <View style={[vendorStyles.screen, { backgroundColor: colors.screen }]}>
      <ProfileHeader
        title={title}
        showBackButton={showBackButton}
        rightNode={rightNode ?? (showSettings ? <VendorSettingsButton /> : null)}
      />
      {loading ? <ScreenLoader label={loadingLabel} /> : children}
    </View>
  );
}

type VendorPageIntroProps = {
  title: string;
  subtitle: string;
  stats?: Array<{ value: string | number; label: string }>;
  error?: string | null;
};

export function VendorPageIntro({ title, subtitle, stats, error }: VendorPageIntroProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createVendorStyles(colors), [colors]);
  return (
    <View style={{ gap: rV(10) }}>
      <AccountInsightCard title={title} subtitle={subtitle} stats={stats} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

type VendorSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function VendorSectionHeader({ eyebrow, title, description }: VendorSectionHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createVendorStyles(colors), [colors]);
  return (
    <View style={styles.sectionBlock}>
      {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
      {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
    </View>
  );
}

type VendorHeroCardProps = {
  storeName: string;
  businessName: string;
  status: VendorStatus;
  category: string;
  location: string;
  totalSalesLabel: string;
  completedOrders: number;
  error?: string | null;
};

export function VendorHeroCard({
  storeName,
  businessName,
  status,
  category,
  location,
  totalSalesLabel,
  completedOrders,
  error,
}: VendorHeroCardProps) {
  const { colors } = useTheme();
  const heroStyles = useMemo(() => createHeroStyles(colors), [colors]);
  return (
    <View style={heroStyles.card}>
      <View style={heroStyles.header}>
        <View style={heroStyles.copy}>
          <Text style={heroStyles.overline}>Store overview</Text>
          <Text style={heroStyles.title}>{storeName}</Text>
          <Text style={heroStyles.body}>{businessName}</Text>
        </View>
        <StatusBadge status={status} />
      </View>
      <View style={heroStyles.pills}>
        <View style={heroStyles.pill}>
          <Text style={heroStyles.pillText}>{category}</Text>
        </View>
        <View style={heroStyles.pill}>
          <Text style={heroStyles.pillText}>{location}</Text>
        </View>
      </View>
      <View style={heroStyles.metrics}>
        <View style={heroStyles.metric}>
          <Text style={heroStyles.metricLabel}>Total sales</Text>
          <Text style={heroStyles.metricValue}>{totalSalesLabel}</Text>
        </View>
        <View style={heroStyles.metric}>
          <Text style={heroStyles.metricLabel}>Delivered orders</Text>
          <Text style={heroStyles.metricValue}>{completedOrders}</Text>
        </View>
      </View>
      {error ? <Text style={heroStyles.error}>{error}</Text> : null}
    </View>
  );
}

type VendorFocusCardProps = {
  eyebrow: string;
  title: string;
  body: string;
  actionLabel: string;
  onPress: () => void;
};

export function VendorFocusCard({ eyebrow, title, body, actionLabel, onPress }: VendorFocusCardProps) {
  const { colors } = useTheme();
  const focusStyles = useMemo(() => createFocusStyles(colors), [colors]);
  return (
    <AccountListCard style={focusStyles.card}>
      <Text style={focusStyles.eyebrow}>{eyebrow}</Text>
      <Text style={focusStyles.title}>{title}</Text>
      <Text style={focusStyles.body}>{body}</Text>
      <AccountActionButton label={actionLabel} variant="primary" onPress={onPress} />
    </AccountListCard>
  );
}

type VendorFinanceCardProps = {
  balanceLabel: string;
  body: string;
  metrics: Array<{ label: string; value: string }>;
  onOpenWallet: () => void;
  onReviewSettlements: () => void;
};

export function VendorFinanceCard({
  balanceLabel,
  body,
  metrics,
  onOpenWallet,
  onReviewSettlements,
}: VendorFinanceCardProps) {
  const { colors } = useTheme();
  const financeStyles = useMemo(() => createFinanceStyles(colors), [colors]);
  return (
    <AccountListCard>
      <Text style={financeStyles.overline}>Finance</Text>
      <Text style={financeStyles.title}>Payout-ready wallet balance</Text>
      <Text style={financeStyles.value}>{balanceLabel}</Text>
      <Text style={financeStyles.body}>{body}</Text>
      <View style={financeStyles.metrics}>
        {metrics.map((metric, index) => (
          <View
            key={metric.label}
            style={[
              financeStyles.metric,
              index < metrics.length - 1 && financeStyles.metricBorder,
            ]}
          >
            <Text style={financeStyles.metricLabel}>{metric.label}</Text>
            <Text style={financeStyles.metricValue}>{metric.value}</Text>
          </View>
        ))}
      </View>
      <AccountActionRow>
        <AccountActionButton label="Open wallet" variant="primary" onPress={onOpenWallet} />
        <AccountActionButton
          label="Order settlements"
          variant="secondary"
          onPress={onReviewSettlements}
        />
      </AccountActionRow>
    </AccountListCard>
  );
}

type VendorNavRowProps = {
  label: string;
  subtitle: string;
  onPress: () => void;
  isLast?: boolean;
};

export function VendorNavRow({ label, subtitle, onPress, isLast = false }: VendorNavRowProps) {
  const { colors } = useTheme();
  const navStyles = useMemo(() => createNavStyles(colors), [colors]);
  return (
    <TouchableOpacity
      style={[navStyles.row, !isLast && navStyles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.86}
    >
      <View style={navStyles.copy}>
        <Text style={navStyles.label}>{label}</Text>
        <Text style={navStyles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={rMS(18)} color={colors.iconMuted} />
    </TouchableOpacity>
  );
}

type VendorDetailRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

export function VendorDetailRow({ label, value, isLast = false }: VendorDetailRowProps) {
  const { colors } = useTheme();
  const detailStyles = useMemo(() => createDetailStyles(colors), [colors]);
  return (
    <View style={[detailStyles.row, !isLast && detailStyles.rowBorder]}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

type VendorStickyFooterProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function VendorStickyFooter({
  label,
  onPress,
  loading = false,
  disabled = false,
}: VendorStickyFooterProps) {
  const { colors } = useTheme();
  const footerStyles = useMemo(() => createFooterStyles(colors), [colors]);
  return (
    <View style={footerStyles.wrap}>
      <AccountActionButton
        label={loading ? "Saving..." : label}
        variant="primary"
        onPress={onPress}
        disabled={disabled || loading}
      />
    </View>
  );
}

export function VendorNoticeCard({ title, body }: { title: string; body: string }) {
  const { colors } = useTheme();
  const noticeStyles = useMemo(() => createNoticeStyles(colors), [colors]);
  return (
    <View style={noticeStyles.box}>
      <Text style={noticeStyles.title}>{title}</Text>
      <Text style={noticeStyles.body}>{body}</Text>
    </View>
  );
}

export function VendorHelpCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  const { colors } = useTheme();
  const helpStyles = useMemo(() => createHelpStyles(colors), [colors]);
  return (
    <AccountListCard>
      <Text style={helpStyles.eyebrow}>{eyebrow}</Text>
      <Text style={helpStyles.title}>{title}</Text>
      <Text style={helpStyles.body}>{body}</Text>
    </AccountListCard>
  );
}

export function VendorScrollBody({
  children,
  contentMaxWidth,
  bottomInset = 28,
  style,
}: {
  children: React.ReactNode;
  contentMaxWidth?: number;
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { horizontalPadding } = useResponsive();
  return (
    <View
      style={[
        vendorStyles.content,
        {
          paddingHorizontal: horizontalPadding,
          paddingBottom: bottomInset,
        },
        contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function createHeroStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.inverseSurface,
      borderRadius: rMS(24),
      paddingHorizontal: rS(20),
      paddingVertical: rV(20),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: rS(12),
    },
    copy: { flex: 1 },
    overline: {
      color: colors.mutedOnInverse,
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11),
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    title: {
      marginTop: rV(8),
      color: colors.onInverseSurface,
      fontFamily: Fonts.titleBold,
      fontSize: rMS(21),
    },
    body: {
      marginTop: rV(6),
      color: colors.onInverseSurface,
      fontFamily: Fonts.text,
      fontSize: rMS(13),
    },
    pills: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: rS(8),
      marginTop: rV(14),
    },
    pill: {
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.12)",
      paddingHorizontal: rS(12),
      paddingVertical: rV(6),
    },
    pillText: {
      color: "rgba(255,255,255,0.9)",
      fontFamily: Fonts.title,
      fontSize: rMS(11),
    },
    metrics: {
      flexDirection: "row",
      gap: rS(10),
      marginTop: rV(16),
    },
    metric: {
      flex: 1,
      borderRadius: rMS(18),
      backgroundColor: "rgba(255,255,255,0.08)",
      padding: rS(14),
    },
    metricLabel: {
      color: colors.mutedOnInverse,
      fontFamily: Fonts.text,
      fontSize: rMS(11.5),
    },
    metricValue: {
      marginTop: rV(6),
      color: colors.onInverseSurface,
      fontFamily: Fonts.titleBold,
      fontSize: rMS(15),
    },
    error: {
      marginTop: rV(10),
      color: colors.dangerText,
      fontFamily: Fonts.text,
      fontSize: rMS(12),
    },
  });
}

function createFocusStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.warningSoft,
      borderColor: colors.warningBorder,
    },
    eyebrow: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11),
      color: colors.warningText,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    title: {
      marginTop: rV(6),
      fontFamily: Fonts.titleBold,
      fontSize: rMS(16),
      color: colors.text,
    },
    body: {
      marginTop: rV(8),
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      lineHeight: rMS(19),
      color: colors.textSecondary,
    },
  });
}

function createFinanceStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overline: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11),
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    title: {
      marginTop: rV(6),
      fontFamily: Fonts.title,
      fontSize: rMS(14),
      color: colors.text,
    },
    value: {
      marginTop: rV(8),
      fontFamily: Fonts.titleBold,
      fontSize: rMS(28),
      color: colors.text,
    },
    body: {
      marginTop: rV(6),
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      lineHeight: rMS(18),
      color: colors.textMuted,
    },
    metrics: {
      marginTop: rV(16),
      borderRadius: rMS(18),
      backgroundColor: colors.surfaceSubtle,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: "hidden",
    },
    metric: {
      paddingHorizontal: rS(14),
      paddingVertical: rV(12),
    },
    metricBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    metricLabel: {
      fontFamily: Fonts.text,
      fontSize: rMS(11.5),
      color: colors.textMuted,
    },
    metricValue: {
      marginTop: rV(4),
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: colors.text,
    },
  });
}

function createNavStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: rV(14),
      gap: rS(12),
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    copy: { flex: 1, gap: rV(3) },
    label: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: colors.text,
    },
    subtitle: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      lineHeight: rMS(17),
      color: colors.textMuted,
    },
  });
}

function createDetailStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: rS(12),
      paddingVertical: rV(11),
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    label: {
      flex: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      color: colors.textMuted,
    },
    value: {
      flex: 1,
      textAlign: "right",
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12.5),
      color: colors.text,
    },
  });
}

function createFooterStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: rS(16),
      paddingTop: rV(10),
      paddingBottom: rV(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.screen,
    },
  });
}

function createNoticeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    box: {
      marginTop: rV(14),
      borderRadius: rMS(16),
      backgroundColor: colors.dangerSoft,
      paddingHorizontal: rS(14),
      paddingVertical: rV(14),
    },
    title: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12),
      color: colors.dangerText,
    },
    body: {
      marginTop: rV(6),
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      lineHeight: rMS(18),
      color: colors.dangerText,
    },
  });
}

function createHelpStyles(colors: ThemeColors) {
  return StyleSheet.create({
    eyebrow: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11),
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    title: {
      marginTop: rV(6),
      fontFamily: Fonts.titleBold,
      fontSize: rMS(15),
      color: colors.text,
    },
    body: {
      marginTop: rV(8),
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      lineHeight: rMS(20),
      color: colors.textMuted,
    },
  });
}
