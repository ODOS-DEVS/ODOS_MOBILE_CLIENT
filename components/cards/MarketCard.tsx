import { rS, rV } from "@/styles/responsive";
import { useCatalogCardTextStyles, useCommerceTheme } from "@/styles/themedCommerce";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface MarketCardProps {
  id: string;
  image: any;
  title: string;
  slug?: string;
  category?: string;
  rating?: number;
  reviews?: string;
  /** Optional width override to match product cards */
  cardWidth?: number;
  /** Optional override for horizontal spacing (margin-right) */
  horizontalSpacing?: number;
}

const MarketCard: React.FC<MarketCardProps> = ({
  id,
  image,
  title,
  slug,
  category,
  cardWidth,
  horizontalSpacing,
}) => {
  const { cardShell, colors } = useCommerceTheme();
  const textStyles = useCatalogCardTextStyles();
  const width = cardWidth ?? rS(160);
  const imageHeight = rV(130);
  const spacingRight = horizontalSpacing ?? rS(12);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/screens/market" as any,
          params: {
            activeMarket: title,
            activeMarketSlug: slug,
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
              <Ionicons name="image-outline" size={rS(22)} color={colors.iconMuted} />
              <Text style={{ fontSize: rS(11), ...textStyles.placeholderLabel }}>
                Market image pending
              </Text>
            </View>
          )}
        </View>

        <View style={{ padding: rS(12) }}>
          <Text
            style={{ ...textStyles.title, fontSize: rS(13), marginBottom: rV(8), textAlign: "left" }}
            numberOfLines={1}
          >
            {title}
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {category && (
              <Text
                style={{ ...textStyles.category, fontSize: rS(11), marginTop: 2 }}
                numberOfLines={1}
              >
                {category}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MarketCard;
