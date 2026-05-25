import AddToCartBtn from "@/components/buttons/AddToCartBtn";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type WishlistTileCardProps = {
  id: string;
  image: any;
  title: string;
  category?: string;
  price?: number;
  oldPrice?: number;
  rating?: number;
  reviews?: number;
  cardWidth: number;
  onRemove: () => void;
};

function buildDiscountLabel(oldPrice?: number, price?: number) {
  if (
    typeof oldPrice === "number" &&
    typeof price === "number" &&
    oldPrice > price &&
    price > 0
  ) {
    return `${Math.round(((oldPrice - price) / oldPrice) * 100)}% off`;
  }

  return null;
}

export default function WishlistTileCard({
  id,
  image,
  title,
  category,
  price,
  oldPrice,
  rating,
  reviews,
  cardWidth,
  onRemove,
}: WishlistTileCardProps) {
  const offerLabel = buildDiscountLabel(oldPrice, price);
  const hasPrice = typeof price === "number";

  const openProduct = () => {
    router.push({
      pathname: "/screens/[id]" as any,
      params: { id, title, category, price, oldPrice, rating, reviews },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.94}
      onPress={openProduct}
      style={[styles.card, { width: cardWidth }]}
    >
      <View style={styles.imageShell}>
        {image ? (
          <Image source={image} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="heart-outline" size={rS(20)} color="#F472B6" />
          </View>
        )}

        <View style={styles.savedPill}>
          <Ionicons name="heart" size={rS(10)} color="#FFFFFF" />
          <Text style={styles.savedPillText}>Saved</Text>
        </View>

        {offerLabel ? (
          <View style={styles.offerPill}>
            <Text style={styles.offerPillText}>{offerLabel}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {category ? (
          <Text style={styles.category} numberOfLines={1}>
            {category}
          </Text>
        ) : null}

        <View style={styles.priceRow}>
          {hasPrice ? (
            <Text style={styles.price}>{formatCurrency(price)}</Text>
          ) : (
            <Text style={styles.priceMuted}>See price</Text>
          )}
          {typeof oldPrice === "number" ? (
            <Text style={styles.oldPrice}>{formatCurrency(oldPrice)}</Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <AddToCartBtn
            item={{
              id,
              title,
              category,
              price: price ?? 0,
              image,
            }}
            iconSize={rS(14)}
            iconColor={AppColors.primary}
            containerStyle={styles.cartBtn}
          />
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeBtn}
            activeOpacity={0.86}
          >
            <Ionicons name="heart-dislike-outline" size={rS(15)} color="#E11D48" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: rMS(18),
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FBCFE8",
    overflow: "hidden",
    marginBottom: rV(10),
    shadowColor: "#FB7185",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  imageShell: {
    height: rV(96),
    backgroundColor: "#FFF1F2",
    position: "relative",
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
  savedPill: {
    position: "absolute",
    top: rS(8),
    right: rS(8),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(4),
    paddingHorizontal: rS(8),
    paddingVertical: rV(4),
    borderRadius: rS(999),
    backgroundColor: "#F43F5E",
  },
  savedPillText: {
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(9),
    letterSpacing: 0.2,
  },
  offerPill: {
    position: "absolute",
    top: rS(8),
    left: rS(8),
    paddingHorizontal: rS(7),
    paddingVertical: rV(3),
    borderRadius: rS(8),
    backgroundColor: "rgba(17, 24, 39, 0.78)",
  },
  offerPillText: {
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(9),
  },
  body: {
    paddingHorizontal: rS(10),
    paddingTop: rV(8),
    paddingBottom: rV(10),
    gap: rV(3),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    lineHeight: rMS(16),
    color: AppColors.text,
    minHeight: rV(32),
  },
  category: {
    fontFamily: Fonts.text,
    fontSize: rMS(10),
    color: "#9CA3AF",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: rS(6),
    flexWrap: "wrap",
    marginTop: rV(2),
  },
  price: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: AppColors.text,
  },
  priceMuted: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#9CA3AF",
  },
  oldPrice: {
    fontFamily: Fonts.text,
    fontSize: rMS(10),
    color: "#CBD5E1",
    textDecorationLine: "line-through",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: rV(6),
  },
  cartBtn: {
    backgroundColor: "#F8FAFC",
    padding: rS(8),
    borderRadius: rS(999),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  removeBtn: {
    width: rS(32),
    height: rS(32),
    borderRadius: rS(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F2",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FECDD3",
  },
});
