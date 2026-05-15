import ProfileHeader from "@/components/profile/ProfileHeader";
import { StatusBadge } from "@/components/vendor/StatusBadge";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VendorSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { hasVendorAccess, isCheckingVendorAccess, session, vendorStatus } =
    useRequireVendor();
  const { fetchStoreProfile, storeProfile } = useStoreStore();
  const { fetchVendorProfile, vendorProfile } = useVendorStore();

  useEffect(() => {
    if (!hasVendorAccess) {
      return;
    }

    void fetchVendorProfile(session);
    void fetchStoreProfile(session);
  }, [fetchStoreProfile, fetchVendorProfile, hasVendorAccess, session]);

  if (isCheckingVendorAccess || !hasVendorAccess) {
    return (
      <View style={styles.screen}>
        <ProfileHeader title="Vendor Settings" />
      </View>
    );
  }

  const actionItems = [
    {
      label: "Application Status",
      subtitle: "Review approval and vendor account state.",
      onPress: () => router.push("/vendor/application-status" as any),
    },
    {
      label: "Store Profile",
      subtitle: "Edit the storefront details customers can see.",
      onPress: () => router.push("/vendor/store" as any),
    },
    {
      label: "Products",
      subtitle: "Manage the product list and stock snapshot.",
      onPress: () => router.push("/vendor/products" as any),
    },
    {
      label: "Orders",
      subtitle: "Track fulfillment across vendor-only orders.",
      onPress: () => router.push("/vendor/orders" as any),
    },
    {
      label: "Admin Support",
      subtitle: "Chat with ODOS admin about approvals, payouts, or account help.",
      onPress: () =>
        router.push({
          pathname: "/screens/support/chat",
          params: {
            subject: "Vendor operations support",
            fallback: "/vendor/settings",
          },
        }),
    },
  ];

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Vendor Settings" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
      >
        <View style={[styles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <View style={styles.heroCard}>
            <StatusBadge status={vendorStatus} />
            <Text style={styles.heroTitle}>{vendorProfile?.businessName || "Vendor Profile"}</Text>
            <Text style={styles.heroBody}>
              {storeProfile?.name || "Store profile pending"}{storeProfile?.city ? ` • ${storeProfile.city}` : ""}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Account summary</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Business category</Text>
              <Text style={styles.detailValue}>
                {vendorProfile?.businessCategory || "Not set"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vendor contact</Text>
              <Text style={styles.detailValue}>
                {vendorProfile?.phoneNumber || "Not set"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Store status</Text>
              <Text style={styles.detailValue}>{storeProfile?.status || "Pending"}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Shortcuts</Text>
            {actionItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.actionRow}
                onPress={item.onPress}
                activeOpacity={0.82}
              >
                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                  <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  heroCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    marginBottom: rV(16),
  },
  heroTitle: {
    marginTop: rV(14),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
  },
  heroBody: {
    marginTop: rV(8),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    marginBottom: rV(16),
  },
  sectionTitle: {
    marginBottom: rV(12),
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(15),
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rS(12),
    paddingVertical: rV(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECEFF3",
  },
  detailLabel: {
    flex: 1,
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: rV(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECEFF3",
  },
  actionTextWrap: {
    flex: 1,
    paddingRight: rS(12),
  },
  actionLabel: {
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(14),
  },
  actionSubtitle: {
    marginTop: rV(4),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
  actionArrow: {
    color: AppColors.secondary,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(22),
  },
});
