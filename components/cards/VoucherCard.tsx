import AddToCartBtn from "@/components/buttons/AddToCartBtn";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface VoucherCardProps {
  id: string;
  image: any;
  amount: number;
  title?: string;
  code?: string;
  expiresAt?: string;
}

const VoucherCard: React.FC<VoucherCardProps> = ({
  id,
  image,
  amount,
  title,
  code,
  expiresAt,
}) => {
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/screens/[id]" as any,
          params: {
            image,
            amount,
            title: title ?? "Voucher",
            price: amount,
            category: "Voucher",
            isVoucher: "true",
          },
        })
      }
    >
      <View className="w-[250px] rounded-2xl mr-3 mb-4 mt-4 bg-white shadow-sm">
        {/* ---------- IMAGE SECTION ---------- */}
        <View className="relative h-[160px] bg-gray-100 rounded-t-2xl rounded-b-2xl overflow-hidden ">
          <Image
            source={image}
            className="w-full h-full bg-tertiary"
            resizeMode="cover"
          />

          <AddToCartBtn
            item={{
              id,
              title: title ?? "Voucher",
              price: amount,
              category: "Voucher",
              image,
            }}
            containerStyle={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "#fff",
              padding: 13,
            }}
            iconColor="#000"
            iconSize={15}
          />

          {/* <TouchableOpacity
            activeOpacity={0.8}
            className="absolute bottom-2 right-2 bg-black/40 rounded-full p-2"
          >
            <FontAwesome name="share-alt" size={14} color="#fff" />
          </TouchableOpacity> */}
        </View>

        {/* ---------- TEXT SECTION ---------- */}
        <View className="p-3">
          <View className="flex-row gap-20">
            <Text
              className="text-[13px] mb-2 font-montserrat-bold text-text text-left"
              numberOfLines={2}
            >
              {title ?? "Voucher"} 
            </Text>

            <Text className="text-[13px] mb-2 font-montserrat-bold text-text text-left">
              GHC {amount}
            </Text>
          </View>

          <View className="flex-row items-center gap-2 mb-1">
            <FontAwesome name="calendar-o" size={13} color="#9ca3af" />
            <Text
              className="text-[11px] text-subtext"
              numberOfLines={1}
              style={{ color: "#9ca3af" }}
            >
              {expiresAt ?? "Until 31 Dec, 2025"}
            </Text>
          </View>

          <Text className="text-[12px] font-montserrat-bold mt-4">
            Voucher code
          </Text>
          <Text
            className="text-[12px] font-montserrat text-text"
            style={{ letterSpacing: 0.4 }}
            numberOfLines={1}
          >
            {code ?? "VxasDuA01"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default VoucherCard;
