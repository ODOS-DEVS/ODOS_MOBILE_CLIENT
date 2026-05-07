import CategoryCard from "@/components/cards/CategoryCard";
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
        slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      })),
    [],
  );
  const { categories: catalogCategories } =
    useCatalogCategories(fallbackCategories);

  const handlePress = (category: CatalogCategoryItem) => {
    router.push({
      pathname: "/screens/categories/[slug]" as any,
      params: {
        slug: category.slug,
        title: category.title,
        subtitle: category.subtitle,
        subcategories: JSON.stringify(category.subcategories ?? []),
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <ProfileHeader title="Explore" showBackButton={false} />

      <FlatList
        data={catalogCategories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            {...item}
            subcategoryCount={item.subcategories?.length}
            onPress={() => handlePress(item)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.content}>
            <SearchBar />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse Categories</Text>
              <Text style={styles.sectionSubtitle}>
                Find what you want faster across ODOS.
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingTop: rV(18),
    paddingHorizontal: rS(16),
  },
  section: {
    marginTop: rV(24),
    marginBottom: rV(10),
  },
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    color: AppColors.text,
  },
  sectionSubtitle: {
    marginTop: rV(6),
    fontFamily: Fonts.title,
    fontSize: rMS(13),
    color: "#6B7280",
  },
  listContent: {
    paddingHorizontal: rS(16),
    paddingBottom: rV(118),
  },
});
