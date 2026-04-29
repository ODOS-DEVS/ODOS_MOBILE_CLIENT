import BannerCard from "@/components/cards/BannerCard";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProductCard from "@/components/cards/ProductCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { SearchBar } from "@/components/SearchBar";
import SortTabs from "@/components/SortTabs";
import { kidsData } from "@/constants/Data";
import { useCatalogProducts } from "@/hooks/useCatalog";
import { rS, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const KidsScreen = () => {
  const [selectedSort, setSelectedSort] = useState("All");
  const {
    products: catalogProducts,
    sortOptions,
    isLoading,
  } = useCatalogProducts({ audience: "kids", fallback: kidsData });
  const [filteredData, setFilteredData] = useState(catalogProducts);
  const { gridCardWidth } = useResponsive();
  const gridGap = rS(6);
  const gridPadding = rS(17);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSortChange = (option: string) => {
    setSelectedSort(option);
  };

  // Apply Sort
  useEffect(() => {
    if (selectedSort === "All") {
      setFilteredData(catalogProducts);
    } else {
      const filtered = catalogProducts.filter(
        (item) => item.category?.toLowerCase() === selectedSort.toLowerCase(),
      );
      setFilteredData(filtered);
    }
  }, [catalogProducts, selectedSort]);

  return (
    <View className="flex-1 bg-white">
      <ProfileHeader title="Kids Zone" />
      {/* ---------------- SEARCH RESULTS MODE ---------------- */}
      {isSearching ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View className="px-4 mt-4 pb-10">
            {/* BACK BUTTON + TITLE */}
            <View className="flex-row items-center mt-6 mb-4">
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
                numColumns={2}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View className="px-1">
                    <ProductCard {...item} />
                  </View>
                )}
              />
            )}
          </View>
        </ScrollView>
      ) : (
        // ---------------- NORMAL KIDS SCREEN ----------------
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          className="flex-1 bg-white"
        >
          {/* SEARCH BAR */}
          <SearchBar
            data={catalogProducts}
            onStartSearch={() => setIsSearching(true)}
            onResults={setSearchResults}
          />

          {/* SORT TABS */}
          <View className="pt-4">
            <SortTabs
              options={sortOptions}
              onChange={handleSortChange}
              defaultOption="All"
            />
          </View>

          {/* PRODUCT GRID */}
          {isLoading ? (
            <ScreenLoader label="Loading products..." />
          ) : (
            <FlatList
              data={filteredData}
              numColumns={2}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={{ columnGap: gridGap }}
              renderItem={({ item }) => (
                <ProductCard
                  {...item}
                  cardWidth={gridCardWidth(2, gridGap)}
                  horizontalSpacing={7}
                />
              )}
              contentContainerStyle={{
                paddingHorizontal: gridPadding,
                paddingTop: 16,
              }}
            />
          )}

          {/* BANNER */}
          <View className="px-4 pt-2">
            <BannerCard
              title="Stores"
              image={require("@/assets/images/sports.png")}
              onPress={() => console.log("Stores pressed")}
            />
          </View>

          {/* POPULAR NEW */}
          <View className="flex-row justify-between mx-6 mt-8">
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
            data={catalogProducts.slice(0, 5)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard {...item} />}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          />
        </ScrollView>
      )}
    </View>
  );
};

export default KidsScreen;
