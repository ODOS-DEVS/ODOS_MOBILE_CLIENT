import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface RecommendationCardProps {
  image: any;
  title: string;
  category?: string;
  price: number;
  rating?: number;
  reviews?: number;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  image,
  title,
  category,
  price,
  rating,
  reviews,
}) => {
  const [liked, setLiked] = useState(false);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/screens/[id]" as any,
          params: {
            image,
            title,
            category,
            price,
            rating,
            reviews,
          },
        })
      }
    >
      <View className="flex-row items-center rounded-2xl  mb-4 pt-8 ">
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
            <Text className="text-[13px] text-gray-900 mr-3 font-montserrat-extraBold">
              ${price}
            </Text>

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

        <TouchableOpacity
          onPress={() => setLiked(!liked)}
          className="ml-3 pr-4"
          activeOpacity={0.8}
        >
          <FontAwesome
            name={liked ? "heart" : "heart-o"}
            size={22}
            color={liked ? "red" : "#696969"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default RecommendationCard;
