import ProductCard from "@/components/cards/ProductCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { SearchBar } from "@/components/SearchBar";
import { AppColors } from "@/constants/Colors";
import { useCatalogProducts } from "@/hooks/useCatalog";
import { rS, useResponsive } from "@/styles/responsive";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_SUBCATEGORY = "All";

function normalizeValue(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CategoryDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const { slug, title, subtitle, subcategories } = useLocalSearchParams<{
    slug?: string;
    title?: string;
    subtitle?: string;
    subcategories?: string;
  }>();
  const [selectedSubcategory, setSelectedSubcategory] = useState(DEFAULT_SUBCATEGORY);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { gridCardWidth, responsiveColumns } = useResponsive();
  const numColumns = responsiveColumns;
  const gridGap = rS(6);
  const gridPadding = rS(17);

  const parsedSubcategories = useMemo(() => {
    if (!subcategories) {
      return [];
    }

    try {
      const parsed = JSON.parse(subcategories);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [subcategories]);

  const { products: categoryProducts, isLoading } = useCatalogProducts({
    category: slug,
    fallback: [],
  });

  const filteredProducts = useMemo(() => {
    if (selectedSubcategory === DEFAULT_SUBCATEGORY) {
      return categoryProducts;
    }

    const normalizedSelected = normalizeValue(selectedSubcategory);

    return categoryProducts.filter((product) => {
      const candidateValues = [
        product.subcategory,
        ...(product.subcategorySlugs ?? []),
      ]
        .map((value) => normalizeValue(value))
        .filter(Boolean);

      return candidateValues.includes(normalizedSelected);
    });
  }, [categoryProducts, selectedSubcategory]);

  useEffect(() => {
    setSelectedSubcategory(DEFAULT_SUBCATEGORY);
  }, [slug]);

  const tabOptions = useMemo(
    () => [DEFAULT_SUBCATEGORY, ...parsedSubcategories],
    [parsedSubcategories],
  );

  const resolvedTitle = title ?? "Category";
  const resolvedSubtitle = subtitle ?? "Browse ODOS picks";

  return (
    <View className="flex-1 bg-white">
      <ProfileHeader title={resolvedTitle} />

      {isSearching ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 72 }}
        >
          <View className="px-4 pb-10 pt-4">
            <Text className="text-lg font-montserrat-bold text-black">
              Search results
            </Text>
            <View className="relative bottom-0">
              <SearchBar
                data={filteredProducts}
                onStartSearch={() => setIsSearching(true)}
                onResults={setSearchResults}
              />
            </View>

            {searchResults.length === 0 ? (
              <Text className="mt-12 text-center text-xl font-montserrat-semiBold text-primary">
                No products found
              </Text>
            ) : (
              <FlatList
                data={searchResults}
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
              />
            )}

            <TouchableOpacity
              onPress={() => {
                setIsSearching(false);
                setSearchResults([]);
              }}
              activeOpacity={0.8}
              style={{
                marginTop: 24,
                alignSelf: "center",
                borderRadius: 999,
                backgroundColor: AppColors.primary,
                paddingHorizontal: 20,
                paddingVertical: 12,
              }}
            >
              <Text className="text-sm font-montserrat-semiBold text-white">
                Back to category
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 72 }}
        >
          <SearchBar
            data={filteredProducts}
            onStartSearch={() => setIsSearching(true)}
            onResults={setSearchResults}
            placeholder={`Search ${resolvedTitle.toLowerCase()} products`}
          />

          <View className="px-4 pt-4">
            <Text className="text-2xl font-montserrat-extraBold text-text">
              {resolvedTitle}
            </Text>
            <Text className="mt-2 text-sm leading-6 text-secondary font-montserrat-semiBold">
              {resolvedSubtitle}
            </Text>
          </View>

          {tabOptions.length > 1 ? (
            <FlatList
              data={tabOptions}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={{ paddingHorizontal: rS(16), paddingTop: rS(18) }}
              renderItem={({ item }) => {
                const active = item === selectedSubcategory;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedSubcategory(item)}
                    activeOpacity={0.8}
                    style={{
                      marginRight: 12,
                      borderRadius: 999,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      backgroundColor: active ? AppColors.primary : "#EEF2F5",
                    }}
                  >
                    <Text
                      className={`font-montserrat-semiBold ${
                        active ? "text-white" : "text-black"
                      }`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          ) : null}

          {filteredProducts.length === 0 ? (
            <View className="px-4 pt-10">
              <View className="rounded-[24px] bg-[#F4F7FA] px-5 py-8">
                <Text className="text-center text-lg font-montserrat-bold text-black">
                  {isLoading ? "Getting products ready" : "No products here yet"}
                </Text>
                <Text className="mt-2 text-center text-sm leading-6 text-[#5E6B7A] font-montserrat-semiBold">
                  {isLoading
                    ? "Products for this category are still loading."
                    : "Products linked to this category or subcategory will appear automatically once the admin creates them."}
                </Text>
              </View>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
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
                paddingTop: 18,
              }}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default CategoryDetailScreen;
