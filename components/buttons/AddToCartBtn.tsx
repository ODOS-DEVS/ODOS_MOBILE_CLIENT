import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { rS } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";

interface AddToCartBtnProps {
  item: {
    id: string;
    title: string;
    category?: string;
    price: number;
    image?: any;
    imageKey?: string;
  };

  containerStyle?: StyleProp<ViewStyle>;
  iconSize?: number;
  iconColor?: string;
}

const AddToCartBtn = ({
  item,
  containerStyle,
  iconSize = rS(14),
  iconColor = "#000",
}: AddToCartBtnProps) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  return (
    <View
      style={[
        {
          backgroundColor: "#F1F3F5",
          padding: rS(10),
          borderRadius: rS(50),
        },
        containerStyle, 
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          addToCart(item);
          showToast("Added to cart successfully");
        }}
      >
        <Ionicons name="add" size={iconSize} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

export default AddToCartBtn;
