import RecommendationCard from "@/components/cards/RecommendationCard";
import { useWishlist } from "@/context/WishlistContext";
import React from "react";
import { ScrollView, Text } from "react-native";

const WishlistScreen = () => {
  const { wishlist } = useWishlist();

  return (
    <ScrollView className="p-4 mt-16">
      <Text className="text-lg font-montserrat-extraBold text-center">
        Wishlist
      </Text>
      {wishlist.length === 0 ? (
        <Text className="text-center mt-10 text-gray-500">
          No items in wishlist yet...
        </Text>
      ) : (
        wishlist.map((item) => (
          <RecommendationCard
            key={item.id}
            id={item.id}
            image={item.image}
            title={item.title}
            category={item.category}
            price={item.price}
            rating={item.rating}
            reviews={item.reviews}
          />
        ))
      )}
    </ScrollView>
  );
};

export default WishlistScreen;
