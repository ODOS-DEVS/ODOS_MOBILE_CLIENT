import { rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import AddToCartBtn from "../buttons/AddToCartBtn";
import AddToWishList from "../buttons/AddToWishList";

function formatCurrency(value: number) {
  return `₵${value.toFixed(2)}`;
}

interface ProductCardProps {
  id: string;
  image: any;
  imageKey?: string;
  imageUrl?: string;
  title: string;
  category?: string;
  price?: number;
  oldPrice?: number;
  discount?: string;
  rating?: number;
  reviews?: any;
  /** Optional width for grid layouts (e.g. search results); otherwise uses scaled default */
  cardWidth?: number;
  /** Optional override for horizontal spacing (margin-right) to tune grid gaps */
  horizontalSpacing?: number;
}

export type { ProductCardProps };

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  imageKey,
  imageUrl,
  title,
  category,
  price,
  oldPrice,
  discount,
  rating,
  reviews,
  cardWidth,
  horizontalSpacing,
}) => {
  const hasPrice = !!price || !!oldPrice;
  const hasRating = typeof rating === "number" && Number.isFinite(rating);
  const width = cardWidth ?? rS(160);
  const imageHeight = rV(130);
  const spacingRight = horizontalSpacing ?? rS(12);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/screens/[id]" as any,
          params: {
            id,
            image: imageUrl ?? imageKey,
            imageKey,
            imageUrl,
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
    >
      <View
        className="bg-white shadow-sm"
        style={{
          width,
          borderRadius: rS(16),
          marginRight: spacingRight,
          marginBottom: rV(16),
          marginTop: rV(4),
        }}
      >
        {/* ---------- IMAGE SECTION ---------- */}
        <View
          style={{
            position: "relative",
            height: imageHeight,
            backgroundColor: "#f3f4f6",
            borderTopLeftRadius: rS(16),
            borderTopRightRadius: rS(16),
            borderBottomLeftRadius: rS(16),
            borderBottomRightRadius: rS(16),
            overflow: "hidden",
          }}
        >
          <Image
            source={image}
            className="w-full h-full bg-tertiary"
            resizeMode="cover"
          />

          {/* Discount badge */}
          {discount && (
            <View
              style={{
                position: "absolute",
                top: rV(8),
                left: rS(8),
                backgroundColor: "#1f2937",
                paddingHorizontal: rS(8),
                paddingVertical: rV(4),
                borderRadius: rS(6),
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: rS(10),
                  fontWeight: "600",
                }}
              >
                {discount}
              </Text>
            </View>
          )}

          <View
            style={{
              position: "absolute",
              top: rV(4),
              bottom: rV(8),
              right: rS(4),
              flexDirection: "column",
              gap: rV(10),
              paddingVertical: rV(4),
            }}
          >
            <AddToWishList
              product={{
                id,
                image,
                title,
                category,
                price,
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
        </View>

        {/* ---------- TEXT SECTION ---------- */}
        <View style={{ padding: rS(12) }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: rS(2),
            }}
          >
            <Text
              className="font-montserrat-bold text-text"
              style={{ fontSize: rS(13), flex: 1 }}
              numberOfLines={1}
            >
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
                <Text
                  className="ml-1 text-subtext-200 font-montserrat-extraBold"
                  style={{ fontSize: rS(12), marginLeft: rS(4) }}
                >
                  {rating!.toFixed(1)}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row justify-between">
            {category && (
              <Text
                className="text-subtext"
                style={{ fontSize: rS(11), marginTop: 2 }}
                numberOfLines={1}
              >
                {category}
              </Text>
            )}
            {/* {reviews && (
              <Text
                className="text-subtext"
                style={{ fontSize: rS(11), marginTop: 2 }}
                numberOfLines={1}
              >
                {reviews}
              </Text>
            )} */}
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: rV(8),
              justifyContent: hasPrice ? "flex-start" : "flex-start",
            }}
          >
            {hasPrice && (
              <>
                {price && (
                  <Text
                    className="font-montserrat-extraBold text-subtext-200"
                    style={{ fontSize: rS(13), fontWeight: "700" }}
                  >
                    {formatCurrency(price)}
                  </Text>
                )}
                {oldPrice && (
                  <Text
                    className="text-red-500 font-montserrat-extraBold"
                    style={{
                      fontSize: rS(12),
                      marginLeft: rS(8),
                      textDecorationLine: "line-through",
                    }}
                  >
                    {formatCurrency(oldPrice)}
                  </Text>
                )}
              </>
            )}

            {/* {rating && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: hasPrice ? "auto" : 0,
                  marginTop: hasPrice ? 0 : rV(4),
                }}
              >
                <Ionicons name="star" size={rS(14)} color="#facc15" />
                <Text
                  className="ml-1 text-subtext-200 font-montserrat-extraBold"
                  style={{ fontSize: rS(12), marginLeft: rS(4) }}
                >
                  {rating.toFixed(1)}
                </Text>
              </View>
            )} */}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
