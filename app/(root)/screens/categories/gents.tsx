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
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

const GentsScreen = () => {
  const [selectedSort, setSelectedSort] = useState("All");
  const [filteredData, setFilteredData] = useState(gentsData);

  const handleSortChange = (option: string) => {
    setSelectedSort(option);
  };

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
    <ScrollView
      className="flex-1 bg-white pt-16"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />

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
          Gents
        </Text>
      </View>

      <SearchBar />

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
        numColumns={3}
        scrollEnabled={false} // IMPORTANT
        keyExtractor={(item) => item.id}
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
          image={require("@/assets/images/cloths.jpg")}
          onPress={() => console.log("Stores pressed")}
        />
      </View>

      {/* POPULAR NEW HEADER */}
      <View className="flex-row justify-between mx-6 mt-8">
        <Text className="text-lg font-montserrat-semiBold">Popular New</Text>
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
  );
};

export default GentsScreen;
