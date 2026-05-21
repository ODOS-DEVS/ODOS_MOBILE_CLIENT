import BannerCard from "@/components/cards/BannerCard";
import { ProductGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProductCard from "@/components/cards/ProductCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { SearchBar } from "@/components/SearchBar";
import SortTabs from "@/components/SortTabs";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LadiesCategory = () => {
  const insets = useSafeAreaInsets();
  const [selectedSort, setSelectedSort] = useState("All");
  const {
    products: catalogProducts,
    sortOptions,
    isLoading,
    error,
  } = useCatalogProducts({ audience: "ladies" });
  const { products: popularNewProducts } = useCatalogProducts({
    audience: "ladies",
    placement: "popular-new",
  });
  const [filteredData, setFilteredData] = useState(catalogProducts);
  const { gridCardWidth, responsiveColumns } = useResponsive();
  const numColumns = responsiveColumns;
  const gridGap = rS(6);
  const gridPadding = rS(17);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
      <ProfileHeader title="Ladies" />
      {/* SEARCH MODE */}
      {isSearching ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 72 }}
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
                numColumns={numColumns}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                columnWrapperStyle={numColumns > 1 ? { columnGap: gridGap } : undefined}
                renderItem={({ item }) => (
                  <View>
                    <ProductCard
                      {...item}
                      cardWidth={gridCardWidth(numColumns, gridGap)}
                      horizontalSpacing={0}
                    />
                  </View>
                )}
              />
            )}
          </View>
        </ScrollView>
      ) : (
        // NORMAL LADIES SCREEN
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 72 }}
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
          {isLoading && catalogProducts.length === 0 ? (
            <View style={{ paddingHorizontal: gridPadding, paddingTop: 16 }}>
              <ProductGridSkeleton count={6} />
            </View>
          ) : filteredData.length === 0 ? (
            <View className="px-4 pt-6">
              <Text className="text-center text-base font-montserrat-semiBold text-primary">
                {error ? "We couldn't load live ladies products" : "No ladies products live yet"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredData}
              numColumns={numColumns}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
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

          {/* BANNER */}
          <View className="px-4 pt-2">
            <BannerCard
              title="Stores"
              image={require("@/assets/images/ladiesstore.png")}
              onPress={() => console.log("Stores pressed")}
            />
          </View>

          {/* POPULAR NEW */}
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

export default LadiesCategory;
