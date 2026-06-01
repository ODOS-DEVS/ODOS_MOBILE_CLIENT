import { rS, rV } from "@/styles/responsive";
import { useCatalogCardTextStyles, useCommerceTheme } from "@/styles/themedCommerce";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface StoreCardProps {
  id: string;
  image: any;
  imageKey?: string;
  imageUrl?: string;
  title: string;
  category?: string;
  rating?: number;
  reviews?: string;
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
  title,
  category,
  rating,
  reviews,
  cardWidth,
  horizontalSpacing,
}) => {
  const { cardShell, colors } = useCommerceTheme();
  const textStyles = useCatalogCardTextStyles();
  const width = cardWidth ?? rS(160);
  const imageHeight = rV(130);
  const spacingRight = horizontalSpacing ?? rS(12);
  const hasRating = typeof rating === "number" && Number.isFinite(rating);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(root)/screens/stores/[id]" as any,
          params: {
            id,
            image: imageUrl ?? undefined,
            imageKey,
            imageUrl,
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
          marginBottom: rV(16),
          marginTop: rV(4),
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
                }}
              >
                <Ionicons name="star" size={rS(14)} color="#facc15" />
                <Text
                  className="text-subtext-200 font-montserrat-extraBold"
                  style={{ fontSize: rS(11), marginLeft: rS(4) }}
                >
                  {rating!.toFixed(1)}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={{ flexDirection: "column", gap: 4, marginTop: rV(3), }}>
            {category && (
              <Text
                style={{ ...textStyles.category, fontSize: rS(11) }}
                numberOfLines={1}
              >
                {category}
              </Text>
            )}
            {/* {rating && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={rS(14)} color="#facc15" />
                <Text
                  className="text-subtext-200 font-montserrat-extraBold"
                  style={{ fontSize: rS(11), marginLeft: rS(4) }}
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

export default StoreCard;
