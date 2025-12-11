import RecommendationCard from "@/components/cards/RecommendationCard";
import { SearchBar } from "@/components/SearchBar";
import { recommendations } from "@/constants/Data";
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

interface RecommendationCardProps {
  id: string;
  image: any;
  title: string;
  category?: string;
  oldPrice?: number;
  price?: number;
  rating?: number;
  reviews?: number;
  isWishlisted?: boolean;
}

const RecommendationScreen: React.FC<RecommendationCardProps> = () => {
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
          Recommendation
        </Text>
      </View>
      {/* <SearchBar /> */}

      <View className="mx-4">
        <FlatList
          data={recommendations}
          renderItem={({ item }) => <RecommendationCard {...item} />}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

export default RecommendationScreen;
