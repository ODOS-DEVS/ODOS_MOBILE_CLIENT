import CommerceImage from "@/components/media/CommerceImage";
import FlashSaleCountdown from "@/components/deals/FlashSaleCountdown";
import { rS, rV } from "@/styles/responsive";
import { useCatalogCardTextStyles, useCommerceTheme } from "@/styles/themedCommerce";
import { formatDealBadge, formatCurrency, formatSavingsAmount } from "@/utils/deals";
import { getSecondsRemaining } from "@/utils/countdown";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AddToCartBtn from "../buttons/AddToCartBtn";
import AddToWishList from "../buttons/AddToWishList";

interface FlashSalesCardProps {
  id: string;
  image: any;
  title: string;
  category?: string;
  price?: number;
  oldPrice?: number;
  discount?: string;
  rating?: number;
  reviews?: any;
  stock?: number;
  flashSaleEndsAt?: string;
  cardWidth?: number;
  cardSpacing?: number;
  imageHeight?: number;
}

const FlashSalesCard: React.FC<FlashSalesCardProps> = ({
  id,
  image,
  title,
  category,
  price,
  oldPrice,
  discount,
  rating,
  reviews,
  stock,
  flashSaleEndsAt,
  cardWidth,
  cardSpacing,
  imageHeight,
}) => {
  const { cardShell, colors } = useCommerceTheme();
  const textStyles = useCatalogCardTextStyles();
  const hasPrice = !!price || !!oldPrice;
  const hasRating = typeof rating === "number" && Number.isFinite(rating);
  const dealBadge = formatDealBadge({ discount, oldPrice, price });
  const savingsAmount = formatSavingsAmount(price, oldPrice);
  const width = cardWidth ?? rS(160);
  const spacingRight = cardSpacing ?? rS(10);
  const mediaHeight = imageHeight ?? rV(180);
  const isLowStock = typeof stock === "number" && stock > 0 && stock <= 5;
  const hasLiveFlashCountdown = getSecondsRemaining(flashSaleEndsAt) > 0;
  const metaLineHeight = rV(14);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/screens/[id]",
          params: {
            id,
            image,
            title,
            category,
            price,
            oldPrice,
            discount,
            rating,
            reviews,
          },
        })
      }
      style={{
        width,
        marginRight: spacingRight,
        marginBottom: rV(15),
        marginTop: rV(10),
      }}
    >
      <View
        style={{
          borderRadius: rS(16),
          ...cardShell,
        }}
      >
        <View
          style={{
            height: mediaHeight,
            backgroundColor: colors.imagePlaceholder,
            borderRadius: rS(16),
            overflow: "hidden",
          }}
        >
          {image ? (
            <CommerceImage
              source={image}
              trackingId={`flash-${id}`}
              placeholderColor={colors.imagePlaceholder}
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: rV(6),
                backgroundColor: colors.imagePlaceholder,
              }}
            >
              <Ionicons name="image-outline" size={rS(22)} color={colors.iconMuted} />
              <Text style={[textStyles.placeholderLabel, { fontSize: rS(11) }]}>
                Image pending
              </Text>
            </View>
          )}

          <View className="absolute top-2 bottom-2 right-2 flex-col gap-5 py-2">
            <AddToWishList
              product={{
                id,
                image,
                title,
                category,
                price,
                oldPrice,
                rating,
                reviews,
              }}
            />
            <AddToCartBtn
              item={{
                id,
                title,
                category,
                price: price ?? 0,
                image,
              }}
            />
          </View>

          {dealBadge ? (
            <View
              style={{
                position: "absolute",
                top: rS(8),
                left: rS(8),
                backgroundColor: "rgba(17, 24, 39, 0.88)",
                paddingVertical: rV(4),
                paddingHorizontal: rS(8),
                borderRadius: rS(999),
              }}
            >
              <Text
                style={{
                  color: "#FCD34D",
                  fontSize: rS(10),
                  fontWeight: "700",
                  letterSpacing: 0.2,
                }}
              >
                {dealBadge}
              </Text>
            </View>
          ) : null}

          {hasLiveFlashCountdown ? (
            <View
              style={{
                position: "absolute",
                bottom: rS(8),
                left: rS(8),
              }}
            >
              <FlashSaleCountdown endsAt={flashSaleEndsAt} tone="gold" />
            </View>
          ) : null}
        </View>

        <View style={{ padding: rS(10) }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: rS(6),
            }}
          >
            <Text numberOfLines={1} style={[textStyles.title, { flex: 1 }]}>
              {title}
            </Text>

            {hasRating ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Ionicons name="star" size={rS(14)} color="#facc15" />
                <Text style={[textStyles.rating, { marginLeft: rS(2), fontWeight: "700", fontSize: rS(11) }]}>
                  {rating!.toFixed(1)}
                </Text>
              </View>
            ) : null}
          </View>

          {category ? (
            <Text
              style={[textStyles.category, { marginTop: rV(3), fontSize: rS(11) }]}
              numberOfLines={1}
            >
              {category}
            </Text>
          ) : (
            <View style={{ marginTop: rV(3), height: rV(13) }} />
          )}

          {hasPrice ? (
            <View style={{ marginTop: rV(8) }}>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                {price != null ? (
                  <Text style={[textStyles.price, { fontSize: rS(14) }]}>
                    {formatCurrency(price)}
                  </Text>
                ) : null}
                {oldPrice != null ? (
                  <Text
                    style={[
                      textStyles.oldPrice,
                      {
                        marginLeft: rS(6),
                        textDecorationLine: "line-through",
                        fontSize: rS(11),
                      },
                    ]}
                  >
                    {formatCurrency(oldPrice)}
                  </Text>
                ) : null}
              </View>
              <View style={{ marginTop: rV(3), minHeight: metaLineHeight, justifyContent: "center" }}>
                {savingsAmount ? (
                  <Text style={{ color: "#059669", fontWeight: "700", fontSize: rS(11) }}>
                    Save {savingsAmount}
                  </Text>
                ) : null}
              </View>
              <View style={{ minHeight: metaLineHeight, justifyContent: "center" }}>
                {isLowStock ? (
                  <Text style={{ color: "#B45309", fontWeight: "700", fontSize: rS(11) }}>
                    Only {stock} left
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FlashSalesCard;
