import { CategoryBrowseCardFromItem } from "@/components/category/CategoryUi";
import { CategoryListSkeleton } from "@/components/loaders/CommerceSkeletons";
import { AccountEmptyState } from "@/components/account/AccountUi";
import SearchLauncher from "@/components/search/SearchLauncher";
import { useCatalogCategories } from "@/hooks/useCatalog";
import { buildCategoryRouteParams } from "@/utils/catalogLanes";
import { rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors } from "@/constants/Colors";

const CategoryScreen = () => {
  const { horizontalPadding } = useResponsive();
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

  const handlePress = useCallback((category: (typeof catalogCategories)[number]) => {
    router.push({
      pathname: "/screens/categories/[slug]" as any,
      params: buildCategoryRouteParams(category),
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F7FA" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={catalogCategories}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <CategoryBrowseCardFromItem item={item} onPress={() => handlePress(item)} />
          </View>
        )}
        ListHeaderComponent={
          <View style={{ paddingBottom: rV(10) }}>
            <SearchLauncher placeholder="Search products, stores & more" />
          </View>
        }
        contentContainerStyle={{
          paddingBottom: rV(118),
          gap: rV(12),
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          catalogCategories.length > 0 ? null : isLoading ? (
            <View style={{ paddingHorizontal: horizontalPadding }}>
              <CategoryListSkeleton />
            </View>
          ) : (
            <View style={{ paddingHorizontal: horizontalPadding }}>
              <AccountEmptyState
                icon="grid-outline"
                title={error ? "Couldn't load categories" : "No categories yet"}
                message={
                  error
                    ? "Pull down to refresh and confirm the ODOS backend is reachable."
                    : "Categories you enable in admin will show up here automatically."
                }
                actionLabel={error ? "Try again" : undefined}
                onAction={error ? () => void refresh() : undefined}
              />
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
    </SafeAreaView>
  );
};

export default CategoryScreen;
