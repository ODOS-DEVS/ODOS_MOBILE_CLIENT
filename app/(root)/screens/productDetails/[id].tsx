import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, View } from "react-native";

const BuyProductScreen = () => {
  const { price, image } = useLocalSearchParams();
  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full, h-[400px] bg-tertiary">
        <Image
          source={image as any}
          resizeMode="contain"
          className="w-full h-full rounded-xl"
        />
      </View>
      <View></View>
    </ScrollView>
  );
};

export default BuyProductScreen;
