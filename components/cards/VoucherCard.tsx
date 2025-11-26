import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface VoucherCardProps {
  id: string;
  image: any;
  amount: number;
}

const VoucherCard: React.FC<VoucherCardProps> = ({ id, image, amount }) => {
  const [liked, setLiked] = useState(false);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/screens/[id]" as any,
          params: {
            image,
            amount,
          },
        })
      }
    >
      <View className="w-[150px] rounded-2xl mr-3 mb-4 mt-4">
        {/* ---------- IMAGE SECTION ---------- */}
        <View className="relative h-[160px] bg-gray-100 rounded-t-2xl rounded-b-2xl overflow-hidden ">
          <Image
            source={image}
            className="w-full h-full bg-tertiary"
            resizeMode="cover"
          />

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
            className="text-[13px] mb-2 font-montserrat-bold text-text text-center"
            numberOfLines={1}
          >
           GHS {amount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default VoucherCard;
