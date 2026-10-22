import CommerceImage from "@/components/media/CommerceImage";
import {
  VendorRow,
  VendorStatusDot,
  VendorStepper,
  type VendorRowAction,
} from "@/components/vendor/VendorRowUi";
import { VendorVelocityBar } from "@/components/vendor/VendorWorkspaceUi";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import type { VendorProduct } from "@/types/store";
import { formatCurrency } from "@/utils/currency";
import {
  formatDaysOfCover,
  getVendorStockTone,
  type VendorStockSignal,
} from "@/utils/vendorInventoryIntelligence";
import { resolveImageSource } from "@/utils/media";
import {
  canDeleteVendorProduct,
  canHideVendorProduct,
  canUnhideVendorProduct,
  getVendorProductIssues,
  VENDOR_PRODUCT_ISSUE_LABELS,
} from "@/utils/vendorProductCatalog";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * One product, on a single line, with how it is actually trading.
 *
 * The row used to show name, price, category and stock — everything about
 * what a product *is* and nothing about whether it works. A vendor could not
 * tell their best seller from dead capital without leaving for the analytics
 * screen, which is the wrong place to make a catalog decision.
 *
 * So the second line now spends its width on performance: a bar scaled against
 * the best seller on screen, units moved, and days of cover. Price moved up to
 * sit with the name, where it reads as an attribute of the product rather than
 * competing with the trading data.
 *
 * Issues still win the line when present — "Sold out" outranks "14 sold" —
 * but the two are composed rather than exclusive, because "Sold out · 14 sold"
 * is precisely the row a vendor should restock first.
 */
export default function VendorProductRow({
  product,
  stock,
  signal,
  velocityShare,
  isUpdating,
  selectionMode,
  selected,
  onToggleSelect,
  onPress,
  onAdjustStock,
  onEditPrice,
  onHide,
  onUnhide,
  onDuplicate,
  onDelete,
}: {
  product: VendorProduct;
  /** On-hand count to show — the pending value while a write is in flight. */
  stock: number;
  signal: VendorStockSignal;
  /** 0–1 against the best seller currently listed. */
  velocityShare: number;
  isUpdating: boolean;
  selectionMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onPress: () => void;
  onAdjustStock: (next: number) => void;
  onEditPrice: () => void;
  onHide: () => void;
  onUnhide: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const issues = useMemo(() => getVendorProductIssues(product), [product]);
  const imageSource = resolveImageSource(product.imageUrl, product.imageKey);

  const tone =
    issues[0] === "out_of_stock"
      ? "danger"
      : issues.length > 0
        ? "warn"
        : product.status === "active"
          ? getVendorStockTone(signal.urgency)
          : "muted";

  const velocityTone =
    signal.urgency === "reorder_now"
      ? "danger"
      : signal.urgency === "reorder_soon"
        ? "warn"
        : "neutral";

  /**
   * Second line, most actionable fact first.
   *
   * Performance is appended to an issue rather than replaced by it: a sold-out
   * line that moved 14 units is a restock, while a sold-out line that moved
   * none is a delisting, and the vendor cannot tell those apart from the issue
   * label alone.
   */
  const soldLabel = signal.unitsSold > 0 ? `${signal.unitsSold} sold` : null;
  const metaText = (() => {
    if (issues.length > 0) {
      const issueLabel = VENDOR_PRODUCT_ISSUE_LABELS[issues[0]];
      return soldLabel ? `${issueLabel} · ${soldLabel}` : issueLabel;
    }
    if (signal.unitsSold > 0) {
      return `${soldLabel} · ${formatDaysOfCover(signal.daysOfCover)}`;
    }
    if (signal.urgency === "dead") {
      return "Not selling · review price or photos";
    }
    return product.category || "Uncategorised";
  })();

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price && product.price > 0
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const actions: VendorRowAction[] = [
    // Repricing is the most frequent single-field edit, so it leads.
    { label: "Edit price", icon: "pricetag-outline", onPress: onEditPrice },
    { label: "Edit product", icon: "create-outline", onPress },
    { label: "Duplicate", icon: "copy-outline", onPress: onDuplicate },
  ];
  if (canHideVendorProduct(product)) {
    actions.push({ label: "Hide from store", icon: "eye-off-outline", onPress: onHide });
  }
  if (canUnhideVendorProduct(product)) {
    actions.push({ label: "Relist", icon: "eye-outline", onPress: onUnhide });
  }
  if (canDeleteVendorProduct(product)) {
    actions.push({ label: "Delete", icon: "trash-outline", tone: "danger", onPress: onDelete });
  }

  return (
    <VendorRow
      selected={selected}
      onPress={selectionMode ? onToggleSelect : onPress}
      // Long-press starts a selection without hunting for a "Select" button.
      onLongPress={onToggleSelect}
      actions={selectionMode ? undefined : actions}
    >
      {selectionMode ? (
        <View style={[styles.checkbox, selected && styles.checkboxOn]}>
          {selected ? (
            <Ionicons name="checkmark" size={rMS(14)} color={colors.onPrimary} />
          ) : null}
        </View>
      ) : (
        <View style={styles.thumb}>
          {imageSource ? (
            <CommerceImage
              source={imageSource}
              style={styles.thumbImage}
              contentFit="cover"
              trackingId={`vendor-row-${product.id}`}
              recyclingKey={product.imageUrl || product.imageKey || product.id}
              placeholderColor={colors.surfaceMuted}
            />
          ) : (
            <Ionicons name="image-outline" size={rMS(17)} color={colors.iconMuted} />
          )}
        </View>
      )}

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          {discountPercent !== null ? (
            <Text style={styles.discount}>-{discountPercent}%</Text>
          ) : null}
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        </View>

        <View style={styles.metaRow}>
          <VendorStatusDot tone={tone} />
          {velocityShare > 0 ? (
            <VendorVelocityBar share={velocityShare} tone={velocityTone} />
          ) : null}
          <Text
            style={[
              styles.meta,
              issues.length > 0 && styles.metaIssue,
              issues[0] === "out_of_stock" && styles.metaDanger,
            ]}
            numberOfLines={1}
          >
            {metaText}
          </Text>
        </View>
      </View>

      {selectionMode ? null : (
        <VendorStepper value={stock} disabled={isUpdating} onChange={onAdjustStock} />
      )}
    </VendorRow>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    thumb: {
      width: rMS(44),
      height: rMS(44),
      borderRadius: rMS(11),
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    thumbImage: { width: "100%", height: "100%" },
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

    copy: { flex: 1, minWidth: 0, gap: rV(5) },
    titleRow: { flexDirection: "row", alignItems: "center", gap: rS(6) },
    name: {
      flex: 1,
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: colors.text,
    },
    discount: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(10.5),
      color: colors.successText,
    },
    price: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.text,
    },

    metaRow: { flexDirection: "row", alignItems: "center", gap: rS(6) },
    meta: {
      flexShrink: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(11.5),
      color: colors.textMuted,
    },
    metaIssue: { fontFamily: Fonts.titleBold, color: colors.warningText },
    metaDanger: { color: colors.dangerText },
  });
}
