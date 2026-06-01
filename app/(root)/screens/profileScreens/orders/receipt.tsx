import ScreenLoader from "@/components/loaders/ScreenLoader";
import {
  AccountActionButton,
  AccountEmptyState,
  AccountIconShell,
  AccountListCard,
  AccountSectionCard,
  useAccountStyles,
  formatOrderDateTime,
  formatOrderMoney,
  OrderSummaryRow,
  orderStyles,
} from "@/components/orders/OrderUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useOrder } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function OrderReceiptScreen() {
  const accountStyles = useAccountStyles();
  const params = useLocalSearchParams();
  const orderId = getParam(params.orderId) ?? "";
  const { order, isLoadingOrder } = useOrder(orderId);

  if (isLoadingOrder) {
    return (
      <View style={accountStyles.screen}>
        <ProfileHeader title="Receipt" />
        <ScreenLoader label="Loading receipt..." />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={accountStyles.screen}>
        <ProfileHeader title="Receipt" />
        <View style={styles.emptyWrap}>
          <AccountEmptyState
            icon="receipt-outline"
            title="Receipt not available"
            message="We couldn't load this receipt right now. Head back to the order details and try again."
            actionLabel="Back"
            onAction={() =>
              goBackOr(router, {
                fallback: "/(root)/screens/profileScreens/orders" as any,
              })
            }
          />
        </View>
      </View>
    );
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Receipt" />

      <ScrollView contentContainerStyle={accountStyles.content} showsVerticalScrollIndicator={false}>
        <AccountListCard>
          <View style={styles.heroRow}>
            <AccountIconShell icon="receipt-outline" />
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Order receipt</Text>
              <Text style={styles.heroText}>
                Saved for your records and support conversations.
              </Text>
            </View>
          </View>
        </AccountListCard>

        <AccountSectionCard title="Receipt summary">
          <OrderSummaryRow label="Order number" value={`#${order.order_number}`} />
          <OrderSummaryRow label="Date" value={formatOrderDateTime(order.placed_at)} />
          <OrderSummaryRow
            label="Status"
            value={order.status.replace("_", " ")}
            last
          />
        </AccountSectionCard>

        <AccountSectionCard title="Items">
          {order.items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.itemRow, index !== order.items.length - 1 && styles.itemRowBorder]}
            >
              <View style={styles.itemTextWrap}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  Qty {item.quantity}
                  {item.category ? ` · ${item.category}` : ""}
                </Text>
              </View>
              <Text style={styles.itemAmount}>{formatOrderMoney(item.line_total)}</Text>
            </View>
          ))}
        </AccountSectionCard>

        <AccountSectionCard title="Billing">
          <OrderSummaryRow
            label="Items"
            value={`${totalItems} item${totalItems === 1 ? "" : "s"}`}
          />
          <OrderSummaryRow label="Subtotal" value={formatOrderMoney(order.subtotal_amount)} />
          <OrderSummaryRow
            label="Shipping"
            value={
              order.shipping_amount === 0 ? "FREE" : formatOrderMoney(order.shipping_amount)
            }
          />
          {order.discount_amount > 0 ? (
            <OrderSummaryRow
              label={`Voucher${order.voucher_code ? ` (${order.voucher_code})` : ""}`}
              value={`-${formatOrderMoney(order.discount_amount).slice(1)}`}
              accent="discount"
            />
          ) : null}
          <OrderSummaryRow
            label="Total paid"
            value={formatOrderMoney(order.total_amount)}
            last
          />
        </AccountSectionCard>

        <View style={styles.dualRow}>
          <View style={styles.miniCard}>
            <AccountSectionCard title="Delivery">
              <Text style={styles.detailPrimary}>{order.address_full_name}</Text>
              <Text style={styles.detailText}>
                {order.address_street}, {order.address_city}, {order.address_region}
              </Text>
              <Text style={styles.detailText}>{order.address_phone}</Text>
            </AccountSectionCard>
          </View>

          <View style={styles.miniCard}>
            <AccountSectionCard title="Payment">
              <Text style={styles.detailPrimary}>{order.payment_label}</Text>
              <Text style={styles.detailText}>
                {order.payment_type === "card"
                  ? `Card ending ${order.payment_last4 || "••••"}`
                  : order.payment_network || "Mobile Money"}
              </Text>
              {order.payment_phone ? (
                <Text style={styles.detailText}>{order.payment_phone}</Text>
              ) : null}
              {order.voucher_code ? (
                <Text style={styles.detailText}>
                  Voucher: {order.voucher_code}
                  {order.voucher_title ? ` · ${order.voucher_title}` : ""}
                </Text>
              ) : null}
            </AccountSectionCard>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={rMS(18)} color={AppColors.primary} />
          <Text style={styles.noteText}>
            Keep this receipt handy if you ever need help with delivery, refunds, or order support.
          </Text>
        </View>
      </ScrollView>

      <View style={orderStyles.stickyFooter}>
        <AccountActionButton
          label="Back to Order Details"
          variant="primary"
          onPress={() =>
            router.replace({
              pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
              params: { orderId: order.id },
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: rS(16),
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
  },
  heroText: {
    marginTop: rV(4),
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: "#6B7280",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingBottom: rV(12),
  },
  itemRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF2F6",
    marginBottom: rV(12),
  },
  itemTextWrap: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: AppColors.text,
  },
  itemMeta: {
    marginTop: rV(4),
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#6B7280",
  },
  itemAmount: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: AppColors.text,
  },
  dualRow: {
    flexDirection: "row",
    gap: rS(10),
  },
  miniCard: {
    flex: 1,
  },
  detailPrimary: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: AppColors.text,
    marginBottom: rV(4),
  },
  detailText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
    lineHeight: rMS(18),
    marginBottom: rV(2),
  },
  noteCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: rMS(18),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
  },
  noteText: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: AppColors.text,
  },
});
