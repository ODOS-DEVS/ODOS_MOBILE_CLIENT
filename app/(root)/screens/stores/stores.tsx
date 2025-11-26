import StoreCard from "@/components/cards/StoreCard";
import { SearchBar } from "@/components/SearchBar";
import { Stores } from "@/constants/Data";
import { rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const StoreScreen = () => {
  return (
    <ScrollView
      className="flex-1 bg-white pt-16"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center justify-center mb-3 mt-4 px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-6"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text className="text-lg font-montserrat-extraBold text-center">
          Stores
        </Text>
      </View>
      <SearchBar />

      <View style={{ paddingHorizontal: rS(15), marginTop: rV(10) }}>
        <FlatList
          data={Stores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <StoreCard {...item} />}
          contentContainerStyle={{ paddingHorizontal: 1 }}
          scrollEnabled={false}
          numColumns={2}
        />
      </View>
    </ScrollView>
  );
};

export default StoreScreen;
