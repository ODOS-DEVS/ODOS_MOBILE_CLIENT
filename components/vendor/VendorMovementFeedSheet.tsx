import { AccountEmptyState } from "@/components/account/AccountUi";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import type { VendorInventoryFeedEntry } from "@/services/storeService";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Every stock change across the catalog, newest first.
 *
 * The per-product history only helps a vendor who already knows which product
 * to inspect. The question they actually arrive with is "why is my stock
 * wrong?", and the answer is usually a sale, a return or a bulk edit on a line
 * they have not thought about — none of which they can find by opening SKUs
 * one at a time.
 *
 * Each row names the product, the signed delta and what caused it, because a
 * movement is only diagnostic once you can see it was an order rather than
 * someone's thumb on a stepper.
 */

export function formatVendorMovementReason(reason: string) {
  switch (reason) {
    case "manual":
      return "Manual adjustment";
    case "bulk":
      return "Bulk update";
    case "order_sale":
      return "Order sale";
    case "return_restock":
      return "Return restock";
    case "system":
      return "System";
    default:
      return reason.replace(/_/g, " ");
  }
}

/** Icon per cause, so the feed can be scanned without reading every label. */
function reasonIcon(reason: string): keyof typeof Ionicons.glyphMap {
  switch (reason) {
    case "order_sale":
      return "cart-outline";
    case "return_restock":
      return "return-down-back-outline";
    case "bulk":
      return "layers-outline";
    case "system":
      return "cog-outline";
    default:
      return "create-outline";
  }
}

export default function VendorMovementFeedSheet({
  visible,
  entries,
  isLoading,
  onClose,
}: {
  visible: boolean;
  entries: VendorInventoryFeedEntry[];
  isLoading: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, rV(16)) }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Stock movements</Text>
            <Text style={styles.subtitle}>Every change across your catalog</Text>
          </View>
          <TouchableOpacity onPress={onClose} activeOpacity={0.75} hitSlop={8}>
            <Ionicons name="close" size={rMS(21)} color={colors.iconMuted} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.text} />
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(entry) => entry.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <AccountEmptyState
                icon="time-outline"
                title="No movements yet"
                message="Sales, returns, manual edits and bulk updates will appear here."
              />
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Ionicons
                    name={reasonIcon(item.reason)}
                    size={rMS(15)}
                    color={colors.iconMuted}
                  />
                </View>

                <View style={styles.rowCopy}>
                  <Text style={styles.product} numberOfLines={1}>
                    {item.productTitle}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {formatVendorMovementReason(item.reason)}
                    {item.note ? ` · ${item.note}` : ""}
                    {" · "}
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.numbers}>
                  <Text
                    style={[
                      styles.delta,
                      item.delta > 0 ? styles.deltaUp : styles.deltaDown,
                    ]}
                  >
                    {item.delta > 0 ? `+${item.delta}` : String(item.delta)}
                  </Text>
                  <Text style={styles.after}>{item.stockAfter} left</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: colors.backdrop },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: rMS(22),
      borderTopRightRadius: rMS(22),
      paddingTop: rV(10),
      gap: rV(10),
      maxHeight: "82%",
    },
    handle: {
      alignSelf: "center",
      width: rS(42),
      height: rV(4),
      borderRadius: 999,
      backgroundColor: colors.cardBorder,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(10),
      paddingHorizontal: rS(20),
    },
    headerCopy: { flex: 1, gap: rV(2) },
    title: { fontFamily: Fonts.titleBold, fontSize: rMS(17), color: colors.text },
    subtitle: { fontFamily: Fonts.text, fontSize: rMS(12), color: colors.textMuted },

    loading: { paddingVertical: rV(50), alignItems: "center" },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: rS(56),
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(11),
      paddingHorizontal: rS(20),
      paddingVertical: rV(12),
    },
    iconWrap: {
      width: rMS(28),
      height: rMS(28),
      borderRadius: rMS(9),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceSubtle,
    },
    rowCopy: { flex: 1, minWidth: 0, gap: rV(3) },
    product: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.text,
    },
    meta: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: colors.textMuted,
    },
    numbers: { alignItems: "flex-end", gap: rV(2) },
    delta: { fontFamily: Fonts.titleBold, fontSize: rMS(13.5) },
    deltaUp: { color: colors.successText },
    deltaDown: { color: colors.dangerText },
    after: { fontFamily: Fonts.text, fontSize: rMS(10.5), color: colors.textMuted },
  });
}
