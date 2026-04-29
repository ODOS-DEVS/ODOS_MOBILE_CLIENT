import CategoryCard from "@/components/cards/CategoryCard";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { SearchBar } from "@/components/SearchBar";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { categories } from "@/constants/Data";
import { CatalogCategoryItem, useCatalogCategories } from "@/hooks/useCatalog";
import { rMS, rS, rV } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";

const CategoryScreen = () => {
  const fallbackCategories = useMemo<CatalogCategoryItem[]>(
    () =>
      categories.map((item) => ({
        ...item,
        slug: item.title.toLowerCase(),
      })),
    [],
  );
  const { categories: catalogCategories, isLoading } =
    useCatalogCategories(fallbackCategories);

  const handlePress = (slug: string) => {
    switch (slug) {
      case "gents":
        router.push("/(root)/screens/categories/gents");
        break;
      case "ladies":
        router.push("/(root)/screens/categories/ladies");
        break;
      case "kids":
        router.push("/(root)/screens/categories/kids");
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <ProfileHeader title="Explore" showBackButton={false} />

      <FlatList
        data={[]}
        keyExtractor={() => "dummy"}
        renderItem={() => null}
        ListHeaderComponent={
          <View style={styles.content}>
            <SearchBar />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse Categories</Text>
              {isLoading ? (
                <ScreenLoader label="Loading categories..." />
              ) : (
                <FlatList
                  data={catalogCategories}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <CategoryCard
                      {...item}
                      onPress={() => handlePress(item.slug)}
                    />
                  )}
                  contentContainerStyle={styles.categoryList}
                />
              )}
            </View>
          </View>
        }
      />
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    marginBottom: rV(24),
  },
  content: {
    paddingTop: rV(18),
    paddingHorizontal: rS(16),
    paddingBottom: rV(120),
  },
  section: {
    marginTop: rV(24),
  },
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    color: AppColors.text,
    marginBottom: rV(14),
  },
  categoryList: {
    paddingBottom: rV(12),
  },
});
