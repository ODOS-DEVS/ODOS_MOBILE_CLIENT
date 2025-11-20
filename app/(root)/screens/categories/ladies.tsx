import BannerCard from "@/components/cards/BannerCard";
import ProductCard from "@/components/cards/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import SortTabs from "@/components/SortTabs";
import { gentsData, ladiesData } from "@/constants/Data";
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
  const [filteredData, setFilteredData] = useState(gentsData);

  const handleSortChange = (option: string) => {
    setSelectedSort(option);
  };

  // 🔁 Filter whenever the selectedSort changes
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
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex-1 bg-white pt-16">
        <View className="flex-row items-center justify-center mb-3 mt-4 px-4">
          {/* Back Icon */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-6"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* Centered Title */}
          <Text className="text-lg font-montserrat-extraBold text-center">
            Ladies Dorm
          </Text>
        </View>

        <SearchBar />

        {/* 🏷️ Sort Tabs */}
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

        {/* 🧢 Product List */}
        <FlatList
          data={filteredData}
          numColumns={3}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ProductCard {...item} />}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
          }}
        />

        {/* 🛍️ Banner Section */}
        <View className="px-4 pt-2">
          <BannerCard
            title="Stores"
            image={require("@/assets/images/ladiesstore.png")}
            onPress={() => console.log("Stores pressed")}
          />
        </View>

        {/* ⭐ Popular New Section */}
        <View className="flex-row justify-between mx-6 mt-8">
          <Text className="text-lg font-montserrat-semiBold">Popular New</Text>
          <TouchableOpacity>
            <Text className="text-lg font-montserrat-semiBold text-secondary">
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={ladiesData.slice(0, 5)} // maybe just show a few
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard {...item} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
        />
      </View>
    </ScrollView>
  );
};

export default LadiesCategory;
