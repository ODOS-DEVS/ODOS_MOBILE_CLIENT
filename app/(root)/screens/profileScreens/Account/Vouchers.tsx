import {
  AccountActionButton,
  AccountBadge,
  AccountEmptyState,
  AccountFilterChips,
  AccountInsightCard,
  AccountListCard,
  AccountSegmentedTabs,
  useAccountStyles,
} from "@/components/account/AccountUi";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import {
  type VoucherStatus,
  type VoucherWalletItem,
  useVouchers,
} from "@/hooks/useVouchers";
import { rMS, rS, rV } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type VoucherFilter = "all" | VoucherStatus;
type WalletSection = "promotions" | "gift_cards";

const filters: { key: VoucherFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "used", label: "Used" },
  { key: "expired", label: "Expired" },
];

const statusMeta: Record<
  VoucherStatus,
  { label: string; badgeBg: string; badgeText: string }
> = {
  active: {
    label: "Active",
    badgeBg: "#DCFCE7",
    badgeText: "#166534",
  },
  used: {
    label: "Used",
    badgeBg: "#E5E7EB",
    badgeText: "#4B5563",
  },
  expired: {
    label: "Expired",
    badgeBg: "#FEE2E2",
    badgeText: "#B91C1C",
  },
};

function formatExpiry(value?: string | null) {
  if (!value) {
    return "No expiry date";
  }

  return `Valid until ${new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function formatMinSpend(amount: number) {
  if (amount <= 0) {
    return "No minimum spend";
  }

  return `Min. spend GH₵${amount.toFixed(2)}`;
}

function formatScopeLabel(voucher: VoucherWalletItem) {
  if (voucher.scope === "store") {
    return "Store offer";
  }
  if (voucher.scope === "category") {
    return "Category offer";
  }
  if (voucher.scope === "product") {
    return "Product offer";
  }
  return "Platform offer";
}

function formatAvailabilityLabel(voucher: VoucherWalletItem) {
  if (voucher.availability === "assigned") {
    return "Gifted offer";
  }
  if (voucher.availability === "claim") {
    return "Claimed";
  }
  return "Ready to use";
}

export default function VouchersScreen() {
  const accountStyles = useAccountStyles();
  const { showToast } = useToast();
  const params = useLocalSearchParams();
  const fromCheckout = params.fromCheckout === "1";
  const { checkoutVoucherCode, setCheckoutVoucherCode } = useProfile();
  const { vouchers, isLoadingVouchers } = useVouchers();
  const [activeFilter, setActiveFilter] = useState<VoucherFilter>("all");
  const [activeSection, setActiveSection] = useState<WalletSection>("promotions");

  const filteredVouchers = useMemo(() => {
    if (activeFilter === "all") {
      return vouchers;
    }

    return vouchers.filter((item) => item.status === activeFilter);
  }, [activeFilter, vouchers]);

  const activeCount = useMemo(
    () => vouchers.filter((item) => item.status === "active").length,
    [vouchers],
  );
  const usedCount = useMemo(
    () => vouchers.filter((item) => item.status === "used").length,
    [vouchers],
  );
  const expiredCount = useMemo(
    () => vouchers.filter((item) => item.status === "expired").length,
    [vouchers],
  );

  const handleUseVoucher = (voucher: VoucherWalletItem) => {
    setCheckoutVoucherCode(voucher.code);
    if (fromCheckout) {
      goBackOr(router, { fallback: "/(root)/(tabs)/cart" as any });
      return;
    }

    showToast(`${voucher.code} saved for your next checkout.`);
  };

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader
        title="My Vouchers"
        fallbackHref={fromCheckout ? ("/(root)/(tabs)/cart" as any) : "/(root)/(tabs)/profile"}
      />

      {isLoadingVouchers ? (
        <ScreenLoader label="Loading vouchers..." />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={accountStyles.content}
        >
          <AccountInsightCard
            title="Wallet benefits"
            subtitle="Keep ODOS promotions and store offers here. Gift cards stay separate from discount codes."
            stats={[
              { value: activeCount, label: "Active" },
              { value: usedCount, label: "Used" },
              { value: expiredCount, label: "Expired" },
            ]}
          />

          <AccountSegmentedTabs
            options={[
              { key: "promotions", label: "Promotions" },
              { key: "gift_cards", label: "Gift cards" },
            ]}
            activeKey={activeSection}
            onChange={setActiveSection}
          />

          {activeSection === "promotions" ? (
            <>
              <AccountFilterChips
                options={filters}
                activeKey={activeFilter}
                onChange={setActiveFilter}
              />

              {filteredVouchers.length === 0 ? (
                <AccountEmptyState
                  icon="ticket-outline"
                  title="No promotions here yet"
                  message="Claimed store offers and active ODOS promos will show up here."
                />
              ) : (
                filteredVouchers.map((voucher) => {
                  const meta = statusMeta[voucher.status];
                  const isActive = voucher.status === "active";
                  const isSelected = checkoutVoucherCode === voucher.code;

                  return (
                    <AccountListCard key={voucher.id}>
                      <View style={styles.cardTop}>
                        <View style={styles.storeBadge}>
                          <Ionicons
                            name={voucher.scope === "store" ? "storefront-outline" : "sparkles-outline"}
                            size={rMS(14)}
                            color={AppColors.secondary}
                          />
                          <Text style={styles.storeBadgeText}>
                            {voucher.scope === "store"
                              ? voucher.storeName ?? voucher.issuerName ?? "Store offer"
                              : voucher.issuerName ?? "ODOS"}
                          </Text>
                        </View>
                        <AccountBadge
                          label={meta.label}
                          tone={
                            voucher.status === "active"
                              ? "success"
                              : voucher.status === "used"
                                ? "neutral"
                                : "danger"
                          }
                        />
                      </View>

                      <View style={styles.heroRow}>
                        <View style={styles.heroTextBlock}>
                          <Text style={styles.voucherTitle} numberOfLines={2}>
                            {voucher.title}
                          </Text>
                          <Text style={styles.rewardText}>{voucher.rewardText}</Text>
                        </View>

                        <View style={styles.codeBadge}>
                          <Text style={styles.codeBadgeLabel}>Code</Text>
                          <Text style={styles.codeBadgeText}>{voucher.code}</Text>
                        </View>
                      </View>

                      <View style={styles.infoChipsRow}>
                        <View style={styles.infoChip}>
                          <Text style={styles.infoChipText}>
                            {formatMinSpend(voucher.minSubtotal)}
                          </Text>
                        </View>
                        <View style={[styles.infoChip, styles.infoChipMuted]}>
                          <Text style={[styles.infoChipText, styles.infoChipMutedText]}>
                            {formatScopeLabel(voucher)} · {formatAvailabilityLabel(voucher)}
                          </Text>
                        </View>
                      </View>

                      {voucher.description ? (
                        <Text style={styles.descriptionText} numberOfLines={2}>
                          {voucher.description}
                        </Text>
                      ) : null}

                      <View style={styles.footerRow}>
                        <View style={styles.expiryStack}>
                          <View style={styles.metaRow}>
                            <Ionicons
                              name="calendar-outline"
                              size={rMS(13)}
                              color={AppColors.subtext[100]}
                            />
                            <Text style={styles.metaText}>{formatExpiry(voucher.expiresAt)}</Text>
                          </View>
                        </View>

                        <View style={styles.footerActions}>
                          {isSelected ? (
                            <View style={styles.selectedPill}>
                              <Ionicons
                                name="checkmark-circle"
                                size={rMS(15)}
                                color="#166534"
                              />
                              <Text style={styles.selectedPillText}>Selected</Text>
                            </View>
                          ) : null}
                          {isActive ? (
                            <AccountActionButton
                              label={fromCheckout ? "Use at checkout" : "Save for checkout"}
                              variant="primary"
                              compact
                              onPress={() => handleUseVoucher(voucher)}
                            />
                          ) : null}
                        </View>
                      </View>
                    </AccountListCard>
                  );
                })
              )}
            </>
          ) : (
            <AccountEmptyState
              icon="card-outline"
              title="Gift cards are next"
              message="ODOS gift cards will live here as stored value, separate from discount promotions."
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
    paddingBottom: rV(28),
  },
  summaryCard: {
    borderRadius: rMS(18),
    padding: rS(16),
    backgroundColor: AppColors.secondary,
  },
  summaryTitle: {
    fontSize: rMS(17),
    fontFamily: Fonts.titleBold,
    color: AppColors.white,
  },
  summarySub: {
    marginTop: rV(6),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: "#E5E7EB",
    lineHeight: rMS(18),
  },
  summaryStatsRow: {
    marginTop: rV(14),
    borderRadius: rMS(12),
    backgroundColor: "rgba(255,255,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rV(10),
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: rMS(16),
    fontFamily: Fonts.titleBold,
    color: AppColors.white,
  },
  statLabel: {
    marginTop: rV(2),
    fontSize: rMS(11),
    fontFamily: Fonts.text,
    color: "#E5E7EB",
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  filterRow: {
    gap: rS(8),
    paddingVertical: rV(14),
  },
  sectionSwitchRow: {
    flexDirection: "row",
    gap: rS(8),
    marginTop: rV(14),
  },
  sectionSwitchBtn: {
    flex: 1,
    borderRadius: rMS(14),
    borderWidth: 1,
    borderColor: "#D7DDE5",
    backgroundColor: AppColors.white,
    paddingVertical: rV(12),
    alignItems: "center",
  },
  sectionSwitchBtnActive: {
    borderColor: AppColors.text,
    backgroundColor: AppColors.text,
  },
  sectionSwitchText: {
    fontSize: rMS(12.5),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  sectionSwitchTextActive: {
    color: AppColors.white,
  },
  filterBtn: {
    paddingHorizontal: rS(14),
    paddingVertical: rV(8),
    borderRadius: rMS(99),
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: AppColors.white,
  },
  filterBtnActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  filterText: {
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  filterTextActive: {
    color: AppColors.white,
  },
  voucherCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(18),
    paddingHorizontal: rS(13),
    paddingVertical: rV(13),
    marginBottom: rV(12),
    borderWidth: 1,
    borderColor: "#E8EDF3",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rV(10),
  },
  storeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    backgroundColor: "#F7F4ED",
    borderRadius: rMS(999),
    paddingHorizontal: rS(9),
    paddingVertical: rV(5),
  },
  storeBadgeText: {
    fontSize: rMS(10.5),
    fontFamily: Fonts.title,
    color: AppColors.secondary,
  },
  statusBadge: {
    borderRadius: rMS(999),
    paddingHorizontal: rS(9),
    paddingVertical: rV(4),
  },
  statusText: {
    fontSize: rMS(10),
    fontFamily: Fonts.textBold,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
  },
  heroTextBlock: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: rMS(14.5),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  rewardText: {
    marginTop: rV(4),
    fontSize: rMS(19.5),
    fontFamily: Fonts.black,
    color: AppColors.text,
  },
  codeBadge: {
    minWidth: rS(84),
    borderRadius: rMS(14),
    paddingHorizontal: rS(10),
    paddingVertical: rV(8),
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5EAF0",
    alignItems: "flex-start",
  },
  codeBadgeLabel: {
    fontSize: rMS(9.5),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  codeBadgeText: {
    marginTop: rV(2),
    fontSize: rMS(11.5),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
    letterSpacing: 0.5,
  },
  infoChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(7),
    marginTop: rV(8),
  },
  infoChip: {
    borderRadius: rMS(999),
    backgroundColor: "#F4F7FA",
    paddingHorizontal: rS(9),
    paddingVertical: rV(5),
  },
  infoChipMuted: {
    backgroundColor: "#FCF7EE",
  },
  infoChipText: {
    fontSize: rMS(10.5),
    fontFamily: Fonts.textBold,
    color: AppColors.secondary,
  },
  infoChipMutedText: {
    color: "#8A6D3B",
  },
  metaText: {
    fontSize: rMS(11.25),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
  },
  descriptionText: {
    marginTop: rV(8),
    fontSize: rMS(11.5),
    lineHeight: rMS(17),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
  },
  footerRow: {
    marginTop: rV(11),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(10),
  },
  expiryStack: {
    flex: 1,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: rS(8),
  },
  selectedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    paddingHorizontal: rS(9),
    paddingVertical: rV(7),
    borderRadius: rMS(999),
    backgroundColor: "#DCFCE7",
  },
  selectedPillText: {
    fontSize: rMS(10.5),
    fontFamily: Fonts.textBold,
    color: "#166534",
  },
  actionBtn: {
    borderRadius: rMS(999),
    backgroundColor: AppColors.text,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(16),
    paddingVertical: rV(9),
  },
  actionBtnText: {
    fontSize: rMS(11.5),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  emptyWrap: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(38),
    paddingHorizontal: rS(18),
  },
  emptyTitle: {
    marginTop: rV(8),
    fontSize: rMS(16),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  emptySub: {
    marginTop: rV(6),
    textAlign: "center",
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
    lineHeight: rMS(18),
  },
});
