import CommerceImage from "@/components/media/CommerceImage";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface BannerCardProps {
  title: string; // The banner title (e.g., "Stores")
  image: any; // The image (require or { uri })
  backgroundColor?: string; // Optional card background color
  onPress?: () => void; // Optional onPress handler
}

const BannerCard: React.FC<BannerCardProps> = ({
  title,
  image,
  backgroundColor,
  onPress,
}) => {
  const { colors } = useTheme();
  const cardBackgroundColor = backgroundColor ?? colors.surfaceMuted;

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
          style={{ backgroundColor: cardBackgroundColor }}
        >
          <Text className="text-3xl font-montserrat-extraBold text-primary drop-shadow-lg">
            {title}
          </Text>
        </View>

        {/* Image stacked (absolute positioned) */}
        <CommerceImage
          source={image}
          contentFit="cover"
          style={{ position: "absolute", right: 0, bottom: 0, width: 250, height: 190 }}
          recyclingKey={title}
        />
      </TouchableOpacity>
    </View>
  );
};

export default BannerCard;
