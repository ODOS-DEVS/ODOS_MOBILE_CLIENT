import PrimaryButton from "@/components/buttons/PrimaryButton";
import CartItemCard from "@/components/cards/CartItemCard";
import { CartItem, useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MyCart = () => {
  const { cart, increaseQty, decreaseQty, removeItem } = useCart();

  const isEmpty = cart.length === 0;
  const subtotal = useMemo<number>(() => {
    return cart.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    );
  }, [cart]);

  const total = subtotal;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex-1 px-4 pt-8">
        {/* Header */}
        <View className="items-center pt-16 mb-6">
          <Text className="text-xl font-montserrat-extraBold">My Cart</Text>
        </View>

        {/* EMPTY CART STATE */}
        {isEmpty && (
          <View className="items-center justify-center mt-20">
            <Ionicons name="cart-outline" size={50} />

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

            {/* CART SUMMARY */}
            <View className="bg-white rounded-2xl p-4 mt-4 border border-gray-200">
              {/* PROMO CODE */}
              <View className="flex-row items-center mb-4">
                <View className="flex-1 bg-gray-100 rounded-xl px-4 py-3 mr-3">
                  <TextInput
                    placeholder="Enter Your Promo Code"
                    placeholderTextColor="#9CA3AF"
                    className="font-montserrat-medium text-gray-800"
                  />
                </View>

                <TouchableOpacity className="bg-gray-700 px-5 py-3 rounded-xl">
                  <Text className="text-white font-montserrat-bold">Add</Text>
                </TouchableOpacity>
              </View>

              {/* SUBTOTAL */}
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600 font-montserrat-extraBold pl-2">
                  Sub Total
                </Text>
                <Text className="font-montserrat-bold">
                  ${subtotal.toFixed(2)}
                </Text>
              </View>

              {/* SHIPPING */}
              <View className="flex-row justify-between mb-3 pl-2">
                <Text className="text-gray-600 font-montserrat-extraBold">
                  Shipping
                </Text>
                <Text className="text-green-600 font-montserrat-semibold">
                  FREE
                </Text>
              </View>

              {/* DIVIDER */}
              <View className="h-px bg-gray-200 my-3" />

              {/* TOTAL */}
              <View className="flex-row justify-between">
                <Text className="text-base font-montserrat-bold pl-2">
                  Total
                </Text>
                <Text className="text-base font-montserrat-bold">
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* CHECKOUT BUTTON */}
            <PrimaryButton title="Checkout" onPress={() => {}} />
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default MyCart;
