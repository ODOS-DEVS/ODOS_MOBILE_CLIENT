import {
  VendorRow,
  VendorStatusDot,
  type VendorRowAction,
} from "@/components/vendor/VendorRowUi";
import { VendorTag } from "@/components/vendor/VendorWorkspaceUi";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import type { VendorOrder } from "@/types/store";
import { formatCurrency } from "@/utils/currency";
import {
  countVendorOrderItems,
  formatVendorOrderWaitLabel,
  getVendorOrderNetAmount,
  getVendorOrderNextActionLabel,
  getVendorOrderSlaTone,
} from "@/utils/vendorOrderFulfillment";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * One order, on a single line, with what it pays and where it goes.
 *
 * The queue previously showed what the *shopper* paid. That is the wrong
 * number for this screen: commission comes off before anything reaches the
 * vendor, so every row overstated the order, and a vendor comparing a ₵240
 * order against a ₵240 order could not see that one nets more than the other.
 * The payout leads now, with the shopper's total kept alongside it for
 * reconciliation against the order detail and the customer's receipt.
 *
 * Destination moved onto the row for the same reason: whether a line is
 * express and which city it is going to both change what the vendor does
 * next, and both were previously a tap away on the detail screen.
 */
export default function VendorOrderRow({
  order,
  isAdvancing,
  selectionMode,
  selected,
  onToggleSelect,
  onAdvance,
  onPress,
  onPackingSlip,
  onCall,
}: {
  order: VendorOrder;
  isAdvancing: boolean;
  selectionMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onAdvance: () => void;
  onPress: () => void;
  onPackingSlip: () => void;
  onCall: (() => void) | null;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const slaTone = getVendorOrderSlaTone(order);
  const nextLabel = getVendorOrderNextActionLabel(order.status);
  const itemCount = countVendorOrderItems(order);
  const net = getVendorOrderNetAmount(order);

  const tone = slaTone === "danger" ? "danger" : slaTone === "warning" ? "warn" : "live";

  // Only flagged when it changes the work. "Standard" on every row would be
  // noise competing with the city for the same few points of width.
  const isExpress = order.deliveryMethod === "express";
  const destination = order.addressCity?.trim() || null;

  const actions: VendorRowAction[] = [
    { label: "Packing slip", icon: "receipt-outline", onPress: onPackingSlip },
    { label: "Open order", icon: "open-outline", onPress },
  ];
  if (onCall) {
    actions.push({ label: "Call customer", icon: "call-outline", onPress: onCall });
  }

  return (
    <VendorRow
      selected={selected}
      onPress={selectionMode ? onToggleSelect : onPress}
      onLongPress={onToggleSelect}
      actions={selectionMode ? undefined : actions}
    >
      {selectionMode ? (
        <View style={[styles.checkbox, selected && styles.checkboxOn]}>
          {selected ? (
            <Ionicons name="checkmark" size={rMS(14)} color={colors.onPrimary} />
          ) : null}
        </View>
      ) : null}

      <View style={styles.copy}>
        <View style={styles.topRow}>
          {selectionMode ? null : <VendorStatusDot tone={tone} />}
          <Text style={styles.number} numberOfLines={1}>
            {order.orderNumber}
          </Text>
          <Text style={styles.customer} numberOfLines={1}>
            {order.customerName}
          </Text>
          {isExpress ? <VendorTag label="Express" tone="info" icon="flash" /> : null}
        </View>

        <View style={styles.metaRow}>
          <Text
            style={[
              styles.wait,
              slaTone === "danger" && styles.waitLate,
              slaTone === "warning" && styles.waitSoon,
            ]}
            numberOfLines={1}
          >
            {formatVendorOrderWaitLabel(order)}
          </Text>
          <Text style={styles.dim}>·</Text>
          <Text style={styles.dim} numberOfLines={1}>
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </Text>
          <Text style={styles.dim}>·</Text>
          <Text style={styles.payout} numberOfLines={1}>
            {formatCurrency(net)}
          </Text>
          {/* The shopper's total, kept only when commission makes it differ. */}
          {Math.abs(net - order.totalAmount) >= 0.01 ? (
            <Text style={styles.gross} numberOfLines={1}>
              of {formatCurrency(order.totalAmount)}
            </Text>
          ) : null}
          {destination ? (
            <>
              <Text style={styles.dim}>·</Text>
              <Text style={styles.dim} numberOfLines={1}>
                {destination}
              </Text>
            </>
          ) : null}
        </View>
      </View>

      {selectionMode ? null : nextLabel ? (
        <TouchableOpacity
          style={styles.advance}
          activeOpacity={0.8}
          disabled={isAdvancing}
          onPress={onAdvance}
          hitSlop={6}
        >
          {isAdvancing ? (
            <ActivityIndicator size="small" color={colors.onInverseSurface} />
          ) : (
            <Text style={styles.advanceLabel} numberOfLines={1}>
              {nextLabel}
            </Text>
          )}
        </TouchableOpacity>
      ) : null}
    </VendorRow>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    checkbox: {
      width: rMS(23),
      height: rMS(23),
      borderRadius: rMS(7),
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },

    copy: { flex: 1, minWidth: 0, gap: rV(4) },
    topRow: { flexDirection: "row", alignItems: "center", gap: rS(6) },
    number: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: colors.text,
    },
    customer: {
      flexShrink: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      color: colors.textMuted,
    },
    metaRow: { flexDirection: "row", alignItems: "center", gap: rS(5) },
    dim: {
      flexShrink: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
    },
    payout: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12),
      color: colors.text,
    },
    gross: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: colors.textMuted,
    },
    wait: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12),
      color: colors.textMuted,
    },
    waitLate: { color: colors.dangerText },
    waitSoon: { color: colors.warningText },

    advance: {
      minWidth: rS(78),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: rS(12),
      paddingVertical: rV(10),
      borderRadius: rMS(10),
      backgroundColor: colors.inverseSurface,
    },
    advanceLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12),
      color: colors.onInverseSurface,
    },
  });
}
