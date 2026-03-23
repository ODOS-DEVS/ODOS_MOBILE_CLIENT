import BannerCard from "@/components/cards/BannerCard";
import ProductCard from "@/components/cards/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import SortTabs from "@/components/SortTabs";
import { gentsData } from "@/constants/Data";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GentsScreen = () => {
  // Sorting
  const [selectedSort, setSelectedSort] = useState("All");
  const [filteredData, setFilteredData] = useState(gentsData);

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
      setFilteredData(gentsData);
    } else {
      const filtered = gentsData.filter(
        (item) => item.category.toLowerCase() === selectedSort.toLowerCase()
      );
      setFilteredData(filtered);
    }
  }, [selectedSort]);

  return (
    <View className="flex-1 bg-white pt-10">
      <StatusBar barStyle="dark-content" />

      {/* ---------------- SEARCH RESULTS MODE ---------------- */}
      {isSearching ? (
        <ScrollView>
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
                data={gentsData}
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
                renderItem={({ item }) => <ProductCard {...item} />}
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
          className="flex-1 bg-white"
        >
          {/* HEADER */}
          <View className="flex-row items-center justify-center mb-3 mt-12 px-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute left-6"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>

            <Text className="text-lg font-montserrat-extraBold text-center">
              Gents
            </Text>
          </View>

          {/* SEARCH BAR */}
          <SearchBar
            data={gentsData}
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
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard {...item} />}
            contentContainerStyle={{
              paddingHorizontal: 8,
              paddingTop: 16,
            }}
          />

          {/* BANNER */}
          <View className="px-4 pt-2">
            <BannerCard
              title="Stores"
              image={require("@/assets/images/cloths.jpg")}
              onPress={() => console.log("Stores pressed")}
            />
          </View>

          {/* POPULAR NEW HEADER */}
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
            data={gentsData.slice(0, 5)}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
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

export default GentsScreen;
