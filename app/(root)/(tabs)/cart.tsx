import React from "react";
import {
  FlatList,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  View,
} from "react-native";
import CartItemCard from "@/components/cards/CartItemCard";
import { useCart } from "@/context/CartContext";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const MyCart = () => {
  const { cart, increaseQty, decreaseQty, removeItem } = useCart();

  const isEmpty = cart.length === 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="items-center pt-16 mb-6">
          <Text className="text-xl font-montserrat-extraBold">My Cart</Text>
        </View>

        {/* EMPTY CART STATE */}
        {isEmpty && (
          <View className="items-center justify-center mt-20">
           <Ionicons name="cart-outline" size={50}/>

            <Text className="text-lg font-montserrat-bold text-gray-700 mb-2">
              Your Cart is Empty
            </Text>

            <Text className="text-gray-500 mb-6 text-center w-3/4">
              Explore our latest collections and find something you love.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/")}
              className="bg-black px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-montserrat-bold">Shop Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CART ITEMS */}
        {!isEmpty && (
          <>
            <FlatList
              data={cart}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <CartItemCard
                  {...item}
                  onIncrease={() => increaseQty(item.id)}
                  onDecrease={() => decreaseQty(item.id)}
                  onRemove={() => removeItem(item.id)}
                />
              )}
              contentContainerStyle={{ paddingBottom: 10 }}
            />

            <PrimaryButton title="Checkout" onPress={() => {}} />
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default MyCart;
