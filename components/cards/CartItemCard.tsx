import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface CartItemProps {
  id: string;
  title: string;
  category?: string;
  price: number;
  image?: any; // <-- make optional so it matches your product types
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

const CartItemCard = ({
  id,
  image,
  title,
  category,
  price,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) => {
  return (
    <View className="flex-row items-center rounded-2xl  mb-2 pt-6 ">
      {/* Product Image */}
      <Image
        source={image}
        className="w-[90px] h-[90px] rounded-xl mr-4 bg-tertiary"
        resizeMode="cover"
      />

      {/* Content */}
      <View className="flex-1 ">
        <Text className="text-lg font-montserrat-bold">{title}</Text>
        <Text className="text-gray-500 font-montserrat-regular">
          {category}
        </Text>

        <Text className="mt-1 text-lg font-montserrat-bold">${price}</Text>
      </View>

      {/* Quantity Controls */}
      <View className="">
        <View className="flex items-end mb-4">
          <TouchableOpacity onPress={onRemove} className="mr-4">
            <Ionicons name="trash" size={18} color="#ff4d6d" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-lg">
          <TouchableOpacity
            onPress={onDecrease}
            className="bg-gray-200 px-4 py-2 rounded-lg"
          >
            <Text className="text-lg font-montserrat-bold">-</Text>
          </TouchableOpacity>

          <Text className="mx-3 text-lg font-montserrat-semiBold">
            {quantity.toString().padStart(2, "0")}
          </Text>

          <TouchableOpacity
            onPress={onIncrease}
            className="bg-gray-200 px-4 py-2 rounded-lg"
          >
            <Text className="text-lg font-montserrat-bold">+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CartItemCard;
