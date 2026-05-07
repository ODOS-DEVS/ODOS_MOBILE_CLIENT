import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { StatusBadge } from "@/components/vendor/StatusBadge";
import { VendorEmptyState } from "@/components/vendor/VendorEmptyState";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useVendorSession } from "@/hooks/useVendorSession";
import { useVendorStore } from "@/stores/vendorStore";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const statusCopy = {
  none: {
    title: "No vendor application yet",
    body: "You can submit a vendor application any time from this account. ODOS will review the business information before enabling store management.",
  },
  pending: {
    title: "Application received",
    body: "Your vendor request is queued. We’ll keep this screen updated as soon as the review moves forward.",
  },
  under_review: {
    title: "Under review",
    body: "The ODOS team is reviewing your store details. Make sure your contact number stays reachable in case clarifications are needed.",
  },
  approved: {
    title: "Vendor access approved",
    body: "Your account now includes vendor access. You can manage products, orders, and your storefront without creating a second login.",
  },
  rejected: {
    title: "Application needs changes",
    body: "Your previous submission wasn’t approved yet. Review the feedback below, update the information, and apply again when ready.",
  },
  suspended: {
    title: "Vendor access suspended",
    body: "The vendor profile still exists, but storefront actions are currently blocked until ODOS re-enables access.",
  },
};

export default function VendorApplicationStatusScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { isHydrating, session, user } = useVendorSession();
  const {
    error,
    isLoading,
    refreshVendorState,
    vendorApplication,
    vendorProfile,
    vendorStatus,
  } = useVendorStore();

  useFocusEffect(
    useCallback(() => {
      if (!isHydrating && !user) {
        router.replace("/(root)/(auth)/signin");
        return undefined;
      }

      if (user) {
        void refreshVendorState(session);
      }

      return undefined;
    }, [isHydrating, refreshVendorState, session, user]),
  );

  const currentCopy = useMemo(() => statusCopy[vendorStatus], [vendorStatus]);

  if (isLoading && !vendorApplication && !vendorProfile) {
    return (
      <View style={styles.screen}>
        <ProfileHeader title="Vendor Status" />
        <ScreenLoader label="Loading application status..." />
      </View>
    );
  }

  const detailItems = [
    { label: "Business", value: vendorApplication?.businessName || vendorProfile?.businessName },
    { label: "Store", value: vendorApplication?.storeName || vendorProfile?.storeName },
    { label: "Category", value: vendorApplication?.businessCategory || vendorProfile?.businessCategory },
    { label: "City", value: vendorApplication?.city },
    { label: "Region", value: vendorApplication?.region },
    {
      label: "Submitted",
      value: vendorApplication?.submittedAt
        ? new Date(vendorApplication.submittedAt).toLocaleDateString()
        : undefined,
    },
  ].filter((item) => Boolean(item.value));

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Vendor Status" />
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
            <Text style={styles.title}>{currentCopy.title}</Text>
            <Text style={styles.body}>{currentCopy.body}</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          {vendorStatus === "none" ? (
            <VendorEmptyState
              icon="briefcase-outline"
              title="Start your vendor journey"
              message="ODOS keeps the customer and vendor experience on the same account. Apply once and come back here for review updates."
            />
          ) : (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Application summary</Text>
              {detailItems.map((item) => (
                <View key={item.label} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              ))}
              {vendorApplication?.rejectionReason || vendorProfile?.rejectionReason ? (
                <View style={styles.noticeBox}>
                  <Text style={styles.noticeTitle}>Review note</Text>
                  <Text style={styles.noticeText}>
                    {vendorApplication?.rejectionReason || vendorProfile?.rejectionReason}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              if (vendorStatus === "approved") {
                router.push("/vendor/dashboard" as any);
                return;
              }

              router.push("/vendor/apply" as any);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonLabel}>
              {vendorStatus === "approved"
                ? "Open Vendor Dashboard"
                : vendorStatus === "rejected"
                  ? "Apply Again"
                  : vendorStatus === "none"
                    ? "Start Application"
                    : "Update Application Details"}
            </Text>
          </TouchableOpacity>
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
  title: {
    marginTop: rV(14),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
  },
  body: {
    marginTop: rV(8),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
  },
  error: {
    marginTop: rV(10),
    color: "#B91C1C",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
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
  noticeBox: {
    marginTop: rV(16),
    borderRadius: rMS(18),
    backgroundColor: "#FEF2F2",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
  },
  noticeTitle: {
    color: "#991B1B",
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
  noticeText: {
    marginTop: rV(6),
    color: "#7F1D1D",
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
  primaryButton: {
    backgroundColor: AppColors.primary,
    borderRadius: rMS(999),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(16),
  },
  primaryButtonLabel: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(14),
  },
});
