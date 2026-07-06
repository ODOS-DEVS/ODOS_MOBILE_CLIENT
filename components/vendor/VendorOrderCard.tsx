import { AccountBadge } from "@/components/account/AccountUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { VendorOrder } from "@/types/store";
import {
  formatVendorDeliveryMethod,
  formatVendorOrderStatus,
  formatVendorOrderWaitLabel,
  getVendorOrderSlaTone,
} from "@/utils/vendorOrderFulfillment";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type VendorOrderCardProps = {
  order: VendorOrder;
  onPress: () => void;
};

function slaToneToBadge(tone: ReturnType<typeof getVendorOrderSlaTone>) {
  if (tone === "danger") {
    return "warning" as const;
  }
  if (tone === "warning") {
    return "warning" as const;
  }
  if (tone === "info") {
    return "info" as const;
  }
  return "neutral" as const;
}

function slaToneToAccent(tone: ReturnType<typeof getVendorOrderSlaTone>) {
  if (tone === "danger") {
    return "#DC2626";
  }
  if (tone === "warning") {
    return "#EA580C";
  }
  if (tone === "info") {
    return "#2563EB";
  }
  return undefined;
}

export default function VendorOrderCard({ order, onPress }: VendorOrderCardProps) {
  const { colors, isDark } = useTheme();
  const waitLabel = formatVendorOrderWaitLabel(order);
  const slaTone = getVendorOrderSlaTone(order);
  const accentColor = slaToneToAccent(slaTone);
  const isActionable = order.status !== "delivered" && order.status !== "cancelled";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surfaceSubtle : colors.card,
          borderColor: colors.cardBorder,
          borderLeftColor: accentColor ?? colors.cardBorder,
          borderLeftWidth: accentColor ? rMS(3) : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.orderNumber, { color: colors.text }]}>
            {order.orderNumber}
          </Text>
          <Text style={[styles.customerName, { color: colors.textMuted }]} numberOfLines={1}>
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

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="cube-outline" size={rMS(14)} color={colors.primary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {order.productCount} item{order.productCount === 1 ? "" : "s"}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={rMS(14)} color={colors.primary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            GHS {order.totalAmount.toFixed(2)}
          </Text>
        </View>
        {order.deliveryMethod ? (
          <View style={styles.metaItem}>
            <Ionicons name="bicycle-outline" size={rMS(14)} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
              {formatVendorDeliveryMethod(order.deliveryMethod)}
            </Text>
          </View>
        ) : null}
      </View>

      {isActionable ? (
        <View style={styles.footerRow}>
          <View style={styles.footerBadges}>
            <AccountBadge label={waitLabel} tone={slaToneToBadge(slaTone)} />
            {order.deliveryMethod === "express" ? (
              <AccountBadge label="Express" tone="warning" />
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={rMS(18)} color={colors.iconMuted} />
        </View>
      ) : (
        <View style={styles.footerRow}>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {new Date(order.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </Text>
          <Ionicons name="chevron-forward" size={rMS(18)} color={colors.iconMuted} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(16),
    paddingVertical: rV(14),
    gap: rV(12),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(12),
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: rV(3),
  },
  orderNumber: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    lineHeight: rMS(20),
  },
  customerName: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(17),
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(14),
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
  },
  metaText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: rS(6),
    flex: 1,
  },
  dateText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
});
