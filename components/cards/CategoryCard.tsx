import { AppColors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface CategoryCardProps {
  title: string;
  subtitle: string;
  image: any;
  subcategoryCount?: number;
  onPress?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  subtitle,
  image,
  subcategoryCount,
  onPress,
}) => {
  return (
    <View className="flex-row items-center justify-between bg-white rounded-3xl mb-4 px-5 py-5 shadow-sm border border-[#E7ECF2]">
      <View className="flex-1 pr-4">
        <Text
          className="text-xl font-montserrat-extraBold text-text mx-1"
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text
          className="text-sm text-subtext-200 font-montserrat-semiBold mx-1 mt-2 leading-6"
          numberOfLines={3}
        >
          {subtitle}
        </Text>

        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={{
            marginTop: 16,
            alignSelf: "flex-start",
            backgroundColor: AppColors.primary,
            borderColor: AppColors.primary,
            borderWidth: 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text className="text-white font-montserrat-semiBold text-sm text-center">
            {subcategoryCount ? `${subcategoryCount} Subcategories` : "Shop Now"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="w-[118px] h-[118px] rounded-[28px] overflow-hidden items-center justify-center bg-[#F4F7FB]">
        {image ? (
          <Image
            source={image}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-[#F4F7FB] px-3">
            <Ionicons name="image-outline" size={26} color="#94A3B8" />
            <Text className="text-subtext text-xs font-montserrat-semiBold mt-2 text-center">
              Image pending
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default CategoryCard;
