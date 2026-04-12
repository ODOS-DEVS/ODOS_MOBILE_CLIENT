import RecommendationCard from "@/components/cards/RecommendationCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { SearchBar } from "@/components/SearchBar";
import { AppColors } from "@/constants/Colors";
import { PopularProducts } from "@/constants/Data";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import React, { useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";

export default function PopularProductsScreen() {
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(PopularProducts);

  const displayed = useMemo(
    () => (isSearching ? searchResults : PopularProducts),
    [isSearching, searchResults],
  );

  return (
    <View style={styles.container}>
      <ProfileHeader title="Popular Products" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: sectionSpacing,
          paddingTop: rV(8),
        }}
      >
        <SearchBar
          data={PopularProducts}
          onStartSearch={() => setIsSearching(true)}
          onResults={(results) => {
            setIsSearching(true);
            setSearchResults(results);
          }}
          placeholder="Search popular products, categories, reviews..."
          containerStyle={{ marginTop: rV(12) }}
        />

        <View style={{ marginTop: sectionSpacing }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All popular products</Text>
          </View>

          {displayed.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                Adjust filters or clear search to see more items.
              </Text>
            </View>
          ) : (
            <FlatList
              data={displayed}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: rV(10) }} />}
              renderItem={({ item }) => (
                <RecommendationCard {...item} reviews={Number(item.reviews)} />
              )}
              contentContainerStyle={{
                paddingTop: rV(10),
                paddingBottom: rV(8),
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: rMS(15),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  sectionCount: {
    fontSize: rMS(12),
    fontFamily: Fonts.title,
    color: AppColors.secondary,
  },

  emptyState: {
    marginTop: rV(16),
    backgroundColor: AppColors.white,
    borderRadius: rMS(14),
    paddingVertical: rV(20),
    paddingHorizontal: rS(14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  emptySubtitle: {
    marginTop: rV(6),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    textAlign: "center",
    lineHeight: rMS(17),
  },
});
