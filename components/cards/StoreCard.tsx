import { productCardGapX, productCardGapY, rS, rV } from "@/styles/responsive";
import { useCatalogCardTextStyles, useCommerceTheme } from "@/styles/themedCommerce";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface StoreCardProps {
  id: string;
  image: any;
  imageKey?: string;
  imageUrl?: string;
  imageBannerUrl?: string;
  title: string;
  category?: string;
  city?: string;
  rating?: number;
  reviews?: string;
  status?: string;
  /** Optional width override to match product cards */
  cardWidth?: number;
  /** Optional override for horizontal spacing (margin-right) */
  horizontalSpacing?: number;
}

const StoreCard: React.FC<StoreCardProps> = ({
  id,
  image,
  imageKey,
  imageUrl,
  imageBannerUrl,
  title,
  category,
  city,
  rating,
  reviews,
  status,
  cardWidth,
  horizontalSpacing,
}) => {
  const { cardShell, colors } = useCommerceTheme();
  const textStyles = useCatalogCardTextStyles();
  const width = cardWidth ?? rS(160);
  const imageHeight = rV(130);
  const spacingRight = horizontalSpacing ?? productCardGapX();
  const hasRating = typeof rating === "number" && Number.isFinite(rating);
  const isVerified = status === "active";
  const subtitle = category || city;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/(root)/screens/stores/[id]" as any,
          params: {
            id,
            image: imageUrl ?? undefined,
            imageKey,
            imageUrl,
            imageBanner: imageBannerUrl ?? undefined,
            title,
          },
        })
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
            <Image
              source={image}
              className="bg-tertiary"
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
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
              <Ionicons name="storefront-outline" size={rS(22)} color={colors.iconMuted} />
              <Text style={{ fontSize: rS(11), ...textStyles.placeholderLabel }}>
                Store image pending
              </Text>
            </View>
          )}
        </View>

        <View style={{ padding: rS(12) }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: rS(8),
            }}
          >
            <Text
              style={{ ...textStyles.title, fontSize: rS(13), flex: 1, textAlign: "left" }}
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
                  gap: rS(2),
                }}
              >
                <Ionicons name="star" size={rS(13)} color="#facc15" />
                <Text
                  style={{ ...textStyles.category, fontSize: rS(11), marginLeft: rS(2) }}
                >
                  {rating!.toFixed(1)}
                </Text>
              </View>
            ) : isVerified ? (
              <Ionicons name="checkmark-circle" size={rS(14)} color={colors.textMuted} />
            ) : null}
          </View>

          {subtitle || reviews ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: rV(3), gap: rS(4) }}>
              {subtitle ? (
                <Text
                  style={{ ...textStyles.category, fontSize: rS(11), flex: 1 }}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              ) : null}
              {reviews ? (
                <Text style={{ ...textStyles.category, fontSize: rS(10.5) }}>
                  {reviews}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StoreCard;
