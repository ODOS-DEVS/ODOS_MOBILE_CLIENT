import BannerCard from "@/components/cards/BannerCard";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProductCard from "@/components/cards/ProductCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { SearchBar } from "@/components/SearchBar";
import SortTabs from "@/components/SortTabs";
import { gentsData } from "@/constants/Data";
import { useCatalogProducts } from "@/hooks/useCatalog";
import { rS, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GentsScreen = () => {
  const insets = useSafeAreaInsets();
  const { gridCardWidth, responsiveColumns } = useResponsive();
  const numColumns = responsiveColumns;
  const gridGap = rS(6);
  const gridPadding = rS(17);
  const {
    products: catalogProducts,
    sortOptions,
    isLoading,
  } = useCatalogProducts({ audience: "gents", fallback: gentsData });
  const { products: popularNewProducts } = useCatalogProducts({
    audience: "gents",
    placement: "popular-new",
    fallback: catalogProducts.slice(0, 5),
  });

  // Sorting
  const [selectedSort, setSelectedSort] = useState("All");
  const [filteredData, setFilteredData] = useState(catalogProducts);

  // Search
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle sort change
  const handleSortChange = (option: string) => {
    setSelectedSort(option);
  };

  // Apply sorting
  useEffect(() => {
    if (selectedSort === "All") {
      setFilteredData(catalogProducts);
    } else {
      const filtered = catalogProducts.filter(
        (item) =>
          item.category?.toLowerCase() === selectedSort.toLowerCase() ||
          item.subcategory?.toLowerCase() === selectedSort.toLowerCase(),
      );
      setFilteredData(filtered);
    }
  }, [catalogProducts, selectedSort]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <ProfileHeader title="Gents" />
      {/* ---------------- SEARCH RESULTS MODE ---------------- */}
      {isSearching ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <View className="px-4 mt-4 pb-10">
            {/* BACK BUTTON */}
            <View className="flex-row items-center mb-4">
              <TouchableOpacity
                onPress={() => {
                  setIsSearching(false);
                  setSearchResults([]);
                }}
                className="mr-2 p-2"
              >
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>

              <Text className="text-lg font-montserrat-bold">
                Search Results
              </Text>
            </View>

            {/* SEARCH BAR */}
            <View className="relative bottom-8">
              <SearchBar
                data={catalogProducts}
                onStartSearch={() => setIsSearching(true)}
                onResults={setSearchResults}
              />
            </View>

            {/* RESULTS */}
            {searchResults.length === 0 ? (
              <Text className="text-xl text-center font-montserrat-semiBold mt-12 text-primary">
                No results found
              </Text>
            ) : (
              <FlatList
                data={searchResults}
                numColumns={numColumns}
                keyExtractor={(item) => item.id}
                columnWrapperStyle={numColumns > 1 ? { columnGap: gridGap } : undefined}
                renderItem={({ item }) => (
                  <ProductCard
                    {...item}
                    cardWidth={gridCardWidth(numColumns, gridGap)}
                    horizontalSpacing={0}
                  />
                )}
                contentContainerStyle={{ paddingTop: 16 }}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      ) : (
        // ---------------- NORMAL GENTS SCREEN ----------------
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 72 }}
          className="flex-1 bg-white"
        >
          {/* SEARCH BAR */}
          <SearchBar
            data={catalogProducts}
            onStartSearch={() => setIsSearching(true)}
            onResults={setSearchResults}
          />

          {/* SORT TABS */}
          <View className="pt-4 bg-white">
            <SortTabs
              options={sortOptions}
              onChange={handleSortChange}
              defaultOption="All"
            />
          </View>

          {/* PRODUCT GRID */}
          <View>
            {isLoading ? (
              <ScreenLoader label="Loading products..." />
            ) : (
              <FlatList
                data={filteredData}
                numColumns={numColumns}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                columnWrapperStyle={numColumns > 1 ? { columnGap: gridGap } : undefined}
                renderItem={({ item }) => (
                  <ProductCard
                    {...item}
                    cardWidth={gridCardWidth(numColumns, gridGap)}
                    horizontalSpacing={0}
                  />
                )}
                contentContainerStyle={{
                  paddingHorizontal: gridPadding,
                  paddingTop: 16,
                }}
              />
            )}
          </View>

          {/* BANNER */}
          <View className="px-4 pt-2">
            <BannerCard
              title="Stores"
              image={require("@/assets/images/cloths.jpg")}
              onPress={() => console.log("Stores pressed")}
            />
          </View>

          {/* POPULAR NEW HEADER */}
          <View className="flex-row justify-between mx-6 mt-4">
            <Text className="text-lg font-montserrat-semiBold">
              Popular New
            </Text>
            <TouchableOpacity>
              <Text className="text-lg font-montserrat-semiBold text-secondary">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {/* POPULAR LIST */}
          <FlatList
            data={popularNewProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard {...item} />}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 12,
              paddingRight: rS(8),
            }}
          />
        </ScrollView>
      )}
    </View>
  );
};

export default GentsScreen;
