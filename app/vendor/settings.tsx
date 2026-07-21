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
import { AccountSettingToggle } from "@/components/profile/ProfileHubUi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
import { switchWorkspaceMode } from "@/utils/workspaceNavigation";
import { rV, useResponsive } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VendorSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { showToast } = useToast();
  const { user, updateProfile, isUpdatingProfile } = useAuth();
  const { hasVendorAccess, isCheckingVendorAccess, session, vendorStatus } =
    useRequireVendor();
  const { fetchStoreProfile, storeProfile } = useStoreStore();
  const { fetchVendorProfile, vendorProfile } = useVendorStore();
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyInventory, setNotifyInventory] = useState(true);
  const [notifyReviews, setNotifyReviews] = useState(true);
  const [notifyPayouts, setNotifyPayouts] = useState(true);

  useEffect(() => {
    if (!hasVendorAccess) {
      return;
    }

    void fetchVendorProfile(session);
    void fetchStoreProfile(session);
  }, [fetchStoreProfile, fetchVendorProfile, hasVendorAccess, session]);

  useEffect(() => {
    if (!user) return;
    setNotifyOrders(user.vendor_notify_orders ?? user.vendor_order_notifications);
    setNotifyInventory(user.vendor_notify_inventory);
    setNotifyReviews(user.vendor_notify_reviews);
    setNotifyPayouts(user.vendor_notify_payouts);
  }, [user]);

  const saveSellerAlerts = async (
    next: Partial<{
      orders: boolean;
      inventory: boolean;
      reviews: boolean;
      payouts: boolean;
    }>,
  ) => {
    const orders = next.orders ?? notifyOrders;
    const inventory = next.inventory ?? notifyInventory;
    const reviews = next.reviews ?? notifyReviews;
    const payouts = next.payouts ?? notifyPayouts;

    if (next.orders != null) setNotifyOrders(next.orders);
    if (next.inventory != null) setNotifyInventory(next.inventory);
    if (next.reviews != null) setNotifyReviews(next.reviews);
    if (next.payouts != null) setNotifyPayouts(next.payouts);

    const result = await updateProfile({
      vendorNotifyOrders: orders,
      vendorOrderNotifications: orders,
      vendorNotifyInventory: inventory,
      vendorNotifyReviews: reviews,
      vendorNotifyPayouts: payouts,
    });

    if (!result.success) {
      showToast(
        result.message ||
          result.fieldErrors?.general ||
          "We couldn't save seller alert preferences.",
        "error",
      );
      if (user) {
        setNotifyOrders(user.vendor_notify_orders ?? user.vendor_order_notifications);
        setNotifyInventory(user.vendor_notify_inventory);
        setNotifyReviews(user.vendor_notify_reviews);
        setNotifyPayouts(user.vendor_notify_payouts);
      }
      return;
    }

    showToast("Seller alert preferences updated.");
  };

  if (isCheckingVendorAccess || !hasVendorAccess) {
    return <VendorScreenShell title="Seller Settings" showSettings={false} />;
  }

  const storeSubtitle = [
    storeProfile?.name || "Store profile pending",
    storeProfile?.city,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <VendorScreenShell title="Seller Settings" showSettings={false}>
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
            title={vendorProfile?.businessName || "Seller profile"}
            subtitle={storeSubtitle}
          />
          <View style={{ alignSelf: "flex-start" }}>
            <StatusBadge status={vendorStatus} />
          </View>

          <AccountListCard>
            <VendorSectionHeader
              title="Business information"
              description="Details on file with ODOS for your seller account."
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
              title="Seller alerts"
              description="Control push and in-app alerts for your store operations."
            />
            <AccountSettingToggle
              title="Orders & reminders"
              description="New orders and unfulfilled reminders."
              value={notifyOrders}
              disabled={isUpdatingProfile}
              onValueChange={(value) => void saveSellerAlerts({ orders: value })}
            />
            <AccountSettingToggle
              title="Inventory"
              description="Low stock and out-of-stock alerts."
              value={notifyInventory}
              disabled={isUpdatingProfile}
              onValueChange={(value) => void saveSellerAlerts({ inventory: value })}
            />
            <AccountSettingToggle
              title="Reviews"
              description="New product review alerts when available."
              value={notifyReviews}
              disabled={isUpdatingProfile}
              onValueChange={(value) => void saveSellerAlerts({ reviews: value })}
            />
            <AccountSettingToggle
              title="Payouts"
              description="Withdrawal approvals and payout status."
              value={notifyPayouts}
              disabled={isUpdatingProfile}
              onValueChange={(value) => void saveSellerAlerts({ payouts: value })}
              isLast
            />
          </AccountListCard>

          <AccountListCard>
            <VendorSectionHeader
              title="Store & catalog"
              description="Appearance, products, and inventory."
            />
            <VendorNavRow
              label="Store profile"
              subtitle="Logo, banner, description, location, and socials."
              onPress={() => router.push("/vendor/store" as any)}
            />
            <VendorNavRow
              label="Products"
              subtitle="Create, edit, hide, and publish listings."
              onPress={() => router.push("/vendor/products" as any)}
            />
            <VendorNavRow
              label="Inventory"
              subtitle="On hand, reserved, available, and stock history."
              onPress={() => router.push("/vendor/inventory" as any)}
              isLast
            />
          </AccountListCard>

          <AccountListCard>
            <VendorSectionHeader
              title="Orders & customers"
              description="Fulfillment, returns, and buyer history."
            />
            <VendorNavRow
              label="Orders"
              subtitle="New, active, and completed queues."
              onPress={() => router.push("/vendor/orders" as any)}
            />
            <VendorNavRow
              label="Returns"
              subtitle="Review and action return requests."
              onPress={() => router.push("/vendor/returns" as any)}
            />
            <VendorNavRow
              label="Customers"
              subtitle="Buyers who ordered from your store."
              onPress={() => router.push("/vendor/customers" as any)}
            />
            <VendorNavRow
              label="Reviews"
              subtitle="Product ratings and comments."
              onPress={() => router.push("/vendor/reviews" as any)}
            />
            <VendorNavRow
              label="Messages"
              subtitle="Shopper inbox conversations."
              onPress={() => router.push("/vendor/chats" as any)}
              isLast
            />
          </AccountListCard>

          <AccountListCard>
            <VendorSectionHeader
              title="Finance & growth"
              description="Payouts, analytics, and promotions."
            />
            <VendorNavRow
              label="Wallet & payouts"
              subtitle="Balances, withdrawals, and history."
              onPress={() => router.push("/vendor/wallet" as any)}
            />
            <VendorNavRow
              label="Analytics"
              subtitle="Sales trends and top products."
              onPress={() => router.push("/vendor/analytics" as any)}
            />
            <VendorNavRow
              label="Promotions"
              subtitle="Store vouchers and offers."
              onPress={() => router.push("/vendor/vouchers" as any)}
            />
            <VendorNavRow
              label="Campaigns"
              subtitle="Merchandising campaign opt-in status."
              onPress={() => router.push("/vendor/campaigns" as any)}
            />
            <VendorNavRow
              label="Flash sales"
              subtitle="Nominate products for featured events."
              onPress={() => router.push("/vendor/flash-sales" as any)}
              isLast
            />
          </AccountListCard>

          <AccountListCard>
            <VendorSectionHeader
              title="Account & support"
              description="Mode switching, notifications, and help."
            />
            <VendorNavRow
              label="Switch to shopping"
              subtitle="Browse and buy as a customer again."
              onPress={() => void switchWorkspaceMode("shop_and_sell")}
            />
            <VendorNavRow
              label="Notifications"
              subtitle="Device push preferences for shopping and selling."
              onPress={() =>
                router.push(
                  "/(root)/screens/profileScreens/personalization/Notification" as any,
                )
              }
            />
            <VendorNavRow
              label="Application status"
              subtitle="Vendor approval and account state."
              onPress={() => router.push("/vendor/application-status" as any)}
            />
            <VendorNavRow
              label="Admin support"
              subtitle="Chat with ODOS about payouts or account help."
              onPress={() =>
                router.push({
                  pathname: "/screens/support/chat",
                  params: {
                    subject: "Seller operations support",
                    fallback: "/vendor/settings",
                  },
                })
              }
              isLast
            />
          </AccountListCard>
        </View>
      </ScrollView>
    </VendorScreenShell>
  );
}
