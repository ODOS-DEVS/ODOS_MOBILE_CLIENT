import { AccountBadge } from "@/components/account/AccountUi";
import {
  AccountActionButton,
  AccountActionRow,
  AccountListCard,
} from "@/components/account/AccountUi";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { VendorProduct } from "@/types/store";
import {
  canDeleteVendorProduct,
  canHideVendorProduct,
  canUnhideVendorProduct,
  isLowStockProduct,
} from "@/utils/vendorProductCatalog";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type VendorProductCardProps = {
  product: VendorProduct;
  isUpdating?: boolean;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onEdit: () => void;
  onDuplicate?: () => void;
  onHide: () => void;
  onUnhide: () => void;
  onDelete: () => void;
  onAdjustStock: (nextStock: number) => void;
};

function productStatusTone(status: string): "success" | "warning" | "neutral" {
  if (status === "active") return "success";
  if (status === "pending" || status === "out_of_stock") return "warning";
  return "neutral";
}

export default function VendorProductCard({
  product,
  isUpdating = false,
  selectionMode = false,
  selected = false,
  onToggleSelect,
  onEdit,
  onDuplicate,
  onHide,
  onUnhide,
  onDelete,
  onAdjustStock,
}: VendorProductCardProps) {
  const { colors } = useTheme();
  const lowStock = isLowStockProduct(product);
  const reserved = product.reservedStock ?? 0;
  const available = product.availableStock ?? Math.max(0, product.stock - reserved);

  const confirmDelete = () => {
    Alert.alert(
      "Remove this product?",
      "This permanently deletes the listing from your catalog.",
      [
        { text: "Keep product", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ],
    );
  };

  return (
    <AccountListCard style={styles.card}>
      <View style={styles.cardRow}>
        {selectionMode ? (
          <TouchableOpacity
            onPress={onToggleSelect}
            style={[
              styles.selectBox,
              {
                borderColor: selected ? colors.text : colors.cardBorder,
                backgroundColor: selected ? colors.text : "transparent",
              },
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
          >
            {selected ? (
              <Text style={[styles.selectMark, { color: colors.onPrimary }]}>✓</Text>
            ) : null}
          </TouchableOpacity>
        ) : null}
        <Image source={product.image} style={styles.image} resizeMode="cover" />
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text numberOfLines={1} style={[styles.productTitle, { color: colors.text }]}>
              {product.name}
            </Text>
            <AccountBadge
              label={
                product.status === "pending"
                  ? "pending approval"
                  : product.status.replace(/_/g, " ")
              }
              tone={productStatusTone(product.status)}
            />
          </View>
          <Text numberOfLines={2} style={[styles.description, { color: colors.textMuted }]}>
            {product.description}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {product.category}
            </Text>
            <Text style={[styles.price, { color: colors.text }]}>
              GHS {product.price.toFixed(2)}
            </Text>
          </View>
          {product.status === "out_of_stock" || product.stock <= 0 ? (
            <AccountBadge label="Out of stock" tone="warning" />
          ) : lowStock ? (
            <AccountBadge label="Low stock" tone="warning" />
          ) : null}
        </View>
      </View>

      <View style={styles.stockRow}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.stockLabel, { color: colors.textMuted }]}>
            On hand {product.stock}
            {reserved > 0 ? ` · Reserved ${reserved}` : ""}
            {` · Available ${available}`}
          </Text>
        </View>
        {!selectionMode ? (
          <View style={styles.stockControls}>
            <TouchableOpacity
              style={[styles.stockButton, { borderColor: colors.cardBorder }]}
              disabled={isUpdating || product.stock <= 0}
              onPress={() => onAdjustStock(Math.max(0, product.stock - 1))}
            >
              <Text style={[styles.stockButtonLabel, { color: colors.text }]}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.stockValue, { color: colors.text }]}>{product.stock}</Text>
            <TouchableOpacity
              style={[styles.stockButton, { borderColor: colors.cardBorder }]}
              disabled={isUpdating}
              onPress={() => onAdjustStock(product.stock + 1)}
            >
              <Text style={[styles.stockButtonLabel, { color: colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {isUpdating ? <ScreenLoader label="Updating product" /> : null}

      {!selectionMode ? (
        <>
          <AccountActionRow>
            <AccountActionButton label="Edit" variant="secondary" onPress={onEdit} disabled={isUpdating} />
            {onDuplicate ? (
              <AccountActionButton
                label="Duplicate"
                variant="secondary"
                onPress={onDuplicate}
                disabled={isUpdating}
              />
            ) : null}
            {canHideVendorProduct(product) ? (
              <AccountActionButton
                label="Hide"
                variant="secondary"
                onPress={onHide}
                disabled={isUpdating}
              />
            ) : null}
            {canUnhideVendorProduct(product) ? (
              <AccountActionButton
                label={product.status === "out_of_stock" ? "Republish" : "Relist"}
                variant="secondary"
                onPress={onUnhide}
                disabled={isUpdating}
              />
            ) : null}
            {product.status === "out_of_stock" && product.stock <= 0 ? (
              <AccountActionButton
                label="Add stock to republish"
                variant="secondary"
                onPress={() => onAdjustStock(product.stock + 1)}
                disabled={isUpdating}
              />
            ) : null}
          </AccountActionRow>

          {canDeleteVendorProduct(product) ? (
            <AccountActionButton
              label="Delete product"
              variant="secondary"
              onPress={confirmDelete}
              disabled={isUpdating}
            />
          ) : null}
        </>
      ) : null}
    </AccountListCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: rV(10),
    gap: rV(12),
  },
  cardRow: {
    flexDirection: "row",
    gap: rS(12),
  },
  selectBox: {
    width: rS(24),
    height: rS(24),
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: rV(4),
  },
  selectMark: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
  image: {
    width: rS(88),
    height: rS(88),
    borderRadius: rMS(16),
    backgroundColor: "#F3F4F6",
  },
  cardBody: {
    flex: 1,
    gap: rV(6),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(8),
  },
  productTitle: {
    flex: 1,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  description: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(8),
  },
  metaText: {
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
  price: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stockLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12.5),
  },
  stockControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
  },
  stockButton: {
    width: rMS(34),
    height: rMS(34),
    borderRadius: rMS(10),
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  stockButtonLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    lineHeight: rMS(20),
  },
  stockValue: {
    minWidth: rS(28),
    textAlign: "center",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
  },
});
