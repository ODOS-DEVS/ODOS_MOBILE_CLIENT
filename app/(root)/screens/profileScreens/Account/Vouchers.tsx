import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type VoucherStatus = "active" | "used" | "expired";
type VoucherFilter = "all" | VoucherStatus;

interface Voucher {
  id: string;
  store: string;
  title: string;
  rewardText: string;
  minSpend: string;
  expiry: string;
  code: string;
  status: VoucherStatus;
}

const vouchers: Voucher[] = [
  {
    id: "v-1",
    store: "Zara Store",
    title: "Weekend Voucher",
    rewardText: "GHC 100 OFF",
    minSpend: "Min. spend GHC 450",
    expiry: "Valid until Dec 31, 2026",
    code: "ZAR-100-ODOS",
    status: "active",
  },
  {
    id: "v-2",
    store: "Topman Store",
    title: "Free Delivery Pass",
    rewardText: "FREE DELIVERY",
    minSpend: "No minimum spend",
    expiry: "Valid until Nov 21, 2026",
    code: "SHIP-FREE-21",
    status: "active",
  },
  {
    id: "v-3",
    store: "Gucci Store",
    title: "Member Cashback",
    rewardText: "10% CASHBACK",
    minSpend: "Min. spend GHC 700",
    expiry: "Used on Oct 09, 2026",
    code: "GC-CASH-10",
    status: "used",
  },
  {
    id: "v-4",
    store: "Wheel Store",
    title: "Holiday Voucher",
    rewardText: "GHC 60 OFF",
    minSpend: "Min. spend GHC 300",
    expiry: "Expired on Jan 02, 2026",
    code: "WHL-60-HLD",
    status: "expired",
  },
];

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

export default function VouchersScreen() {
  const [activeFilter, setActiveFilter] = useState<VoucherFilter>("all");

  const filteredVouchers = useMemo(() => {
    if (activeFilter === "all") return vouchers;
    return vouchers.filter((item) => item.status === activeFilter);
  }, [activeFilter]);

  const activeCount = useMemo(
    () => vouchers.filter((item) => item.status === "active").length,
    []
  );
  const usedCount = useMemo(
    () => vouchers.filter((item) => item.status === "used").length,
    []
  );
  const expiredCount = useMemo(
    () => vouchers.filter((item) => item.status === "expired").length,
    []
  );

  return (
    <View style={styles.container}>
      <ProfileHeader title="My Vouchers" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Wallet Benefits</Text>
          <Text style={styles.summarySub}>
            Use active vouchers at checkout to unlock instant savings.
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
          <View style={styles.emptyWrap}>
            <Ionicons
              name="ticket-outline"
              size={rMS(34)}
              color={AppColors.subtext[100]}
            />
            <Text style={styles.emptyTitle}>No vouchers here yet</Text>
            <Text style={styles.emptySub}>
              New vouchers will appear when available for this category.
            </Text>
          </View>
        ) : (
          filteredVouchers.map((voucher) => {
            const meta = statusMeta[voucher.status];
            const isActive = voucher.status === "active";

            return (
              <View key={voucher.id} style={styles.voucherCard}>
                <View style={styles.cardTop}>
                  <View style={styles.storeBadge}>
                    <Ionicons
                      name="storefront-outline"
                      size={rMS(14)}
                      color={AppColors.secondary}
                    />
                    <Text style={styles.storeBadgeText}>{voucher.store}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: meta.badgeBg }]}>
                    <Text style={[styles.statusText, { color: meta.badgeText }]}>
                      {meta.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.voucherTitle}>{voucher.title}</Text>
                <Text style={styles.rewardText}>{voucher.rewardText}</Text>
                <Text style={styles.metaText}>{voucher.minSpend}</Text>

                <View style={styles.separator} />

                <View style={styles.metaRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={rMS(14)}
                    color={AppColors.subtext[100]}
                  />
                  <Text style={styles.metaText}>{voucher.expiry}</Text>
                </View>

                <View style={styles.codeRow}>
                  <View style={styles.codeBox}>
                    <Text style={styles.codeLabel}>Code</Text>
                    <Text style={styles.codeText}>{voucher.code}</Text>
                  </View>
                  <TouchableOpacity style={styles.copyBtn} activeOpacity={0.8}>
                    <Ionicons name="copy-outline" size={rMS(16)} color={AppColors.text} />
                  </TouchableOpacity>
                </View>

                {isActive ? (
                  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
                    <Text style={styles.actionBtnText}>Use Voucher</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: rMS(20),
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
    borderWidth: 1,
    borderColor: "#E9ECEF",
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
  copyBtn: {
    width: rMS(38),
    height: rMS(38),
    borderRadius: rMS(10),
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    justifyContent: "center",
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
    borderWidth: 1,
    borderColor: "#E9ECEF",
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
