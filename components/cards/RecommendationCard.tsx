import { rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import AddToCartBtn from "../buttons/AddToCartBtn";
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
            id,
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: rS(16),
          paddingTop: rV(16),
        }}
      >
        <Image
          source={image}
          style={{
            width: rS(90),
            height: rS(80),
            borderRadius: rS(12),
            marginRight: rS(10),
            backgroundColor: "#E5E7EB",
          }}
          resizeMode="contain"
        />

        <View style={{ flex: 1 }}>
          <Text
            className="font-montserrat-semiBold text-subtext-200"
            style={{ fontSize: rS(12) }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {category && (
            <Text
              className="text-subtext-200"
              style={{ fontSize: rS(8), marginTop: 2 }}
              numberOfLines={1}
            >
              {category}
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: rV(6),
            }}
          >
            {hasPrice && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {price && (
                  <Text
                    style={{
                      fontSize: rS(12),
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
                      fontSize: rS(12),
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
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: rS(10),
                }}
              >
                <Ionicons name="star" size={rS(14)} color="#facc15" />
                <Text
                  className="font-montserrat-extraBold text-subtext-200"
                  style={{ fontSize: rS(11), marginLeft: rS(4) }}
                >
                  {rating.toFixed(1)}
                </Text>
                {/* {reviews && (
                  <Text
                    className="text-subtext-200"
                    style={{ fontSize: rS(11), marginLeft: rS(4) }}
                  >
                    ({reviews} Review{reviews > 1 ? "s" : ""})
                  </Text>
                )} */}
              </View>
            )}
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: rS(8),
            marginBottom: rS(20),
            marginRight: rS(-4),
          }}
        >
          <AddToCartBtn
            item={{
              id,
              title,
              category,
              price: price ?? 0,
              image,
            }}
          />
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
