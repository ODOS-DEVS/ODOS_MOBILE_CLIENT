import {
  AccountActionButton,
  AccountActionRow,
  AccountBadge,
  AccountListCard,
} from "@/components/account/AccountUi";
import { formatVendorCurrency } from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { VendorOrder, VendorOrderStatus } from "@/types/store";
import {
  VENDOR_ORDER_NEXT_STATUS,
  VENDOR_ORDER_TIMELINE,
  canAcknowledgeVendorOrder,
  canCancelVendorOrder,
  formatVendorDeliveryMethod,
  formatVendorOrderAddress,
  formatVendorOrderStatus,
  formatVendorOrderWaitLabel,
  getVendorOrderNextActionLabel,
  getVendorOrderSlaTone,
  normalizePhoneForDialer,
} from "@/utils/vendorOrderFulfillment";
import { resolveApiMediaUrl } from "@/utils/media";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type VendorOrderDetailViewProps = {
  order: VendorOrder;
  isUpdating?: boolean;
  onAdvance: () => void;
  onCancel: () => void;
  onAcknowledge: () => void;
};

function openDialer(phone?: string | null) {
  const normalized = normalizePhoneForDialer(phone);
  if (!normalized) {
    return;
  }
  void Linking.openURL(`tel:${normalized}`);
}

function timelineIndex(status: VendorOrderStatus) {
  if (status === "cancelled") {
    return -1;
  }
  return VENDOR_ORDER_TIMELINE.indexOf(status);
}

export default function VendorOrderDetailView({
  order,
  isUpdating = false,
  onAdvance,
  onCancel,
  onAcknowledge,
}: VendorOrderDetailViewProps) {
  const { colors, isDark } = useTheme();
  const nextAction = getVendorOrderNextActionLabel(order.status);
  const address = formatVendorOrderAddress(order);
  const currentStep = timelineIndex(order.status);
  const slaTone = getVendorOrderSlaTone(order);
  const dialablePhone = normalizePhoneForDialer(order.customerPhone);

  const confirmCancel = () => {
    Alert.alert(
      "Cancel this order?",
      "The shopper will be notified that your store cancelled this order.",
      [
        { text: "Keep order", style: "cancel" },
        { text: "Cancel order", style: "destructive", onPress: onCancel },
      ],
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <AccountListCard style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: colors.textMuted }]}>Order command</Text>
            <Text style={[styles.orderNumber, { color: colors.text }]}>
              {order.orderNumber}
            </Text>
            <Text style={[styles.customerName, { color: colors.textSecondary }]}>
              {order.customerName || "ODOS Customer"}
            </Text>
          </View>
          <AccountBadge
            label={formatVendorOrderStatus(order.status)}
            tone={
              order.status === "delivered"
                ? "success"
                : order.status === "cancelled"
                  ? "neutral"
                  : order.status === "pending"
                    ? "warning"
                    : "info"
            }
          />
        </View>

        <View style={styles.heroMeta}>
          <AccountBadge
            label={formatVendorOrderWaitLabel(order)}
            tone={slaTone === "danger" || slaTone === "warning" ? "warning" : "info"}
          />
          <Text style={[styles.totalText, { color: colors.text }]}>
            GHS {order.totalAmount.toFixed(2)}
          </Text>
        </View>

        {canAcknowledgeVendorOrder(order.status) ? (
          <AccountActionButton
            label="I've seen this order"
            variant="secondary"
            onPress={onAcknowledge}
            disabled={isUpdating}
          />
        ) : null}
      </AccountListCard>

      {order.netAmount != null ? (
        <AccountListCard>
          <View style={styles.earningsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your earnings</Text>
            <AccountBadge
              label={order.isSettled ? "Settled" : "Pending settlement"}
              tone={order.isSettled ? "success" : "warning"}
            />
          </View>
          <View style={styles.infoList}>
            <InfoRow
              icon="cash-outline"
              label="Gross sales"
              value={formatVendorCurrency(order.grossAmount ?? order.totalAmount, order.currency)}
              colors={colors}
            />
            <InfoRow
              icon="pie-chart-outline"
              label="ODOS commission"
              value={formatVendorCurrency(order.commissionAmount ?? 0, order.currency)}
              colors={colors}
            />
            <InfoRow
              icon="wallet-outline"
              label="Your net payout"
              value={formatVendorCurrency(order.netAmount, order.currency)}
              colors={colors}
            />
          </View>
          <Text style={[styles.earningsHint, { color: colors.textMuted }]}>
            {order.isSettled
              ? "This amount has been credited to your vendor wallet."
              : "Net earnings settle to your wallet once the order is marked delivered."}
          </Text>
        </AccountListCard>
      ) : null}

      <AccountListCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer & delivery</Text>
        <View style={styles.infoList}>
          <InfoRow
            icon="person-outline"
            label="Customer"
            value={order.customerName || "ODOS Customer"}
            colors={colors}
          />
          <InfoRow
            icon="call-outline"
            label="Phone"
            value={order.customerPhone || "Not provided"}
            colors={colors}
            onPress={dialablePhone ? () => openDialer(order.customerPhone) : undefined}
          />
          <InfoRow
            icon="location-outline"
            label="Delivery address"
            value={address || "Address not available"}
            colors={colors}
          />
          <InfoRow
            icon="bicycle-outline"
            label="Delivery method"
            value={formatVendorDeliveryMethod(order.deliveryMethod)}
            colors={colors}
          />
          {order.paymentLabel ? (
            <InfoRow
              icon="card-outline"
              label="Payment"
              value={order.paymentLabel}
              colors={colors}
            />
          ) : null}
        </View>

        <AccountActionRow>
          <AccountActionButton
            label={dialablePhone ? `Call ${dialablePhone}` : "Call customer"}
            variant="secondary"
            onPress={() => openDialer(order.customerPhone)}
            disabled={!dialablePhone}
          />
          <AccountActionButton
            label="Open chats"
            variant="secondary"
            onPress={() => router.push("/vendor/chats" as any)}
          />
        </AccountActionRow>
      </AccountListCard>

      <AccountListCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Items in this order</Text>
        <View style={styles.itemsList}>
          {order.items.map((item) => {
            const imageUri = resolveApiMediaUrl(item.imageUrl);
            return (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  { borderBottomColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.itemImageShell,
                    { backgroundColor: isDark ? colors.pill : "#F3F4F6" },
                  ]}
                >
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.itemImage} />
                  ) : (
                    <Ionicons name="cube-outline" size={rMS(18)} color={colors.iconMuted} />
                  )}
                </View>
                <View style={styles.itemCopy}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                    Qty {item.quantity} · GHS {item.unitPrice.toFixed(2)} each
                  </Text>
                </View>
                <Text style={[styles.itemTotal, { color: colors.text }]}>
                  GHS {(item.quantity * item.unitPrice).toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>
      </AccountListCard>

      {order.status !== "cancelled" ? (
        <AccountListCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Fulfillment timeline</Text>
          <View style={styles.timeline}>
            {VENDOR_ORDER_TIMELINE.map((step, index) => {
              const reached = currentStep >= index;
              const isCurrent = currentStep === index;
              return (
                <View key={step} style={styles.timelineRow}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: reached ? colors.primary : colors.border,
                        borderColor: isCurrent ? colors.primary : "transparent",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.timelineLabel,
                      {
                        color: reached ? colors.text : colors.textMuted,
                        fontFamily: isCurrent ? Fonts.titleBold : Fonts.text,
                      },
                    ]}
                  >
                    {formatVendorOrderStatus(step)}
                  </Text>
                </View>
              );
            })}
          </View>
        </AccountListCard>
      ) : null}

      <View style={styles.actionsBlock}>
        {nextAction && VENDOR_ORDER_NEXT_STATUS[order.status] ? (
          <AccountActionButton
            label={isUpdating ? "Updating..." : nextAction}
            variant="primary"
            onPress={onAdvance}
            disabled={isUpdating}
            style={styles.fulfillmentButton}
          />
        ) : null}

        {canCancelVendorOrder(order.status) ? (
          <AccountActionButton
            label={isUpdating ? "Updating..." : "Cancel order"}
            variant="secondary"
            onPress={confirmCancel}
            disabled={isUpdating}
            style={styles.fulfillmentButton}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: { text: string; textMuted: string; primary: string; pill: string };
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={[styles.infoIconShell, { backgroundColor: colors.pill }]}>
        <Ionicons name={icon} size={rMS(16)} color={colors.primary} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text
          style={[
            styles.infoValue,
            { color: onPress ? colors.primary : colors.text },
            onPress ? styles.infoValueLink : null,
          ]}
        >
          {value}
        </Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.infoRow}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.infoRow}>{content}</View>;
}

const styles = StyleSheet.create({
  content: {
    gap: rV(14),
    paddingBottom: rV(40),
  },
  heroCard: {
    gap: rV(14),
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(12),
  },
  heroCopy: {
    flex: 1,
    gap: rV(4),
  },
  eyebrow: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  orderNumber: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(24),
    lineHeight: rMS(30),
  },
  customerName: {
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    lineHeight: rMS(20),
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(10),
  },
  totalText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
  },
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    lineHeight: rMS(20),
    marginBottom: rV(12),
  },
  earningsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(10),
    marginBottom: rV(12),
  },
  earningsHint: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
  },
  infoList: {
    gap: rV(12),
    marginBottom: rV(14),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(12),
  },
  infoIconShell: {
    width: rMS(34),
    height: rMS(34),
    borderRadius: rMS(10),
    alignItems: "center",
    justifyContent: "center",
  },
  infoCopy: {
    flex: 1,
    gap: rV(2),
  },
  infoLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
  infoValue: {
    fontFamily: Fonts.text,
    fontSize: rMS(13.5),
    lineHeight: rMS(20),
  },
  infoValueLink: {
    fontFamily: Fonts.textBold,
    textDecorationLine: "underline",
  },
  itemsList: {
    gap: rV(0),
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingVertical: rV(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemImageShell: {
    width: rMS(52),
    height: rMS(52),
    borderRadius: rMS(12),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemCopy: {
    flex: 1,
    minWidth: 0,
    gap: rV(3),
  },
  itemTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
    lineHeight: rMS(18),
  },
  itemMeta: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  itemTotal: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
  },
  timeline: {
    gap: rV(10),
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
  },
  timelineDot: {
    width: rMS(12),
    height: rMS(12),
    borderRadius: rMS(6),
    borderWidth: 2,
  },
  timelineLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
  },
  actionsBlock: {
    gap: rV(14),
    marginTop: rV(10),
    marginBottom: rV(12),
    paddingHorizontal: rS(2),
    paddingVertical: rV(4),
  },
  fulfillmentButton: {
    minHeight: rV(52),
    paddingHorizontal: rS(16),
    paddingVertical: rV(14),
    borderRadius: rMS(16),
  },
});
