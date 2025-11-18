import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface CategoryCardProps {
  title: string;
  subtitle: string;
  image: any;
  onPress?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  subtitle,
  image,
  onPress,
}) => {
  return (
    <View className="flex-row justify-between items-center bg-accent rounded-3xl mx-2 mb-4 px-5 py-8 shadow-sm">
    
      <View className="flex-1 pr-4">
        <Text className="text-xl font-montserrat-extraBold text-text mx-4">{title}</Text>
        <Text className="text-sm text-subtext-200 font-montserrat-semiBold mx-4 mt-1">{subtitle}</Text>

        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          className="mt-3 bg-secondary border border-secondary px-4 py-3 rounded-xl w-[110px] shadow-sm"
        >
          <Text className="text-white font-montserrat-semiBold text-sm text-center">
            Shop Now
          </Text>
        </TouchableOpacity>
      </View>

      <View className="w-[150px] h-[150px] rounded-full overflow-hidden items-center justify-center">
        <Image
          source={image}
          className="w-[150px] h-[150px]"
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

export default CategoryCard;
