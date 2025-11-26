import { AppColors } from "@/constants/Colors";
import { rS, rV } from "@/styles/responsive";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const AddToCartBtn = () => {
  return (
    <View>
      <TouchableOpacity
        style={{
          marginTop: rV(2),
          backgroundColor: AppColors.secondary,
          paddingVertical: rV(12),
          borderRadius: rS(12),
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => {}}
      >
        <Text
          style={{
            color: AppColors.white,
            fontSize: rS(12),
            fontWeight: "700",
          }}
        >
          Add to Cart
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddToCartBtn;
