import { rS, rV } from "@/styles/responsive";
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
      <View
        style={{
          width: rS(180),
          borderRadius: rS(16),
          marginRight: rS(12),
          marginBottom: rV(16),
          marginTop: rV(4),
        }}
      >
        <View
          style={{
            position: "relative",
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
            className="bg-tertiary"
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>

        <View style={{ padding: rS(12) }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: rS(8),
            }}
          >
            <Text
              className="font-montserrat-bold text-text text-left"
              style={{ fontSize: rS(13), flex: 1 }}
              numberOfLines={1}
            >
              {title}
            </Text>

            {rating && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Ionicons name="star" size={rS(14)} color="#facc15" />
                <Text
                  className="text-subtext-200 font-montserrat-extraBold"
                  style={{ fontSize: rS(11), marginLeft: rS(4) }}
                >
                  {rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: "column", gap: 4, marginTop: rV(3), }}>
            {category && (
              <Text
                className="text-subtext"
                style={{ fontSize: rS(11) }}
                numberOfLines={1}
              >
                {category}
              </Text>
            )}
            {/* {rating && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={rS(14)} color="#facc15" />
                <Text
                  className="text-subtext-200 font-montserrat-extraBold"
                  style={{ fontSize: rS(11), marginLeft: rS(4) }}
                >
                  {rating.toFixed(1)}
                </Text>
              </View>
            )} */}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StoreCard;
