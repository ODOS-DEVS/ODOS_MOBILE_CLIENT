import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface MarketCardProps {
  id: string;
  image: any;
  title: string;
  category?: string;
  rating?: number;
  reviews?: string;
}

const MarketCard: React.FC<MarketCardProps> = ({
  id,
  image,
  title,
  category,
}) => {
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/screens/[id]" as any,
          params: {
            image,
            title,
            category,
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
        </View>

        {/* ---------- TEXT SECTION ---------- */}
        <View className="p-3">
          <Text
            className="text-[13px] mb-2 font-montserrat-bold text-text text-left"
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
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MarketCard;
