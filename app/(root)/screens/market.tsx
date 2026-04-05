import StoreCard from "@/components/cards/StoreCard";
import { SearchBar } from "@/components/SearchBar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { markets, Stores } from "@/constants/Data";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MarketScreen = () => {
  const { activeMarket: initialMarketParam } = useLocalSearchParams();
  const { horizontalPadding, sectionSpacing, gridCardWidth } = useResponsive();
  const initialMarket =
    typeof initialMarketParam === "string" && initialMarketParam.length
      ? initialMarketParam
      : "All";
  const [activeMarket, setActiveMarket] = useState<string>(initialMarket);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(Stores);
  const [searchSessionKey, setSearchSessionKey] = useState(0);

  const marketNames = useMemo(
    () => ["All", ...Array.from(new Set(markets.map((m) => m.title)))],
    []
  );

  const filterStores = (marketName: string) => {
    if (marketName === "All") return Stores;
    return Stores.filter(
      (store) => (store as any).market?.toLowerCase() === marketName.toLowerCase()
    );
  };

  const filteredStores = useMemo(
    () => (isSearching ? searchResults : filterStores(activeMarket)),
    [activeMarket, isSearching, searchResults]
  );


  useEffect(() => {
    // Update if navigated with a new param
    if (
      typeof initialMarketParam === "string" &&
      initialMarketParam.length &&
      initialMarketParam !== activeMarket
    ) {
      handleMarketChange(initialMarketParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMarketParam]);

  const handleMarketChange = (marketName: string) => {
    setActiveMarket(marketName);
    setIsSearching(false);
    setSearchResults(filterStores(marketName));
    setSearchSessionKey((prev) => prev + 1);
  };

  const handleReset = () => {
    setActiveMarket("All");
    setIsSearching(false);
    setSearchResults(Stores);
    setSearchSessionKey((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <ProfileHeader title="Markets" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: sectionSpacing,
          paddingTop: rV(8),
        }}
      >
        <SearchBar
          key={`${activeMarket}-${searchSessionKey}`}
          data={filterStores(activeMarket)}
          onStartSearch={() => setIsSearching(true)}
          onResults={(results) => {
            setIsSearching(true);
            setSearchResults(results);
          }}
          placeholder="Search stores by name, category or market..."
          containerStyle={{ marginTop: rV(12) }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={{ marginTop: rV(12) }}
        >
          {marketNames.map((marketName) => {
            const isActive = marketName === activeMarket;
            return (
              <TouchableOpacity
                key={marketName}
                onPress={() => handleMarketChange(marketName)}
                activeOpacity={0.85}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                  {marketName}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={handleReset}
            activeOpacity={0.8}
            style={styles.resetChip}
          >
            <Text style={styles.resetChipLabel}>Reset</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={{ marginTop: sectionSpacing }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeMarket === "All" ? "Stores" : `Stores in ${activeMarket}`}
            </Text>
          </View>

          {filteredStores.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No stores here yet</Text>
              <Text style={styles.emptySubtitle}>
                Try another market or reset to see all stores.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredStores}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ columnGap: rS(12) }}
              renderItem={({ item }) => (
                <StoreCard
                  {...item}
                  cardWidth={gridCardWidth(2, rS(12))}
                  horizontalSpacing={0}
                  category={(item as any).market ?? item.category}
                />
              )}
              contentContainerStyle={{ paddingTop: rV(12) }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MarketScreen;

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
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rV(12),
  },
  heroStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroStatValue: {
    marginLeft: rS(6),
    fontSize: rMS(12.5),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  heroDivider: {
    width: 1,
    height: rV(16),
    backgroundColor: "#E2E8F0",
    marginHorizontal: rS(10),
  },
  mapPill: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderRadius: rMS(18),
    backgroundColor: "#EEF2F5",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
  },
  mapPillText: {
    marginLeft: rS(6),
    fontSize: rMS(12),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: rS(14),
    paddingVertical: rV(8),
    borderRadius: rMS(18),
    backgroundColor: "#EEF2F5",
    marginRight: rS(8),
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  chipLabel: {
    fontSize: rMS(12),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  chipLabelActive: {
    color: AppColors.white,
  },
  resetChip: {
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderRadius: rMS(18),
    backgroundColor: "transparent",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#CBD5E1",
  },
  resetChipLabel: {
    fontSize: rMS(12),
    fontFamily: Fonts.title,
    color: AppColors.secondary,
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
