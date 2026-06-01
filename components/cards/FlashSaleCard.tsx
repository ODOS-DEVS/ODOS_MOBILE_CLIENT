import { rS, rV } from "@/styles/responsive";
import { useCatalogCardTextStyles, useCommerceTheme } from "@/styles/themedCommerce";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
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
  cardWidth,
  cardSpacing,
  imageHeight,
}) => {
  const { cardShell, colors } = useCommerceTheme();
  const textStyles = useCatalogCardTextStyles();
  const hasPrice = !!price || !!oldPrice;
  const hasRating = typeof rating === "number" && Number.isFinite(rating);
  const formatCurrency = (value: number) => `₵${value.toFixed(2)}`;
  const width = cardWidth ?? rS(160);
  const spacingRight = cardSpacing ?? rS(10);
  const mediaHeight = imageHeight ?? rV(180);

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
        {/* ---------- IMAGE ---------- */}
        <View
          style={{
            height: mediaHeight,
            backgroundColor: colors.imagePlaceholder,
            borderRadius: rS(16),
            overflow: "hidden",
          }}
        >
          {image ? (
            <Image
              source={image}
              resizeMode="cover"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: rS(12),
              }}
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: rV(6),
                backgroundColor: "#EEF2F7",
              }}
            >
              <Ionicons name="image-outline" size={rS(22)} color="#94A3B8" />
              <Text style={{ fontSize: rS(11), color: "#64748B", fontWeight: "600" }}>
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

          {/* Discount */}
          {discount && (
            <View
              style={{
                position: "absolute",
                top: rS(8),
                left: rS(8),
                backgroundColor: "rgba(0,0,0,0.7)",
                paddingVertical: rV(3),
                paddingHorizontal: rS(6),
                borderRadius: rS(6),
              }}
            >
              <Text
                style={{ color: "#fff", fontSize: rS(10), fontWeight: "700" }}
              >
                {discount}
              </Text>
            </View>
          )}
        </View>

        {/* ---------- TEXT ---------- */}
        <View style={{ padding: rS(10) }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: rS(6),
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: rS(13),
                fontWeight: "700",
                color: "#222",
                flex: 1,
              }}
            >
              {title}
            </Text>

            {/* Rating */}
            {hasRating ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Ionicons name="star" size={rS(14)} color="#facc15" />
                <Text
                  style={{
                    marginLeft: rS(2),
                    fontSize: rS(11),
                    fontWeight: "700",
                    color: "#444",
                  }}
                >
                  {rating!.toFixed(1)}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: rV(3),
              gap: rS(6),
            }}
          >
            {category && (
              <Text
                style={{ fontSize: rS(11), color: "#777", flex: 1 }}
                numberOfLines={1}
              >
                {category}
              </Text>
            )}
            {/* {reviews && (
              <Text
                style={{ fontSize: rS(11), color: "#777" }}
                numberOfLines={1}
              >
                {reviews}
              </Text>
            )} */}
          </View>

          {/* ---------- PRICE + RATING ---------- */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: rV(5),
            }}
          >
            {/* Price Section */}
            {hasPrice && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {price && (
                  <Text
                    style={{
                      fontSize: rS(13),
                      fontWeight: "800",
                      color: "#222",
                    }}
                  >
                    {formatCurrency(price)}
                  </Text>
                )}

                {oldPrice && (
                  <Text
                    style={{
                      fontSize: rS(11),
                      marginLeft: rS(6),
                      color: "red",
                      textDecorationLine: "line-through",
                      fontWeight: "700",
                    }}
                  >
                    {formatCurrency(oldPrice)}
                  </Text>
                )}
              </View>
            )}

            {/* Rating
            {rating && (
              <View
                style={{
                  marginLeft: "auto",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons name="star" size={rS(14)} color="#facc15" />
                <Text
                  style={{
                    marginLeft: rS(3),
                    fontSize: rS(11),
                    fontWeight: "700",
                    color: "#444",
                  }}
                >
                  {rating.toFixed(1)}
                </Text>
              </View>
            )} */}
          </View>
        </View>

        <View style={{ paddingHorizontal: rS(4) }}></View>
      </View>
    </TouchableOpacity>
  );
};

export default FlashSalesCard;
