import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface FlashSalesCardProps {
  id: string;
  image: any;
  title: string;
  category?: string;
  price?: number;
  oldPrice?: number;
  discount?: string;
  rating?: number;
  reviews?: string;
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
}) => {
  const [liked, setLiked] = useState(false);

  // 💡 Check if price section exists
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
            price,
            oldPrice,
            discount,
            rating,
            reviews,
          },
        })
      }
    >
      <View className="w-[183px] rounded-2xl mr-3 mb-4 mt-4">
        {/* ---------- IMAGE SECTION ---------- */}
        <View className="relative h-[250px] bg-gray-100 rounded-t-2xl rounded-b-2xl overflow-hidden ">
          <Image
            source={image}
            className="w-full h-full bg-tertiary"
            resizeMode="cover"
          />

          {/* Discount badge */}
          {discount && (
            <View className="absolute top-2 left-2 bg-gray-800 px-2 py-1 rounded-md">
              <Text className="text-white text-[10px] font-semibold">
                {discount}
              </Text>
            </View>
          )}

          {/* Like (Heart) Button */}
          <TouchableOpacity
            onPress={() => setLiked(!liked)}
            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-sm"
          >
            <FontAwesome
              name={liked ? "heart" : "heart-o"}
              size={14}
              color={liked ? "red" : "#444"}
            />
          </TouchableOpacity>
        </View>

        {/* ---------- TEXT SECTION ---------- */}
        <View className="p-3">
          <Text
            className="text-[13px] font-montserrat-bold text-text"
            numberOfLines={1}
          >
            {title}
          </Text>

          <View className="flex-row justify-between">
            {category && (
              <Text className="text-xs text-subtext mt-0.5" numberOfLines={1}>
                {category}
              </Text>
            )}
            {reviews && (
              <Text className="text-xs text-subtext mt-0.5" numberOfLines={1}>
                {reviews}
              </Text>
            )}
          </View>

          {/* ---------- PRICE & RATING SECTION ---------- */}
          <View
            className={`flex-row items-center mt-2 ${
              hasPrice ? "" : "justify-start"
            }`}
          >
            {/* ✅ PRICE & OLD PRICE (Only if available) */}
            {hasPrice && (
              <>
                {price && (
                  <Text className="text-[13px] font-bold text-subtext-200 font-montserrat-extraBold">
                    ${price}
                  </Text>
                )}
                {oldPrice && (
                  <Text className="text-[12px] text-red-500 line-through ml-2 font-montserrat-extraBold">
                    ${oldPrice}
                  </Text>
                )}
              </>
            )}

            {/* ✅ RATING: Moves based on price existence */}
            {rating && (
              <View
                className={`flex-row items-center ${
                  hasPrice ? "ml-auto" : "mt-1"
                }`}
              >
                <Ionicons name="star" size={14} color="#facc15" />
                <Text className="ml-1 text-xs text-subtext-200 font-montserrat-extraBold">
                  {rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FlashSalesCard;
