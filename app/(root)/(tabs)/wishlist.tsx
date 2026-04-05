import RecommendationCard from "@/components/cards/RecommendationCard";
import { useWishlist } from "@/context/WishlistContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WishlistScreen = () => {
  const { wishlist } = useWishlist();

  const isWishlistEmpty = wishlist.length === 0;

  return (
    <ScrollView>
      <View className="flex-1 px-4 pt-8">
        {/* Title */}
        <View className="items-center pt-16 mb-6">
          <Text className="text-xl font-montserrat-extraBold text-black text-center">
            Wishlist
          </Text>
        </View>

        {/* Empty State */}
        {isWishlistEmpty ? (
          <View className="flex-1 items-center mt-20">
            <Ionicons name="heart-outline" size={50} color="#000" />

            <Text className="text-lg font-montserrat-bold text-gray-700 mt-4 mb-2">
              Your Wishlist is Empty
            </Text>

            <Text className="text-gray-500 mb-6 text-center w-3/4">
              Browse products and tap the heart icon to save your favorites.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/")}
              className="bg-black px-6 py-3 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-white font-montserrat-bold">Shop now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Wishlist Items */
          <FlatList
            data={wishlist}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120, gap: 12 }}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <RecommendationCard
                id={item.id}
                image={item.image}
                title={item.title}
                category={item.category}
                oldPrice={item.oldPrice}
                price={item.price}
                rating={item.rating}
                reviews={item.reviews}
              />
            )}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default WishlistScreen;
