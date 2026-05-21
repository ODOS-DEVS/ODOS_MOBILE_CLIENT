import CategoryCard from "@/components/cards/CategoryCard";
import { CategoryListSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SearchLauncher from "@/components/search/SearchLauncher";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { CatalogCategoryItem, useCatalogCategories } from "@/hooks/useCatalog";
import { rMS, rS, rV } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, StatusBar, StyleSheet, Text, View } from "react-native";

const CategoryScreen = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { categories: catalogCategories, isLoading, error, refresh } =
    useCatalogCategories();

  useFocusEffect(
    useCallback(() => {
      void refresh({ background: true });
    }, [refresh]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

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
            <SearchLauncher />

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
        ListEmptyComponent={
          isLoading ? (
            <CategoryListSkeleton />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {error ? "We couldn't load categories" : "No categories live yet"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {error
                  ? "Pull down to try again and make sure the backend is reachable."
                  : "Categories you enable from admin will appear here automatically."}
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={AppColors.primary}
          />
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
    flexGrow: 1,
  },
  emptyState: {
    marginTop: rV(12),
    paddingVertical: rV(24),
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: rV(8),
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    color: "#6B7280",
    textAlign: "center",
    lineHeight: rMS(19),
  },
});
