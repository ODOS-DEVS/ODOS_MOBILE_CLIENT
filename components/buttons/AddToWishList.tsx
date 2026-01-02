import React from "react";
import { TouchableOpacity, ViewStyle, StyleProp } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useWishlist } from "@/context/WishlistContext";
import { rS } from "@/styles/responsive";

interface AddToWishListProps {
  product: {
    id: string;
    image: any;
    title: string;
    category?: string;
    price?: number;
    oldPrice?: number;
    rating?: number;
    reviews?: any;
  };

  size?: number;
  iconColor?: string;
  activeIconColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const AddToWishList: React.FC<AddToWishListProps> = ({
  product,
  size = 18,
  iconColor = "#444",
  activeIconColor = "red",
  containerStyle,
}) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const liked = wishlist.some((item) => item.id === product.id);

  const toggleWishlist = () => {
    if (liked) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleWishlist}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor: "#fff",
          padding: rS(10),
          borderRadius: rS(50),
          justifyContent: "center",
          alignItems: "center",
          elevation: 3,
        },
        containerStyle, 
      ]}
    >
      <FontAwesome
        name={liked ? "heart" : "heart-o"}
        size={size}
        color={liked ? activeIconColor : iconColor}
      />
    </TouchableOpacity>
  );
};

export default AddToWishList;
