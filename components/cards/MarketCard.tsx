import { rS, rV } from "@/styles/responsive";
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
      <View
        style={{
          width: rS(150),
          borderRadius: rS(16),
          marginRight: rS(12),
          marginBottom: rV(16),
          marginTop: rV(4),
        }}
      >
        <View
          style={{
            height: rV(160),
            backgroundColor: "#f3f4f6",
            borderTopLeftRadius: rS(16),
            borderTopRightRadius: rS(16),
            borderBottomLeftRadius: rS(16),
            borderBottomRightRadius: rS(16),
            overflow: "hidden",
          }}
        >
          <Image
            source={image}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>

        <View style={{ padding: rS(12) }}>
          <Text
            className="font-montserrat-bold text-text text-left"
            style={{ fontSize: rS(13), marginBottom: rV(8) }}
            numberOfLines={1}
          >
            {title}
          </Text>

          <View className="flex-row justify-between">
            {category && (
              <Text
                className="text-subtext"
                style={{ fontSize: rS(11), marginTop: 2 }}
                numberOfLines={1}
              >
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
