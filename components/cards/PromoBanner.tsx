import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const PromoBanner = () => {
  return (
    <View className="flex-row justify-between items-center bg-tertiary rounded-3xl mx-5 mt-2 px-8 py-4 shadow-sm">
      <View className="flex-1 pr-3">
        <Text className="text-2xl font-montserrat-extraBold ml-4 text-subtext-200 leading-tight">
          Knock{"\n"}out Deals
        </Text>

        <Text className="text-sm font-montserrat text-amber-600 font-medium mt-2 ml-4">
          Extra 20% Off
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          className="mt-4 bg-gray-800 px-6 py-3 ml-3 rounded-xl self-start"
        >
          <Text className="text-white font-montserrat-extraBold text-sm">Shop Now</Text>
        </TouchableOpacity>
      </View>

      <View className="w-[130px] h-[170px] rounded-full justify-center items-center overflow-hidden">
        <Image
          source={require("@/assets/images/promo.png")}
          className="w-[160px] h-[190px] object-contain"
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default PromoBanner;
