import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import RecommendationCard from "@/components/cards/RecommendationCard";
import { useWishlist } from "@/context/WishlistContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WishlistScreen = () => {
  const { wishlist } = useWishlist();

  const isWishlistEmpty = wishlist.length === 0;

  return (
    <View style={styles.container}>
      <ProfileHeader title="Wishlist" showBackButton={false} />

      <ScrollView contentContainerStyle={styles.content}>
        {isWishlistEmpty ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons
                name="heart-outline"
                size={32}
                color={AppColors.text}
              />
            </View>

            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>

            <Text style={styles.emptyDescription}>
              Browse products and tap the heart icon to save your favorites.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/")}
              activeOpacity={0.8}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Shop now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {wishlist.map((item) => (
              <RecommendationCard
                key={item.id}
                id={item.id}
                image={item.image}
                title={item.title}
                category={item.category}
                oldPrice={item.oldPrice}
                price={item.price}
                rating={item.rating}
                reviews={item.reviews}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default WishlistScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
    paddingBottom: rV(120),
  },
  listWrap: {
    gap: rV(12),
  },
  emptyState: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(24),
    paddingVertical: rV(34),
    alignItems: "center",
    marginTop: rV(36),
  },
  emptyIconWrap: {
    width: rMS(72),
    height: rMS(72),
    borderRadius: rMS(36),
    backgroundColor: "#EEF2F4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rV(16),
  },
  emptyTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
    color: AppColors.text,
    marginBottom: rV(8),
  },
  emptyDescription: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
    color: AppColors.subtext[100],
    textAlign: "center",
    marginBottom: rV(22),
  },
  emptyButton: {
    backgroundColor: AppColors.text,
    borderRadius: rMS(18),
    paddingHorizontal: rS(24),
    paddingVertical: rV(14),
  },
  emptyButtonText: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(14),
  },
});
