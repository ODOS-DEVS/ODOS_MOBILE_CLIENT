import {
  AccountInsightCard,
  AccountListCard,
  StatusBadge,
  VendorDetailRow,
  VendorNavRow,
  VendorScreenShell,
  VendorSectionHeader,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
import { rV, useResponsive } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";
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
    return <VendorScreenShell title="Vendor Settings" showSettings={false} />;
  }

  const actionItems = [
    {
      label: "Vendor Dashboard",
      subtitle: "Orders, sales, wallet balance, and quick store actions.",
      onPress: () => router.push("/vendor/dashboard" as any),
    },
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
      label: "Wallet",
      subtitle: "Payout details, balance, and withdrawal history.",
      onPress: () => router.push("/vendor/wallet" as any),
    },
    {
      label: "Promotions",
      subtitle: "Vouchers and offers for your store.",
      onPress: () => router.push("/vendor/vouchers" as any),
    },
    {
      label: "Flash sales",
      subtitle: "Nominate products for featured ODOS events.",
      onPress: () => router.push("/vendor/flash-sales" as any),
    },
    {
      label: "Shopper Chats",
      subtitle: "Reply to product questions and buying conversations.",
      onPress: () => router.push("/vendor/chats" as any),
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

  const storeSubtitle = [
    storeProfile?.name || "Store profile pending",
    storeProfile?.city,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <VendorScreenShell title="Vendor Settings" showSettings={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          vendorStyles.content,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
      >
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <AccountInsightCard
            title={vendorProfile?.businessName || "Vendor profile"}
            subtitle={storeSubtitle}
          />
          <View style={{ alignSelf: "flex-start" }}>
            <StatusBadge status={vendorStatus} />
          </View>

          <AccountListCard>
            <VendorSectionHeader
              title="Account summary"
              description="Business and storefront details on file with ODOS."
            />
            <VendorDetailRow
              label="Business category"
              value={vendorProfile?.businessCategory || "Not set"}
            />
            <VendorDetailRow
              label="Vendor contact"
              value={vendorProfile?.phoneNumber || "Not set"}
            />
            <VendorDetailRow
              label="Store status"
              value={storeProfile?.status || "Pending"}
              isLast
            />
          </AccountListCard>

          <AccountListCard>
            <VendorSectionHeader
              title="Shortcuts"
              description="Jump to the tools you use most as a vendor."
            />
            {actionItems.map((item, index) => (
              <VendorNavRow
                key={item.label}
                label={item.label}
                subtitle={item.subtitle}
                onPress={item.onPress}
                isLast={index === actionItems.length - 1}
              />
            ))}
          </AccountListCard>
        </View>
      </ScrollView>
    </VendorScreenShell>
  );
}
