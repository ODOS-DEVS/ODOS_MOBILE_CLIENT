import {
  AccountActionButton,
  AccountActionRow,
  AccountEmptyState,
  AccountInsightCard,
  AccountListCard,
  AccountSectionCard,
  accountStyles,
} from "@/components/account/AccountUi";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useVendorQuickAccess } from "@/hooks/useVendorQuickAccess";
import type { VendorStatus } from "@/types/vendor";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
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
  AccountEmptyState,
  AccountInsightCard,
  AccountListCard,
  AccountSectionCard,
  accountStyles,
  StatCard,
  QuickActionCard,
  StatusBadge,
  VendorEmptyState,
};

export const vendorStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
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
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
    color: AppColors.text,
  },
  sectionDescription: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
    color: "#6B7280",
  },
  errorText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#DC2626",
  },
  headerAction: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: AppColors.primary,
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

export function formatVendorCurrency(value: number, currency = "GHS") {
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function VendorSettingsButton() {
  const { openSettings } = useVendorQuickAccess();
  return (
    <TouchableOpacity onPress={openSettings} activeOpacity={0.82}>
      <Ionicons name="settings-outline" size={rMS(20)} color={AppColors.text} />
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
  return (
    <View style={vendorStyles.screen}>
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
  return (
    <View style={{ gap: rV(10) }}>
      <AccountInsightCard title={title} subtitle={subtitle} stats={stats} />
      {error ? <Text style={vendorStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

type VendorSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function VendorSectionHeader({ eyebrow, title, description }: VendorSectionHeaderProps) {
  return (
    <View style={vendorStyles.sectionBlock}>
      {eyebrow ? <Text style={vendorStyles.sectionEyebrow}>{eyebrow}</Text> : null}
      <Text style={vendorStyles.sectionTitle}>{title}</Text>
      {description ? <Text style={vendorStyles.sectionDescription}>{description}</Text> : null}
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
      <Ionicons name="chevron-forward" size={rMS(18)} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

type VendorDetailRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

export function VendorDetailRow({ label, value, isLast = false }: VendorDetailRowProps) {
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
  return (
    <View
      style={[
        vendorStyles.content,
        { paddingBottom: bottomInset },
        contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const heroStyles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.text,
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
    color: "#CBD5E1",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    marginTop: rV(8),
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(21),
  },
  body: {
    marginTop: rV(6),
    color: "#E2E8F0",
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
    color: "#94A3B8",
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
  metricValue: {
    marginTop: rV(6),
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
  },
  error: {
    marginTop: rV(10),
    color: "#FCA5A5",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
});

const focusStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  eyebrow: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    color: "#B45309",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  title: {
    marginTop: rV(6),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
  },
  body: {
    marginTop: rV(8),
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
    color: "#4B5563",
  },
});

const financeStyles = StyleSheet.create({
  overline: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  title: {
    marginTop: rV(6),
    fontFamily: Fonts.title,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  value: {
    marginTop: rV(8),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(28),
    color: AppColors.text,
  },
  body: {
    marginTop: rV(6),
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: "#6B7280",
  },
  metrics: {
    marginTop: rV(16),
    borderRadius: rMS(18),
    backgroundColor: "#F8FAFC",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  metric: {
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
  },
  metricBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  metricLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
    color: "#6B7280",
  },
  metricValue: {
    marginTop: rV(4),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
  },
});

const navStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rV(14),
    gap: rS(12),
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF2F6",
  },
  copy: { flex: 1, gap: rV(3) },
  label: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  subtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
    color: "#6B7280",
  },
});

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rS(12),
    paddingVertical: rV(11),
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF2F6",
  },
  label: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    color: "#6B7280",
  },
  value: {
    flex: 1,
    textAlign: "right",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12.5),
    color: AppColors.text,
  },
});

const footerStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: rS(16),
    paddingTop: rV(10),
    paddingBottom: rV(12),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#F5F7FA",
  },
});

const noticeStyles = StyleSheet.create({
  box: {
    marginTop: rV(14),
    borderRadius: rMS(16),
    backgroundColor: "#FEF2F2",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: "#991B1B",
  },
  body: {
    marginTop: rV(6),
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#7F1D1D",
  },
});

const helpStyles = StyleSheet.create({
  eyebrow: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  title: {
    marginTop: rV(6),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    color: AppColors.text,
  },
  body: {
    marginTop: rV(8),
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
    color: "#6B7280",
  },
});
