import { useTheme } from "@/context/ThemeContext";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CartItemProps {
  id: string;
  title: string;
  category?: string;
  price: number;
  image?: any;
  imageKey?: string;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  embedded?: boolean;
  showDivider?: boolean;
}

const CartItemCard = ({
  id,
  image,
  imageKey,
  title,
  category,
  price,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
  embedded = false,
  showDivider = false,
}: CartItemProps) => {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        divider: {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        },
        card: {
          backgroundColor: colors.card,
          borderRadius: rMS(16),
          paddingHorizontal: rS(10),
          paddingVertical: rV(10),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
        },
        cardEmbedded: {
          borderWidth: 0,
          borderRadius: 0,
          paddingHorizontal: rS(12),
          backgroundColor: "transparent",
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(10),
        },
        imageWrap: {
          width: rS(58),
          height: rS(58),
          borderRadius: rMS(14),
          overflow: "hidden",
          backgroundColor: colors.imagePlaceholder,
        },
        image: {
          width: "100%",
          height: "100%",
        },
        imageFallback: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
        copy: {
          flex: 1,
          gap: rV(2),
        },
        titleLine: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
        },
        title: {
          flex: 1,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12.5),
          color: colors.text,
        },
        removeHit: {
          padding: rS(2),
        },
        category: {
          fontFamily: Fonts.text,
          fontSize: rMS(10.5),
          color: colors.textMuted,
        },
        actionRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: rV(4),
        },
        stepper: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.accentSoft,
          borderRadius: rS(999),
          paddingHorizontal: rS(4),
          paddingVertical: rV(3),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        stepBtn: {
          width: rS(24),
          height: rS(24),
          borderRadius: rS(12),
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.cardElevated,
        },
        stepBtnDisabled: {
          backgroundColor: colors.accentSoft,
        },
        qty: {
          minWidth: rS(20),
          textAlign: "center",
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.text,
          marginHorizontal: rS(2),
        },
        priceCol: {
          alignItems: "flex-end",
        },
        lineTotal: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13.5),
          color: colors.text,
        },
        unit: {
          fontFamily: Fonts.text,
          fontSize: rMS(10),
          color: colors.textMuted,
          marginTop: rV(1),
        },
      }),
    [colors],
  );

  const lineTotal = price * quantity;

  const openProduct = () => {
    router.push({
      pathname: "/screens/[id]" as any,
      params: { id, title, category, price, imageKey },
    });
  };

  return (
    <View style={[embedded && showDivider && styles.divider]}>
      <View style={[styles.card, embedded && styles.cardEmbedded]}>
        <TouchableOpacity activeOpacity={0.92} onPress={openProduct} style={styles.row}>
          <View style={styles.imageWrap}>
            {image ? (
              <Image source={image} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.imageFallback}>
                <Ionicons name="bag-outline" size={rS(18)} color={colors.iconMuted} />
              </View>
            )}
          </View>

          <View style={styles.copy}>
            <View style={styles.titleLine}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <TouchableOpacity
                onPress={onRemove}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.removeHit}
              >
                <Ionicons name="close" size={rS(14)} color={colors.iconMuted} />
              </TouchableOpacity>
            </View>

            {category ? (
              <Text style={styles.category} numberOfLines={1}>
                {category}
              </Text>
            ) : null}

            <View style={styles.actionRow}>
              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={onDecrease}
                  disabled={quantity <= 1}
                  style={[styles.stepBtn, quantity <= 1 && styles.stepBtnDisabled]}
                >
                  <Ionicons
                    name="remove"
                    size={rS(14)}
                    color={quantity <= 1 ? colors.placeholder : colors.text}
                  />
                </TouchableOpacity>
                <Text style={styles.qty}>{quantity}</Text>
                <TouchableOpacity onPress={onIncrease} style={styles.stepBtn}>
                  <Ionicons name="add" size={rS(14)} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.priceCol}>
                <Text style={styles.lineTotal}>{formatCurrency(lineTotal)}</Text>
                <Text style={styles.unit}>{formatCurrency(price)} ea</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartItemCard;
