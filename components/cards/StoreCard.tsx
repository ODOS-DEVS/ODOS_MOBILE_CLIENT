import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface StoreCardProps {
  id: string;
  image: any;
  title: string;
  category?: string;
  rating?: number;
  reviews?: string;
}

const StoreCard: React.FC<StoreCardProps> = ({
  id,
  image,
  title,
  category,
  rating,
  reviews,
}) => {
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/screens/stores/[id]" as any,
          params: {
            id,
            image,
            title,
          },
        })
      }
    >
      <View className="w-[180px] rounded-2xl mr-3 mb-4 mt-4">
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

          <View className="flex justify-start gap-1">
            {category && (
              <Text className="text-xs text-subtext" numberOfLines={1}>
                {category}
              </Text>
            )}
            {rating && (
              <View className={"flex-row items-center"}>
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

export default StoreCard;
