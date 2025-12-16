import { rS } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import AddToCart from "../buttons/AddToCart";
import AddToWishList from "../buttons/AddToWishList";

interface RecommendationCardProps {
  id: any;
  image: any;
  title: string;
  category?: string;
  oldPrice?: number;
  price?: number;
  rating?: number;
  reviews?: number;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  id,
  image,
  title,
  category,
  oldPrice,
  price,
  rating,
  reviews,
}) => {
  const hasPrice = !!price || !!oldPrice;

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/screens/[id]" as any,
          params: {
            image,
            title,
            category,
            oldPrice,
            price,
            rating,
            reviews,
          },
        })
      }
    >
      <View className="flex-row items-center rounded-2xl pt-4 ">
        <Image
          source={image}
          className="w-[90px] h-[90px] rounded-xl mr-4 bg-tertiary"
          resizeMode="contain"
        />

        <View className="flex-1">
          <Text
            className="text-[14px] font-montserrat-semiBold text-subtext-200"
            numberOfLines={1}
          >
            {title}
          </Text>
          {category && (
            <Text className="text-xs text-subtext-200 mt-0.5" numberOfLines={1}>
              {category}
            </Text>
          )}

          <View className="flex-row items-center mt-1.5">
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
                    ${price}
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
                    ${oldPrice}
                  </Text>
                )}
              </View>
            )}

            {rating && (
              <View className="flex-row items-center ml-4">
                <Ionicons name="star" color="#facc15" />
                <Text className="ml-1 text-xs font-montserrat-extraBold text-subtext-200">
                  {rating.toFixed(1)}
                </Text>
                {reviews && (
                  <Text className="text-xs text-subtext-200 ml-1">
                    ({reviews} Review{reviews > 1 ? "s" : ""})
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-3 ml-4 mr-2">
          <AddToCart />
          <AddToWishList
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
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RecommendationCard;
