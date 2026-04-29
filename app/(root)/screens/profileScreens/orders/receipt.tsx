import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useOrder } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function formatMoney(value: number) {
  return `₵${value.toFixed(2)}`;
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrderReceiptScreen() {
  const params = useLocalSearchParams();
  const orderId = getParam(params.orderId) ?? "";
  const { order, isLoadingOrder } = useOrder(orderId);

  if (isLoadingOrder) {
    return (
      <View style={styles.container}>
        <ProfileHeader title="Receipt" />
        <ScreenLoader label="Loading receipt..." />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <ProfileHeader title="Receipt" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Receipt not available</Text>
          <Text style={styles.emptyText}>
            We couldn’t load this receipt right now. Head back to the order details and try again.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <ProfileHeader title="Receipt" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="receipt-outline" size={rMS(28)} color={AppColors.primary} />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Order receipt</Text>
              <Text style={styles.heroText}>
                Saved for your records and support conversations.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Receipt Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Order number</Text>
            <Text style={styles.value}>#{order.order_number}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formatOrderDate(order.placed_at)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.valueCap}>{order.status}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Source</Text>
            <Text style={styles.valueCap}>{order.source.replace("_", " ")}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
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
              <Text style={styles.itemAmount}>{formatMoney(item.line_total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Billing</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Items</Text>
            <Text style={styles.value}>
              {totalItems} item{totalItems === 1 ? "" : "s"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>{formatMoney(order.subtotal_amount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Shipping</Text>
            <Text style={styles.value}>
              {order.shipping_amount === 0 ? "FREE" : formatMoney(order.shipping_amount)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowLast]}>
            <Text style={styles.totalLabel}>Total paid</Text>
            <Text style={styles.totalValue}>{formatMoney(order.total_amount)}</Text>
          </View>
        </View>

        <View style={styles.dualCardRow}>
          <View style={[styles.card, styles.miniCard]}>
            <Text style={styles.sectionTitle}>Delivery</Text>
            <Text style={styles.detailPrimary}>{order.address_full_name}</Text>
            <Text style={styles.detailText}>
              {order.address_street}, {order.address_city}, {order.address_region}
            </Text>
            <Text style={styles.detailText}>{order.address_phone}</Text>
          </View>

          <View style={[styles.card, styles.miniCard]}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <Text style={styles.detailPrimary}>{order.payment_label}</Text>
            <Text style={styles.detailText}>
              {order.payment_type === "card"
                ? `Card ending ${order.payment_last4 || "••••"}`
                : order.payment_network || "Mobile Money"}
            </Text>
            {order.payment_phone ? <Text style={styles.detailText}>{order.payment_phone}</Text> : null}
          </View>
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={rMS(18)} color={AppColors.primary} />
          <Text style={styles.noteText}>
            Keep this receipt handy if you ever need help with delivery, refunds, or order support.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.88}
          onPress={() =>
            router.replace({
              pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
              params: { orderId: order.id },
            })
          }
        >
          <Text style={styles.primaryButtonText}>Back to Order Details</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: rV(14),
    paddingBottom: rV(120),
  },
  heroCard: {
    backgroundColor: "#EEF4FF",
    borderRadius: rMS(20),
    padding: rS(16),
    marginBottom: rV(12),
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  heroIconWrap: {
    width: rMS(48),
    height: rMS(48),
    borderRadius: rMS(24),
    backgroundColor: AppColors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: rMS(16),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  heroText: {
    marginTop: rV(4),
    fontSize: rMS(12),
    lineHeight: rMS(18),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(20),
    padding: rS(16),
    marginBottom: rV(12),
  },
  miniCard: {
    flex: 1,
    marginBottom: 0,
  },
  dualCardRow: {
    flexDirection: "row",
    gap: rS(10),
    marginBottom: rV(12),
  },
  sectionTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
    marginBottom: rV(12),
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: rS(12),
    paddingVertical: rV(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E7EBF0",
  },
  summaryRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  label: {
    flex: 1,
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  value: {
    flex: 1,
    textAlign: "right",
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  valueCap: {
    flex: 1,
    textAlign: "right",
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
    textTransform: "capitalize",
  },
  totalLabel: {
    flex: 1,
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  totalValue: {
    flex: 1,
    textAlign: "right",
    fontSize: rMS(15),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingBottom: rV(12),
  },
  itemRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E7EBF0",
    marginBottom: rV(12),
  },
  itemTextWrap: {
    flex: 1,
  },
  itemTitle: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  itemMeta: {
    marginTop: rV(4),
    fontSize: rMS(11),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  itemAmount: {
    fontSize: rMS(13),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  detailPrimary: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
    marginBottom: rV(4),
  },
  detailText: {
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(18),
    marginBottom: rV(2),
  },
  noteCard: {
    backgroundColor: "#F2F4F7",
    borderRadius: rMS(18),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
  },
  noteText: {
    flex: 1,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    fontFamily: Fonts.text,
    color: AppColors.text,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: AppColors.white,
    paddingHorizontal: rS(16),
    paddingTop: rV(14),
    paddingBottom: rV(24),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E7EBF0",
  },
  primaryButton: {
    minHeight: rV(50),
    borderRadius: rMS(16),
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: rS(22),
  },
  emptyTitle: {
    fontSize: rMS(18),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
    textAlign: "center",
    marginBottom: rV(8),
  },
  emptyText: {
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(20),
    textAlign: "center",
    marginBottom: rV(18),
  },
});
