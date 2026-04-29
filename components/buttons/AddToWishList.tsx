import { useWishlist } from "@/context/WishlistContext";
import { rS } from "@/styles/responsive";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";

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

  const normalizedId = String(product.id);
  const liked = wishlist.some((item) => item.id === normalizedId);

  const toggleWishlist = async () => {
    if (liked) {
      await removeFromWishlist(normalizedId);
    } else {
      await addToWishlist({ ...product, id: normalizedId });
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleWishlist}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor: "#F1F3F5",
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
