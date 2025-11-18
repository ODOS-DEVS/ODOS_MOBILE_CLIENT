import CategoryCard from "@/components/CategoryCard";
import { SearchBar } from "@/components/SearchBar";
import { categories } from "@/constants/Data";
import { router } from "expo-router";
import React from "react";
import { FlatList, ScrollView, StatusBar, Text, View } from "react-native";

const CategoryScreen = () => {

  const handlePress = (id: string) => {
    switch (id) {
      case "1":
        router.push("/(root)/screens/categories/gents");
        break;
      case "2":
        router.push("/(root)/screens/categories/ladies");
        break;
      case "3":
        router.push("/(root)/screens/categories/kids")
      default:
        break;
    }
  };

  return (
    <ScrollView>
      <View>
        <StatusBar barStyle={"dark-content"} />
        <Text className="font-montserrat-extraBold text-xl pt-16 text-center">
          Explore
        </Text>
        <SearchBar />

        <View className="mt-8">
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CategoryCard {...item} onPress={() => handlePress(item.id)} />
            )}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default CategoryScreen;
