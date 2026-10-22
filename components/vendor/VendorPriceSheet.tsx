import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import type { VendorProduct } from "@/types/store";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * Repricing one product, without the full product form.
 *
 * Changing a price is the most frequent edit a vendor makes — matching a
 * competitor, running a weekend discount, correcting a typo — and routing it
 * through the create/edit screen meant loading every field, image picker
 * included, to change one number.
 *
 * Compare-at sits here too rather than in a separate "promotions" flow,
 * because a discount is only ever two numbers and the vendor is already
 * holding one of them. The struck-through price shoppers see is derived from
 * `oldPrice`, so the sheet shows the resulting discount live — a vendor should
 * not have to work out what "35 from 50" looks like on the storefront.
 *
 * Both fields accept whole cedis only, because that is the actual backend
 * contract: `VendorProductUpdate.price` / `.old_price` are `int`, and the form
 * parser runs a bare `int(value)` that raises on "85.50". The full edit form
 * still allows a decimal here and fails on save — worth fixing there, but this
 * sheet is not the place to ship the same break twice.
 */
export default function VendorPriceSheet({
  product,
  isSaving,
  onSave,
  onClose,
}: {
  /** The product being repriced; null closes the sheet. */
  product: VendorProduct | null;
  isSaving: boolean;
  onSave: (input: { price: number; oldPrice?: number }) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  /**
   * The edit in progress, tagged with the product it belongs to.
   *
   * Seeding these fields from an effect would re-render the sheet once per
   * open and trips `react-hooks/set-state-in-effect`. Tagging the draft with
   * its product id lets a *different* product discard a stale draft on sight,
   * so the values are derived rather than synchronised — the same shape the
   * orders queue uses for its deep-linked tab.
   */
  const [draft, setDraft] = useState<{
    productId: string;
    price: string;
    compareAt: string;
  } | null>(null);

  const active =
    draft && product && draft.productId === product.id
      ? draft
      : {
          productId: product?.id ?? "",
          price: product && product.price > 0 ? String(product.price) : "",
          compareAt: product?.oldPrice ? String(product.oldPrice) : "",
        };

  const priceDraft = active.price;
  const compareDraft = active.compareAt;
  const setPriceDraft = (value: string) => setDraft({ ...active, price: value });
  const setCompareDraft = (value: string) => setDraft({ ...active, compareAt: value });

  const price = Number(priceDraft);
  const compareAt = Number(compareDraft);
  const hasValidPrice = Number.isFinite(price) && price > 0;
  const hasCompare = compareDraft.trim().length > 0 && Number.isFinite(compareAt);

  /**
   * A compare-at below the asking price would render as a negative discount on
   * the storefront, so it is rejected here rather than shipped to shoppers.
   */
  const compareError =
    hasCompare && hasValidPrice && compareAt <= price
      ? "Compare-at must be higher than the price to show a discount."
      : null;

  const discountPercent =
    hasCompare && hasValidPrice && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : null;

  const canSave = hasValidPrice && !compareError && !isSaving;

  const variantSummary = useMemo(() => {
    if (!product) {
      return null;
    }
    const parts: string[] = [];
    const sizes = product.sizeOptions?.length ?? 0;
    const colorCount = product.colorOptions?.length ?? 0;
    if (sizes > 0) {
      parts.push(`${sizes} size${sizes === 1 ? "" : "s"}`);
    }
    if (colorCount > 0) {
      parts.push(`${colorCount} colour${colorCount === 1 ? "" : "s"}`);
    }
    return parts.length > 0 ? parts.join(" · ") : null;
  }, [product]);

  /**
   * Nothing is mounted while the sheet is closed.
   *
   * This used to render a `<Modal visible={false}>` on every pass of the
   * products list, and that modal contains an `autoFocus` TextInput. A focus
   * request against a node inside a hidden modal is not a no-op — it logged a
   * component stack with an empty message, repeatedly, on the Products screen
   * and nowhere else, because this is the only sheet in the vendor workspace
   * that takes focus on mount.
   *
   * Mounting on demand also means the field is genuinely fresh each time, so
   * `autoFocus` does what it says and raises the keyboard with the sheet
   * instead of competing with a list that is still rendering behind it.
   *
   * Every hook above runs unconditionally, so this early return is safe.
   */
  if (!product) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardWrap}
        >
          {/* Swallows the backdrop press so tapping inside never dismisses. */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />

            <Text style={styles.title} numberOfLines={2}>
              {product?.name ?? "Price"}
            </Text>
            <Text style={styles.subtitle}>
              {product ? `Currently ${formatCurrency(product.price)}` : ""}
              {variantSummary ? ` · ${variantSummary}` : ""}
            </Text>

            <View style={styles.fieldRow}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Price</Text>
                <TextInput
                  value={priceDraft}
                  onChangeText={(text) => setPriceDraft(text.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  autoFocus
                  selectTextOnFocus
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Compare at</Text>
                <TextInput
                  value={compareDraft}
                  onChangeText={(text) => setCompareDraft(text.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  placeholder="Optional"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            {compareError ? (
              <View style={styles.noticeError}>
                <Ionicons
                  name="alert-circle-outline"
                  size={rMS(13)}
                  color={colors.dangerText}
                />
                <Text style={styles.noticeErrorText}>{compareError}</Text>
              </View>
            ) : discountPercent !== null ? (
              <View style={styles.noticeGood}>
                <Ionicons name="pricetag" size={rMS(13)} color={colors.successText} />
                <Text style={styles.noticeGoodText}>
                  Shoppers see {discountPercent}% off — {formatCurrency(price)} down from{" "}
                  {formatCurrency(compareAt)}.
                </Text>
              </View>
            ) : (
              <Text style={styles.hint}>
                Set a compare-at price to show a struck-through original and a
                discount badge on your storefront.
              </Text>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancel}
                activeOpacity={0.75}
                onPress={onClose}
              >
                <Text style={styles.cancelLabel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.save, !canSave && styles.saveDisabled]}
                activeOpacity={0.8}
                disabled={!canSave}
                onPress={() =>
                  onSave({
                    price,
                    // An empty compare-at clears the discount rather than
                    // leaving a stale one on the storefront.
                    oldPrice: hasCompare ? compareAt : 0,
                  })
                }
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.onInverseSurface} />
                ) : (
                  <Text style={styles.saveLabel}>Save price</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: colors.backdrop, justifyContent: "flex-end" },
    keyboardWrap: { justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: rMS(22),
      borderTopRightRadius: rMS(22),
      paddingHorizontal: rS(20),
      paddingTop: rV(10),
      paddingBottom: rV(28),
      gap: rV(12),
    },
    handle: {
      alignSelf: "center",
      width: rS(42),
      height: rV(4),
      borderRadius: 999,
      backgroundColor: colors.cardBorder,
      marginBottom: rV(4),
    },
    title: { fontFamily: Fonts.titleBold, fontSize: rMS(17), color: colors.text },
    subtitle: {
      marginTop: -rV(6),
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
    },

    fieldRow: { flexDirection: "row", gap: rS(12) },
    field: { flex: 1, gap: rV(6) },
    fieldLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(10.5),
      letterSpacing: 0.5,
      textTransform: "uppercase",
      color: colors.textMuted,
    },
    input: {
      paddingHorizontal: rS(13),
      paddingVertical: rV(12),
      borderRadius: rMS(11),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBg,
      fontFamily: Fonts.titleBold,
      fontSize: rMS(16),
      color: colors.text,
    },

    noticeError: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(6),
      paddingHorizontal: rS(11),
      paddingVertical: rV(9),
      borderRadius: rMS(10),
      backgroundColor: colors.dangerSoft,
    },
    noticeErrorText: {
      flex: 1,
      fontFamily: Fonts.title,
      fontSize: rMS(11.5),
      color: colors.dangerText,
    },
    noticeGood: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(6),
      paddingHorizontal: rS(11),
      paddingVertical: rV(9),
      borderRadius: rMS(10),
      backgroundColor: colors.successSoft,
    },
    noticeGoodText: {
      flex: 1,
      fontFamily: Fonts.title,
      fontSize: rMS(11.5),
      color: colors.successText,
    },
    hint: {
      fontFamily: Fonts.text,
      fontSize: rMS(11.5),
      lineHeight: rMS(16),
      color: colors.textMuted,
    },

    actions: { flexDirection: "row", alignItems: "center", gap: rS(10) },
    cancel: {
      paddingHorizontal: rS(16),
      paddingVertical: rV(13),
      borderRadius: rMS(11),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    cancelLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.text,
    },
    save: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: rV(13),
      borderRadius: rMS(11),
      backgroundColor: colors.inverseSurface,
    },
    saveDisabled: { opacity: 0.45 },
    saveLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.onInverseSurface,
    },
  });
}
