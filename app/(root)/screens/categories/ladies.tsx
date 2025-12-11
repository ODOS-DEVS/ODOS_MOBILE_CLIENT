import BannerCard from "@/components/cards/BannerCard";
import ProductCard from "@/components/cards/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import SortTabs from "@/components/SortTabs";
import { ladiesData } from "@/constants/Data";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const LadiesCategory = () => {
  const [selectedSort, setSelectedSort] = useState("All");
  const [filteredData, setFilteredData] = useState(ladiesData);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSortChange = (option: string) => {
    setSelectedSort(option);
  };

  // Apply sorting
  useEffect(() => {
    if (selectedSort === "All") {
      setFilteredData(ladiesData);
    } else {
      const filtered = ladiesData.filter(
        (item) => item.category.toLowerCase() === selectedSort.toLowerCase()
      );
      setFilteredData(filtered);
    }
  }, [selectedSort]);

  return (
    <View className="flex-1 bg-white pt-10">
      {/* SEARCH MODE */}
      {isSearching ? (
        <ScrollView showsVerticalScrollIndicator={false}>
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
                data={ladiesData}
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
        // NORMAL LADIES SCREEN
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <View className="flex-row items-center justify-center mb-3 mt-4 px-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute left-6"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>

            <Text className="text-lg font-montserrat-extraBold text-center">
              Ladies Dorm
            </Text>
          </View>

          {/* SEARCH BAR */}
          <SearchBar
            data={ladiesData}
            onStartSearch={() => setIsSearching(true)}
            onResults={setSearchResults}
          />

          {/* SORT TABS */}
          <View className="pt-4">
            <SortTabs
              options={[
                "All",
                "Clothing",
                "Shoes",
                "Accessories",
                "Watches",
                "Bags",
              ]}
              onChange={handleSortChange}
              defaultOption="All"
            />
          </View>

          {/* PRODUCT GRID */}
          <FlatList
            data={filteredData}
            numColumns={2}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => <ProductCard {...item} />}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
            }}
          />

          {/* BANNER */}
          <View className="px-4 pt-2">
            <BannerCard
              title="Stores"
              image={require("@/assets/images/ladiesstore.png")}
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
            data={ladiesData.slice(0, 5)}
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
