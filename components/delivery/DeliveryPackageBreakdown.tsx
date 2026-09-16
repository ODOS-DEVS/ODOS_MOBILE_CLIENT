import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rV } from "@/styles/responsive";
import { formatDeliveryAmount, type DeliveryPackageQuote } from "@/utils/delivery";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type DeliveryPackageBreakdownProps = {
  packages: DeliveryPackageQuote[];
  /** Hidden entirely below this many shops — see the note in the component. */
  minimumPackages?: number;
};

/**
 * Shows the customer which shops their delivery fees are for.
 *
 * An order that spans three shops is three riders making three separate
 * journeys, so it carries three delivery fees. Presenting only the total
 * would make it look like ODOS had simply raised its price; presenting the
 * list makes it obvious what was bought. The customer is told before they
 * pay, not after.
 *
 * Hidden for single-shop carts, where a one-line "breakdown" of a number
 * already shown directly above it is pure noise.
 */
export default function DeliveryPackageBreakdown({
  packages,
  minimumPackages = 2,
}: DeliveryPackageBreakdownProps) {
  const { colors } = useTheme();

  const total = useMemo(
    () => packages.reduce((sum, pkg) => sum + pkg.deliveryFee, 0),
    [packages],
  );

  const freeCount = useMemo(
    () => packages.filter((pkg) => pkg.deliveryFee <= 0).length,
    [packages],
  );

  if (packages.length < minimumPackages) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <Ionicons name="cube-outline" size={rMS(16)} color={colors.textMuted} />
        <Text style={[styles.headerText, { color: colors.text }]}>
          {packages.length} packages, {packages.length} deliveries
        </Text>
      </View>

      <Text style={[styles.explainer, { color: colors.textMuted }]}>
        Each shop delivers its own items, so they may arrive at different times.
      </Text>

      {packages.map((pkg, index) => {
        const isFree = pkg.deliveryFee <= 0;
        return (
          <View
            key={`${pkg.storeId ?? "shop"}-${index}`}
            style={[
              styles.row,
              index !== packages.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.rowMain}>
              <Text style={[styles.storeName, { color: colors.text }]} numberOfLines={1}>
                {pkg.storeName ?? `Package ${index + 1}`}
              </Text>
              {/* The nudge is only worth showing when it is actually reachable
                  — a shop 400 cedis away from free delivery is not an offer,
                  it is a taunt. */}
              {!isFree && pkg.amountToFreeDelivery && pkg.amountToFreeDelivery <= 150 ? (
                <Text style={[styles.nudge, { color: colors.infoText }]}>
                  Add GH₵{pkg.amountToFreeDelivery.toFixed(2)} from this shop for free delivery
                </Text>
              ) : (
                <Text style={[styles.subtotal, { color: colors.textMuted }]}>
                  GH₵{pkg.itemsSubtotal.toFixed(2)} of items
                </Text>
              )}
            </View>

            {isFree ? (
              <View style={[styles.freePill, { backgroundColor: colors.successSoft }]}>
                <Text style={[styles.freePillText, { color: colors.successText }]}>
                  {/* "Free delivery" and "Free over GH₵299" are different
                      promises: one is what this shop always does, the other is
                      something this basket earned. */}
                  {pkg.feeWaived ? "Free — you qualified" : "Free delivery"}
                </Text>
              </View>
            ) : (
              <Text style={[styles.fee, { color: colors.text }]}>
                {formatDeliveryAmount(pkg.deliveryFee)}
              </Text>
            )}
          </View>
        );
      })}

      <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.totalLabel, { color: colors.textMuted }]}>
          {freeCount > 0 && freeCount < packages.length
            ? `Delivery total · ${freeCount} free`
            : "Delivery total"}
        </Text>
        <Text style={[styles.totalValue, { color: colors.text }]}>
          {formatDeliveryAmount(total)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: rMS(14),
    paddingHorizontal: rMS(14),
    paddingVertical: rV(12),
    gap: rV(4),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: rMS(6),
  },
  headerText: {
    fontFamily: Fonts.title,
    fontSize: rMS(13),
  },
  explainer: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    marginBottom: rV(6),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rMS(10),
    paddingVertical: rV(8),
  },
  rowMain: {
    flex: 1,
    gap: rV(2),
  },
  storeName: {
    fontFamily: Fonts.title,
    fontSize: rMS(13),
  },
  subtotal: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
  },
  nudge: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
  },
  fee: {
    fontFamily: Fonts.title,
    fontSize: rMS(13),
  },
  freePill: {
    paddingHorizontal: rMS(8),
    paddingVertical: rV(3),
    borderRadius: rMS(999),
  },
  freePillText: {
    fontFamily: Fonts.title,
    fontSize: rMS(10),
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: rV(10),
    marginTop: rV(4),
  },
  totalLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  totalValue: {
    fontFamily: Fonts.title,
    fontSize: rMS(14),
  },
});
