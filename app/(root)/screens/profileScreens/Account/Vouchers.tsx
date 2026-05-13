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

  return `Min. spend GHS ${amount.toFixed(2)}`;
}

export default function VouchersScreen() {
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
    <View style={styles.container}>
      <ProfileHeader
        title="My Vouchers"
        fallbackHref={fromCheckout ? ("/(root)/(tabs)/cart" as any) : "/(root)/(tabs)/profile"}
      />

      {isLoadingVouchers ? (
        <ScreenLoader label="Loading vouchers..." />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.summaryCard} className="shadow-sm">
            <Text style={styles.summaryTitle}>Wallet Benefits</Text>
            <Text style={styles.summarySub}>
              Save ODOS promotions and store offers here. Gift cards stay separate so wallet value and discounts never get mixed up.
            </Text>
            <View style={styles.summaryStatsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activeCount}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usedCount}</Text>
                <Text style={styles.statLabel}>Used</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{expiredCount}</Text>
                <Text style={styles.statLabel}>Expired</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionSwitchRow}>
            <TouchableOpacity
              style={[
                styles.sectionSwitchBtn,
                activeSection === "promotions" && styles.sectionSwitchBtnActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setActiveSection("promotions")}
            >
              <Text
                style={[
                  styles.sectionSwitchText,
                  activeSection === "promotions" && styles.sectionSwitchTextActive,
                ]}
              >
                Promotions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sectionSwitchBtn,
                activeSection === "gift_cards" && styles.sectionSwitchBtnActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setActiveSection("gift_cards")}
            >
              <Text
                style={[
                  styles.sectionSwitchText,
                  activeSection === "gift_cards" && styles.sectionSwitchTextActive,
                ]}
              >
                Gift Cards
              </Text>
            </TouchableOpacity>
          </View>

          {activeSection === "promotions" ? (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {filters.map((item) => {
                  const isActive = item.key === activeFilter;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                      onPress={() => setActiveFilter(item.key)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          isActive && styles.filterTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {filteredVouchers.length === 0 ? (
                <View style={styles.emptyWrap} className="shadow-sm">
                  <Ionicons
                    name="ticket-outline"
                    size={rMS(34)}
                    color={AppColors.subtext[100]}
                  />
                  <Text style={styles.emptyTitle}>No promotions here yet</Text>
                  <Text style={styles.emptySub}>
                    Claimed store offers and active ODOS promos will show up here.
                  </Text>
                </View>
              ) : (
                filteredVouchers.map((voucher) => {
                  const meta = statusMeta[voucher.status];
                  const isActive = voucher.status === "active";
                  const isSelected = checkoutVoucherCode === voucher.code;

                  return (
                    <View key={voucher.id} style={styles.voucherCard} className="shadow-sm">
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
                        <View style={[styles.statusBadge, { backgroundColor: meta.badgeBg }]}>
                          <Text style={[styles.statusText, { color: meta.badgeText }]}>
                            {meta.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.voucherTitle}>{voucher.title}</Text>
                      <Text style={styles.rewardText}>{voucher.rewardText}</Text>
                      <Text style={styles.metaText}>{formatMinSpend(voucher.minSubtotal)}</Text>
                      <Text style={styles.metaText}>
                        {voucher.scope === "store" ? "Store promotion" : "ODOS promotion"} ·{" "}
                        {voucher.availability === "assigned"
                          ? "Gifted"
                          : voucher.availability === "claim"
                            ? "Claimed"
                            : "Always available"}
                      </Text>
                      {voucher.description ? (
                        <Text style={styles.descriptionText}>{voucher.description}</Text>
                      ) : null}

                      <View style={styles.separator} />

                      <View style={styles.metaRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={rMS(14)}
                          color={AppColors.subtext[100]}
                        />
                        <Text style={styles.metaText}>{formatExpiry(voucher.expiresAt)}</Text>
                      </View>

                      <View style={styles.codeRow}>
                        <View style={styles.codeBox}>
                          <Text style={styles.codeLabel}>Code</Text>
                          <Text style={styles.codeText}>{voucher.code}</Text>
                        </View>
                        {isSelected ? (
                          <View style={styles.selectedPill}>
                            <Ionicons
                              name="checkmark-circle"
                              size={rMS(16)}
                              color="#166534"
                            />
                            <Text style={styles.selectedPillText}>Selected</Text>
                          </View>
                        ) : null}
                      </View>

                      {isActive ? (
                        <TouchableOpacity
                          style={styles.actionBtn}
                          activeOpacity={0.85}
                          onPress={() => handleUseVoucher(voucher)}
                        >
                          <Text style={styles.actionBtnText}>
                            {fromCheckout ? "Use Promotion" : "Save for Checkout"}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  );
                })
              )}
            </>
          ) : (
            <View style={styles.emptyWrap} className="shadow-sm">
              <Ionicons
                name="card-outline"
                size={rMS(34)}
                color={AppColors.subtext[100]}
              />
              <Text style={styles.emptyTitle}>Gift cards are next</Text>
              <Text style={styles.emptySub}>
                ODOS gift cards will live here as stored value, separate from discount promotions.
              </Text>
            </View>
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
    borderRadius: rMS(16),
    padding: rS(14),
    marginBottom: rV(12),
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rV(8),
  },
  storeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    backgroundColor: "#EEF2F5",
    borderRadius: rMS(10),
    paddingHorizontal: rS(8),
    paddingVertical: rV(5),
  },
  storeBadgeText: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: AppColors.secondary,
  },
  statusBadge: {
    borderRadius: rMS(999),
    paddingHorizontal: rS(10),
    paddingVertical: rV(4),
  },
  statusText: {
    fontSize: rMS(10),
    fontFamily: Fonts.textBold,
  },
  voucherTitle: {
    fontSize: rMS(15),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  rewardText: {
    marginTop: rV(5),
    fontSize: rMS(22),
    fontFamily: Fonts.black,
    color: AppColors.text,
  },
  metaText: {
    marginTop: rV(4),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
  },
  descriptionText: {
    marginTop: rV(8),
    fontSize: rMS(12),
    lineHeight: rMS(18),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  separator: {
    marginVertical: rV(12),
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
    borderStyle: "dashed",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
  },
  codeRow: {
    marginTop: rV(10),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
  },
  codeBox: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: rMS(10),
    paddingHorizontal: rS(10),
    paddingVertical: rV(9),
  },
  codeLabel: {
    fontSize: rMS(10),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
  },
  codeText: {
    marginTop: rV(2),
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
    letterSpacing: 0.6,
  },
  selectedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    paddingHorizontal: rS(10),
    paddingVertical: rV(8),
    borderRadius: rMS(10),
    backgroundColor: "#DCFCE7",
  },
  selectedPillText: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: "#166534",
  },
  actionBtn: {
    marginTop: rV(12),
    borderRadius: rMS(12),
    backgroundColor: AppColors.text,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(12),
  },
  actionBtnText: {
    fontSize: rMS(14),
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
