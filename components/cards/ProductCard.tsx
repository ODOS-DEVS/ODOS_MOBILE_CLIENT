import CommerceImage from "@/components/media/CommerceImage";
import { productCardGapX, productCardGapY, rS, rV } from "@/styles/responsive";
import { useCatalogCardTextStyles, useCommerceTheme } from "@/styles/themedCommerce";
import { openProductDetail } from "@/utils/productNavigation";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
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
  sourceScreen?: string;
  storeId?: string;
  searchQuery?: string;
  trackingEvent?: "product_click" | "search_result_click";
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
  sourceScreen,
  storeId,
  searchQuery,
  trackingEvent,
}) => {
  const { cardShell, imageArea, colors } = useCommerceTheme();
  const textStyles = useCatalogCardTextStyles();
  const hasPrice = !!price || !!oldPrice;
  const hasRating = typeof rating === "number" && Number.isFinite(rating);
  const width = cardWidth ?? rS(160);
  const imageHeight = rV(130);
  const spacingRight = horizontalSpacing ?? productCardGapX();

  return (
    <TouchableOpacity
      onPress={() =>
        openProductDetail(
          {
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
          },
          sourceScreen
            ? {
                sourceScreen,
                storeId,
                searchQuery,
                eventType: trackingEvent,
              }
            : undefined,
        )
      }
    >
      <View
        style={{
          width,
          borderRadius: rS(16),
          marginRight: spacingRight,
          marginBottom: productCardGapY(),
          marginTop: rV(2),
          ...cardShell,
        }}
      >
        {/* ---------- IMAGE SECTION ---------- */}
        <View
          style={{
            position: "relative",
            height: imageHeight,
            backgroundColor: colors.imagePlaceholder,
            borderTopLeftRadius: rS(16),
            borderTopRightRadius: rS(16),
            borderBottomLeftRadius: rS(16),
            borderBottomRightRadius: rS(16),
            overflow: "hidden",
          }}
        >
          {image ? (
            <CommerceImage
              source={image}
              trackingId={`product-${id}`}
              recyclingKey={imageKey || imageUrl || id}
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
              <Text
                style={{
                  ...textStyles.placeholderLabel,
                  fontSize: rS(11),
                }}
              >
                Product image pending
              </Text>
            </View>
          )}

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
                imageKey,
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
              style={{ ...textStyles.title, fontSize: rS(13), flex: 1 }}
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
                  style={{
                    ...textStyles.rating,
                    fontSize: rS(12),
                    marginLeft: rS(4),
                    fontFamily: "Montserrat-ExtraBold",
                  }}
                >
                  {rating!.toFixed(1)}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {category && (
              <Text
                style={{ ...textStyles.category, fontSize: rS(11), marginTop: 2 }}
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
                    style={{
                      ...textStyles.price,
                      fontSize: rS(13),
                      fontWeight: "700",
                    }}
                  >
                    {formatCurrency(price)}
                  </Text>
                )}
                {oldPrice && (
                  <Text
                    style={{
                      ...textStyles.oldPrice,
                      fontSize: rS(12),
                      marginLeft: rS(8),
                      textDecorationLine: "line-through",
                      fontFamily: "Montserrat-ExtraBold",
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
