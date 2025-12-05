import { rS } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, TouchableOpacity, View } from "react-native";

const AddToCart = () => {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: rS(10),
        borderRadius: rS(50),
      }}
    >
      <TouchableOpacity
        onPress={() => {
          Alert.alert("Product added to cart successfully");
        }}
      >
        <Ionicons name="add" size={rS(14)} color={"#000"} />
      </TouchableOpacity>
    </View>
  );
};

export default AddToCart;
