import CartCard from "@/components/cards/CartCard";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const CartScreen = () => {
  return (
    <ScrollView>
      <View>
        <Text className="font-montserrat-extraBold text-xl pt-16 text-center">
          My Cart
        </Text>
      </View>

      <CartCard />
    </ScrollView>
  );
};

export default CartScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   text: {
//     fontSize: 24,
//     fontWeight: "bold",
//   },
// });
