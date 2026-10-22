import { VendorRow, VendorStatusDot, VendorStepper } from "@/components/vendor/VendorRowUi";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import type { VendorProduct } from "@/types/store";
import {
  formatDaysOfCover,
  getVendorStockTone,
  type VendorStockSignal,
} from "@/utils/vendorInventoryIntelligence";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * One product's stock, with when it runs out and what to reorder.
 *
 * An on-hand count on its own cannot be acted on. "12" is a crisis on a line
 * that sells four a day and a year of dead capital on one that sells four a
 * month, so the row leads with days of cover — stock divided by the rate it
 * actually leaves the shelf.
 *
 * The reorder suggestion is a button, not a label. It is computed to bring the
 * line back to two weeks of cover, and tapping it adds exactly that many
 * units, which turns the most common restocking decision into one gesture
 * instead of arithmetic the vendor does in their head and then types into a
 * stepper.
 *
 * No overflow menu here: the row's only other action is its history, which is
 * what tapping the row already does. Dropping it buys the width that the cover
 * figure and the reorder button need.
 */
export default function VendorStockRow({
  product,
  stock,
  signal,
  isUpdating,
  onChangeStock,
  onOpenHistory,
}: {
  product: VendorProduct;
  /** On-hand count to show — the pending value while a write is in flight. */
  stock: number;
  signal: VendorStockSignal;
  isUpdating: boolean;
  onChangeStock: (next: number) => void;
  onOpenHistory: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const reserved = product.reservedStock ?? 0;
  const tone = getVendorStockTone(signal.urgency);

  /**
   * Second line, in the order a restocking decision needs it.
   *
   * Reserved units are called out whenever they exist, because they are the
   * difference between stock a vendor has and stock a vendor can sell — the
   * single most common cause of overselling.
   */
  const metaParts: string[] = [];
  if (signal.unitsSold > 0) {
    metaParts.push(formatDaysOfCover(signal.daysOfCover));
    metaParts.push(`${signal.unitsSold} sold`);
  } else if (signal.urgency === "dead") {
    metaParts.push("No sales");
  } else {
    metaParts.push(product.category || "Uncategorised");
  }
  if (reserved > 0) {
    metaParts.push(`${reserved} reserved`);
  }

  const showReorder = signal.suggestedReorder > 0;

  return (
    <VendorRow onPress={onOpenHistory}>
      <VendorStatusDot tone={tone} />

      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.metaRow}>
          <Text
            style={[
              styles.meta,
              signal.urgency === "reorder_now" && styles.metaDanger,
              signal.urgency === "reorder_soon" && styles.metaWarn,
            ]}
            numberOfLines={1}
          >
            {metaParts.join(" · ")}
          </Text>
        </View>
      </View>

      {showReorder ? (
        <TouchableOpacity
          style={[
            styles.reorder,
            signal.urgency === "reorder_now" && styles.reorderUrgent,
          ]}
          activeOpacity={0.75}
          disabled={isUpdating}
          onPress={() => onChangeStock(stock + signal.suggestedReorder)}
          hitSlop={4}
        >
          <Text
            style={[
              styles.reorderLabel,
              signal.urgency === "reorder_now" && styles.reorderLabelUrgent,
            ]}
            numberOfLines={1}
          >
            +{signal.suggestedReorder}
          </Text>
        </TouchableOpacity>
      ) : null}

      <VendorStepper value={stock} disabled={isUpdating} onChange={onChangeStock} />
    </VendorRow>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    copy: { flex: 1, minWidth: 0, gap: rV(3) },
    name: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13.5),
      color: colors.text,
    },
    metaRow: { flexDirection: "row", alignItems: "center", gap: rS(5) },
    meta: {
      flexShrink: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(11.5),
      color: colors.textMuted,
    },
    metaWarn: { fontFamily: Fonts.titleBold, color: colors.warningText },
    metaDanger: { fontFamily: Fonts.titleBold, color: colors.dangerText },

    reorder: {
      paddingHorizontal: rS(9),
      paddingVertical: rV(6),
      borderRadius: rMS(8),
      backgroundColor: colors.surfaceSubtle,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    reorderUrgent: {
      backgroundColor: colors.dangerSoft,
      borderColor: colors.dangerText,
    },
    reorderLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11.5),
      color: colors.textSecondary,
    },
    reorderLabelUrgent: { color: colors.dangerText },
  });
}
