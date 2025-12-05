import React from "react";
import { TouchableOpacity } from "react-native";
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
}

const AddToWishList: React.FC<AddToWishListProps> = ({
  product,
  size = 18,
}) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const liked = wishlist.some((item) => item.id === product.id);

  const toggleWishlist = () => {
    if (liked) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  return (
    <TouchableOpacity
      onPress={toggleWishlist}
      style={{
        backgroundColor: "#fff",
        width: rS(34),
        height: rS(34),
        borderRadius: rS(17),
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
      }}
    >
      <FontAwesome
        name={liked ? "heart" : "heart-o"}
        size={size}
        color={liked ? "red" : "#444"}
      />
    </TouchableOpacity>
  );
};

export default AddToWishList;
