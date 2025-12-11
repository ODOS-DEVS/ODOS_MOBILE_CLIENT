import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import CartItemCard from "@/components/cards/CartItemCard";
import { useCart } from "@/context/CartContext";

const MyCart = () => {
  const { cart, increaseQty, decreaseQty, removeItem } = useCart();

  return (
    <View className="flex-1 bg-[#f2f2f2] px-4 pt-12">
      {/* Header */}
      <View className="items-center mb-6">
        <Text className="text-lg font-montserrat-extraBold">My Cart</Text>
      </View>

      {/* Cart List */}
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartItemCard
            {...item}
            onIncrease={() => increaseQty(item.id)}
            onDecrease={() => decreaseQty(item.id)}
            onRemove={() => removeItem(item.id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Checkout Button */}
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <TouchableOpacity className="bg-gray-700 rounded-xl py-4">
          <Text className="text-center text-white font-montserrat-bold text-lg">
            Checkout Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MyCart;
