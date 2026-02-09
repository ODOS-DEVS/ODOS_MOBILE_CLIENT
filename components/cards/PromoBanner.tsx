import { useResponsive, rS, rV } from "@/styles/responsive";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const PromoBanner = () => {
  const { horizontalPadding } = useResponsive();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#D9D9D9",
        borderRadius: rS(14),
        marginHorizontal: horizontalPadding,
        marginTop: rV(8),
        paddingHorizontal: rS(12),
        paddingVertical: rV(10),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View style={{ flex: 1, paddingRight: rS(12) }}>
        <Text
          className="font-montserrat-extraBold text-subtext-200 leading-tight"
          style={{ fontSize: rS(22), marginLeft: rS(16) }}
        >
          Knock{"\n"}out Deals
        </Text>

        <Text
          className="font-montserrat text-amber-600"
          style={{
            fontSize: rS(13),
            marginTop: rV(8),
            marginLeft: rS(16),
            fontWeight: "500",
          }}
        >
          Extra 20% Off
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            marginTop: rV(16),
            backgroundColor: "#1f2937",
            paddingHorizontal: rS(24),
            paddingVertical: rV(12),
            marginLeft: rS(12),
            borderRadius: rS(12),
            alignSelf: "flex-start",
          }}
        >
          <Text
            className="text-white font-montserrat-extraBold"
            style={{ fontSize: rS(13) }}
          >
            Shop Now
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          width: rS(130),
          height: rV(170),
          borderRadius: rS(65),
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Image
          source={require("@/assets/images/promo.png")}
          style={{ width: rS(160), height: rV(190) }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default PromoBanner;
