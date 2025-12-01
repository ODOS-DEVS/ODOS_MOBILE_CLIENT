import React from "react";
import { TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useWishlist } from "@/context/WishlistContext";

interface AddToWishListProps {
  product: {
    id: string;
    image: any;
    title: string;
    category?: string;
    price?: number;
    oldPrice?: number;
    rating?: number;
    reviews?: number;
  };
  size?: number;
}

const AddToWishList: React.FC<AddToWishListProps> = ({
  product,
  size = 18,
}) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // check if already added
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
        padding: 8,
        borderRadius: 50,
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
