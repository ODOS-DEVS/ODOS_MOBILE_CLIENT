import AddToCartBtn from "@/components/buttons/AddToCartBtn";
import AddToWishList from "@/components/buttons/AddToWishList";
import { useTheme } from "@/context/ThemeContext";
import { createProductDetailStyles } from "@/styles/productDetailStyles";
import { rMS } from "@/styles/responsive";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ProductDetailBottomBarProps = {
  priceLabel: string;
  variantLabel?: string;
  horizontalPadding: number;
  wishlistProduct: {
    id: string;
    image?: unknown;
    title: string;
    category: string;
    price: number;
    oldPrice: number;
    rating: number;
    reviews: number;
  };
  cartItem: {
    id: string;
    title: string;
    category: string;
    price: number;
    image?: unknown;
    imageKey?: string;
  };
  onBuyNow: () => void;
};

export default function ProductDetailBottomBar({
  priceLabel,
  variantLabel,
  horizontalPadding,
  wishlistProduct,
  cartItem,
  onBuyNow,
}: ProductDetailBottomBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createProductDetailStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.bottomBar,
        {
          paddingBottom: Math.max(insets.bottom, rMS(8)),
          paddingHorizontal: horizontalPadding,
        },
      ]}
    >
      <View style={styles.bottomMainRow}>
        <AddToWishList
          product={wishlistProduct}
          size={18}
          iconColor={colors.textMuted}
          activeIconColor="#E11D48"
          containerStyle={styles.bottomWishlistButton}
        />

        <View style={styles.bottomPriceBlock}>
          <Text
            style={styles.bottomPriceValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {priceLabel}
          </Text>
          {variantLabel ? (
            <Text style={styles.bottomVariantText} numberOfLines={1}>
              {variantLabel}
            </Text>
          ) : null}
        </View>

        <View style={styles.bottomActionsRow}>
          <AddToCartBtn
            variant="stepper"
            stepperLayout="fixed"
            stepperTone="compact"
            stepperIdleLabel="Add"
            item={cartItem}
            iconSize={15}
          />

          <TouchableOpacity
            style={styles.buyNowBtn}
            activeOpacity={0.9}
            onPress={onBuyNow}
            accessibilityRole="button"
            accessibilityLabel="Buy now"
          >
            <Text style={styles.buyNowText} numberOfLines={1}>
              Buy now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
