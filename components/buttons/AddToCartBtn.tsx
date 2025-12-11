import { useCart } from "@/context/CartContext";
import { rS } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface AddToCartBtnProps {
  item: {
    id: string;
    title: string;
    category?: string;
    price: number;
    image?: any;
  };
}

const AddToCart = ({ item }: AddToCartBtnProps) => {
  const { addToCart } = useCart();
  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: rS(10),
        borderRadius: rS(50),
      }}
    >
      <TouchableOpacity onPress={() => addToCart(item)}>
        <Ionicons name="add" size={rS(14)} color={"#000"} />
      </TouchableOpacity>
    </View>
  );
};

export default AddToCart;
