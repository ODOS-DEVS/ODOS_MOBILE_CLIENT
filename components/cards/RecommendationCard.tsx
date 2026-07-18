import CommerceImage from "@/components/media/CommerceImage";
import { AppColors } from "@/constants/Colors";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { openProductDetail } from "@/utils/productNavigation";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddToCartBtn from "../buttons/AddToCartBtn";
import AddToWishList from "../buttons/AddToWishList";

function formatCurrency(value: number) {
  return `₵${value.toFixed(2)}`;
}

function buildOfferLabel(
  discount?: string,
  oldPrice?: number,
  price?: number,
) {
  if (discount?.trim()) {
    return discount.trim();
  }

  if (
    typeof oldPrice === "number" &&
    typeof price === "number" &&
    oldPrice > price &&
    price > 0
  ) {
    const percent = Math.round(((oldPrice - price) / oldPrice) * 100);
    return `${percent}% OFF`;
  }

  return null;
}

interface RecommendationCardProps {
  id: string;
  image: any;
  imageKey?: string;
  imageUrl?: string;
  title: string;
  category?: string;
  subcategory?: string;
  oldPrice?: number;
  price?: number;
  discount?: string;
  rating?: number;
  reviews?: number | string;
  badgeLabel?: string;
  sourceScreen?: string;
  storeId?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  id,
  image,
  imageKey,
  imageUrl,
  title,
  category,
  subcategory,
  oldPrice,
  price,
  discount,
  rating,
  reviews,
  badgeLabel = "ODOS Pick",
  sourceScreen = "recommendations",
  storeId,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createRecommendationStyles(colors), [colors]);
  const { width } = useResponsive();
  const hasPrice = typeof price === "number" || typeof oldPrice === "number";
  const hasRating = typeof rating === "number" && Number.isFinite(rating);
  const offerLabel = buildOfferLabel(discount, oldPrice, price);
  const isLargeAndroidScreen = Platform.OS === "android" && width >= 500;
  const reviewCount =
    typeof reviews === "number"
      ? reviews
      : Number.isFinite(Number(reviews))
        ? Number(reviews)
        : undefined;
  const metaLabel = subcategory ?? category;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() =>
        openProductDetail(
          {
            id,
            image,
            imageKey,
            imageUrl,
            title,
            category,
            oldPrice,
            price,
            discount,
            rating,
            reviews,
          },
          {
            sourceScreen,
            storeId,
            eventType: "product_click",
          },
        )
      }
    >
      <View style={styles.card}>
        <View
          style={[
            styles.imageShell,
            isLargeAndroidScreen ? styles.imageShellLargeAndroid : null,
          ]}
        >
          {image ? (
            <CommerceImage
              source={image}
              style={styles.image}
              trackingId={`recommendation-${id}`}
              recyclingKey={imageKey || imageUrl || id}
              placeholderColor={colors.imagePlaceholder}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={rMS(22)} color={colors.iconMuted} />
              <Text style={styles.imagePlaceholderText}>Image pending</Text>
            </View>
          )}
          {offerLabel ? (
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>{offerLabel}</Text>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.content,
            isLargeAndroidScreen ? styles.contentLargeAndroid : null,
          ]}
        >
          <View style={styles.topRow}>
            <View style={styles.pill}>
              <Ionicons name="sparkles-outline" size={rMS(12)} color="#8A6A2E" />
              <Text style={styles.pillText}>{badgeLabel}</Text>
            </View>

            {hasRating ? (
              <View style={styles.ratingWrap}>
                <Ionicons name="star" size={rMS(13)} color="#F4B740" />
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              </View>
            ) : null}
          </View>

          <Text
            style={[
              styles.title,
              isLargeAndroidScreen ? styles.titleLargeAndroid : null,
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>

          {metaLabel ? (
            <Text
              style={[
                styles.metaLabel,
                isLargeAndroidScreen ? styles.metaLabelLargeAndroid : null,
              ]}
              numberOfLines={1}
            >
              {metaLabel}
            </Text>
          ) : null}

          <View
            style={[
              styles.subMetaRow,
              isLargeAndroidScreen ? styles.subMetaRowLargeAndroid : null,
            ]}
          >
            {category ? (
              <View style={styles.microChip}>
                <Text style={styles.microChipText} numberOfLines={1}>
                  {category}
                </Text>
              </View>
            ) : null}

            {reviewCount ? (
              <Text style={styles.reviewText}>
                {reviewCount} review{reviewCount === 1 ? "" : "s"}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.bottomRow,
              isLargeAndroidScreen ? styles.bottomRowLargeAndroid : null,
            ]}
          >
            <View style={styles.priceBlock}>
              {hasPrice ? (
                <>
                  {typeof price === "number" ? (
                    <Text style={styles.priceText}>{formatCurrency(price)}</Text>
                  ) : null}

                  {typeof oldPrice === "number" ? (
                    <Text style={styles.oldPriceText}>
                      {formatCurrency(oldPrice)}
                    </Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.noPriceText}>Check latest price</Text>
              )}
            </View>

            <View style={styles.actionRow}>
              <AddToWishList
                size={rMS(15)}
                iconColor={AppColors.secondary}
                activeIconColor="#D64747"
                containerStyle={styles.actionButton}
                product={{
                  id,
                  image,
                  title,
                  category,
                  oldPrice,
                  price,
                  rating,
                  reviews,
                }}
              />
              <AddToCartBtn
                iconSize={rMS(15)}
                iconColor={AppColors.primary}
                containerStyle={styles.actionButton}
                item={{
                  id,
                  title,
                  category,
                  price: price ?? 0,
                  image,
                  imageKey,
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

function createRecommendationStyles(colors: ThemeColors) {
  return StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: rS(22),
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    padding: rS(12),
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  imageShell: {
    width: rS(106),
    height: rS(118),
    borderRadius: rS(18),
    overflow: "hidden",
    backgroundColor: colors.imagePlaceholder,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: rV(6),
    backgroundColor: colors.imagePlaceholder,
  },
  imagePlaceholderText: {
    fontSize: rMS(11),
    fontFamily: Fonts.title,
    color: colors.textMuted,
  },
  offerBadge: {
    position: "absolute",
    top: rV(8),
    left: rS(8),
    paddingHorizontal: rS(8),
    paddingVertical: rV(4),
    borderRadius: rS(999),
    backgroundColor: "rgba(17, 24, 39, 0.82)",
  },
  offerBadgeText: {
    color: colors.onPrimary,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10),
    letterSpacing: 0.25,
  },
  content: {
    flex: 1,
    marginLeft: rS(12),
    justifyContent: "flex-start",
  },
  contentLargeAndroid: {
    marginLeft: rS(10),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(8),
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    borderRadius: rS(999),
    paddingHorizontal: rS(9),
    paddingVertical: rV(4),
    backgroundColor: "#F6EFE1",
  },
  pillText: {
    fontFamily: Fonts.title,
    fontSize: rMS(10),
    color: "#8A6A2E",
    letterSpacing: 0.3,
  },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(4),
    paddingHorizontal: rS(8),
    paddingVertical: rV(4),
    borderRadius: rS(999),
    backgroundColor: colors.accentSoft,
  },
  ratingText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    color: colors.text,
  },
  title: {
    marginTop: rV(8),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: colors.text,
    lineHeight: rMS(19),
  },
  titleLargeAndroid: {
    marginTop: rV(5),
    lineHeight: rMS(17),
  },
  metaLabel: {
    marginTop: rV(4),
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: colors.textMuted,
  },
  metaLabelLargeAndroid: {
    marginTop: rV(2),
  },
  subMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    marginTop: rV(8),
    flexWrap: "wrap",
  },
  subMetaRowLargeAndroid: {
    marginTop: rV(3),
  },
  microChip: {
    borderRadius: rS(999),
    backgroundColor: colors.pill,
    paddingHorizontal: rS(8),
    paddingVertical: rV(4),
    maxWidth: "72%",
  },
  microChipText: {
    fontFamily: Fonts.text,
    fontSize: rMS(10),
    color: colors.textSecondary,
  },
  reviewText: {
    fontFamily: Fonts.text,
    fontSize: rMS(10),
    color: colors.textMuted,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: rS(10),
    marginTop: rV(12),
  },
  bottomRowLargeAndroid: {
    marginTop: rV(4),
  },
  priceBlock: {
    flex: 1,
    justifyContent: "flex-end",
  },
  priceText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    color: colors.text,
  },
  oldPriceText: {
    marginTop: rV(3),
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    color: "#F87171",
    textDecorationLine: "line-through",
  },
  noPriceText: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    flexShrink: 0,
  },
  actionButton: {
    backgroundColor: colors.pill,
    padding: rS(9),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    elevation: 0,
  },
  imageShellLargeAndroid: {
    width: rS(96),
    height: rS(114),
  },
  });
}

export default RecommendationCard;
