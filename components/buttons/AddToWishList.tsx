import { rS } from "@/styles/responsive";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";

const AddToWishList = () => {
  const [liked, setLiked] = useState(false);
  return (
    <View>
      <TouchableOpacity
        onPress={() => setLiked(!liked)}
         style={{
           backgroundColor: "#fff",
           padding: rS(10),
           borderRadius: rS(50),
           elevation: 2,
         }}
      >
        <FontAwesome
          name={liked ? "heart" : "heart-o"}
          size={rS(14)}
          color={liked ? "red" : "#444"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default AddToWishList;
