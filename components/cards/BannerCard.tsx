import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface BannerCardProps {
  title: string; // The banner title (e.g., "Stores")
  image: any; // The image (require or { uri })
  backgroundColor?: string; // Optional card background color
  onPress?: () => void; // Optional onPress handler
}

const BannerCard: React.FC<BannerCardProps> = ({
  title,
  image,
  backgroundColor = "#E5E0E9",
  onPress,
}) => {
  return (
    <View className="w-full rounded-3xl mb-5 shadow-sm">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="relative w-full rounded-3xl overflow-hidden"
      >
        {/* Card Background */}
        <View
          className="w-full h-[180px] rounded-3xl justify-center px-6"
          style={{ backgroundColor }}
        >
          <Text className="text-3xl font-montserrat-extraBold text-primary drop-shadow-lg">
            {title}
          </Text>
        </View>

        {/* Image stacked (absolute positioned) */}
        <Image
          source={image}
          resizeMode="cover"
          className="absolute right-0 bottom-0 w-[250px] h-[190px]"
        />
      </TouchableOpacity>
    </View>
  );
};

export default BannerCard;
