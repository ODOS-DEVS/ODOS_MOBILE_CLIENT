import ScreenLoader from "@/components/loaders/ScreenLoader";
import {
  AccountActionButton,
  AccountEmptyState,
  AccountListCard,
  StatusBadge,
  VendorDetailRow,
  VendorNoticeCard,
  VendorScreenShell,
  VendorSectionHeader,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { useVendorSession } from "@/hooks/useVendorSession";
import { useVendorStore } from "@/stores/vendorStore";
import { rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const statusCopy = {
  none: {
    title: "No vendor application yet",
    body: "You can submit a vendor application any time from this account. ODOS will review the business information before enabling store management.",
  },
  pending: {
    title: "Application received",
    body: "Your vendor request is queued. We'll keep this screen updated as soon as the review moves forward.",
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
    body: "Your previous submission wasn't approved yet. Review the feedback below, update the information, and apply again when ready.",
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

  const detailItems = [
    { label: "Business", value: vendorApplication?.businessName || vendorProfile?.businessName },
    { label: "Store", value: vendorApplication?.storeName || vendorProfile?.storeName },
    {
      label: "Category",
      value: vendorApplication?.businessCategory || vendorProfile?.businessCategory,
    },
    { label: "City", value: vendorApplication?.city },
    { label: "Region", value: vendorApplication?.region },
    {
      label: "Submitted",
      value: vendorApplication?.submittedAt
        ? new Date(vendorApplication.submittedAt).toLocaleDateString()
        : undefined,
    },
  ].filter((item) => Boolean(item.value)) as Array<{ label: string; value: string }>;

  const rejectionNote =
    vendorApplication?.rejectionReason || vendorProfile?.rejectionReason;

  const primaryLabel =
    vendorStatus === "approved"
      ? "Open Vendor Dashboard"
      : vendorStatus === "rejected"
        ? "Apply Again"
        : vendorStatus === "none"
          ? "Start Application"
          : "Update Application Details";

  if (isLoading && !vendorApplication && !vendorProfile) {
    return (
      <VendorScreenShell
        title="Vendor Status"
        showSettings={false}
        loading
        loadingLabel="Loading application status..."
      />
    );
  }

  return (
    <VendorScreenShell title="Vendor Status" showSettings={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          vendorStyles.content,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
      >
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <AccountListCard>
            <StatusBadge status={vendorStatus} />
            <VendorSectionHeader title={currentCopy.title} description={currentCopy.body} />
            {error ? <Text style={vendorStyles.errorText}>{error}</Text> : null}
          </AccountListCard>

          {vendorStatus === "none" ? (
            <AccountEmptyState
              icon="briefcase-outline"
              title="Start your vendor journey"
              message="ODOS keeps the customer and vendor experience on the same account. Apply once and come back here for review updates."
            />
          ) : (
            <AccountListCard>
              <VendorSectionHeader
                title="Application summary"
                description="Details from your latest vendor submission."
              />
              {detailItems.map((item, index) => (
                <VendorDetailRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  isLast={index === detailItems.length - 1 && !rejectionNote}
                />
              ))}
              {rejectionNote ? (
                <VendorNoticeCard title="Review note" body={rejectionNote} />
              ) : null}
            </AccountListCard>
          )}

          <AccountActionButton
            label={primaryLabel}
            variant="primary"
            onPress={() => {
              if (vendorStatus === "approved") {
                router.push("/vendor/dashboard" as any);
                return;
              }

              router.push("/vendor/apply" as any);
            }}
          />
        </View>
      </ScrollView>
    </VendorScreenShell>
  );
}
