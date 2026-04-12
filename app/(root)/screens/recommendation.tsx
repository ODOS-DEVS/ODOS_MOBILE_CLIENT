import RecommendationCard from "@/components/cards/RecommendationCard";
import { SearchBar } from "@/components/SearchBar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { recommendations } from "@/constants/Data";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function RecommendationScreen() {
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(recommendations);

  const displayed = useMemo(
    () => (isSearching ? searchResults : recommendations),
    [isSearching, searchResults]
  );


  return (
    <View style={styles.container}>
      <ProfileHeader title="Recommendations" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: sectionSpacing,
          paddingTop: rV(8),
        }}
      >
        

        <SearchBar
          data={recommendations}
          onStartSearch={() => setIsSearching(true)}
          onResults={(results) => {
            setIsSearching(true);
            setSearchResults(results);
          }}
          placeholder="Search recommended products, categories..."
          containerStyle={{ marginTop: rV(12) }}
        />

        <View style={{ marginTop: sectionSpacing }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All recommendations</Text>
          </View>

          {displayed.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No recommendations right now</Text>
              <Text style={styles.emptySubtitle}>
                Try another search or browse categories to refresh suggestions.
              </Text>
            </View>
          ) : (
            <FlatList
              data={displayed}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: rV(10) }} />}
              renderItem={({ item }) => <RecommendationCard {...item} />}
              contentContainerStyle={{ paddingTop: rV(10), paddingBottom: rV(8) }}
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
  heroCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(14),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heroEyebrow: {
    fontSize: rMS(11),
    fontFamily: Fonts.title,
    color: AppColors.secondary,
    letterSpacing: 0.4,
  },
  heroTitle: {
    marginTop: rV(8),
    fontSize: rMS(17),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  heroSubtitle: {
    marginTop: rV(6),
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(18),
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rV(12),
  },
  heroStatLabel: {
    fontSize: rMS(11),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  heroStatValue: {
    marginLeft: rS(6),
    fontSize: rMS(13),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  heroDivider: {
    width: 1,
    height: rV(16),
    backgroundColor: "#E2E8F0",
    marginHorizontal: rS(10),
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
