import { CategoryCollectionTile } from "@/components/category/CategoryUi";
import { CategoryListSkeleton } from "@/components/loaders/CommerceSkeletons";
import { AccountEmptyState } from "@/components/account/AccountUi";
import { NetworkErrorState } from "@/components/empty/NetworkErrorState";
import SearchLauncher from "@/components/search/SearchLauncher";
import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import Fonts from "@/constants/Fonts";
import { useCatalogCategories } from "@/hooks/useCatalog";
import { buildCategoryRouteParams } from "@/utils/catalogLanes";
import { useTheme } from "@/context/ThemeContext";
import { productCardGapX, rMS, rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors } from "@/constants/Colors";

const NUM_COLUMNS = 2;

const CategoryScreen = () => {
  const { colors } = useTheme();
  const tabBarInset = useTabBarContentInsetFromContext();
  const { horizontalPadding, gridCardWidth } = useResponsive();
  const gridGap = productCardGapX();
  const cardWidth = gridCardWidth(NUM_COLUMNS, gridGap);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { categories: catalogCategories, isLoading, error, errorKind, refresh } =
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={["top"]}>
      <FlatList
        data={catalogCategories}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        numColumns={NUM_COLUMNS}
        contentInsetAdjustmentBehavior="automatic"
        columnWrapperStyle={{
          justifyContent: "space-between",
          columnGap: gridGap,
          paddingHorizontal: horizontalPadding,
        }}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth, marginBottom: rV(12) }}>
            <CategoryCollectionTile
              title={item.title}
              subtitle={item.subtitle}
              image={item.image ?? null}
              subcategoryCount={item.subcategories?.length}
              onPress={() => handlePress(item)}
            />
          </View>
        )}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: horizontalPadding, paddingBottom: rV(14), gap: rV(14) }}>
            <SearchLauncher placeholder="Search products, stores & more" />
            <View>
              <Text style={{ fontFamily: Fonts.titleBold, fontSize: rMS(20), color: colors.text }}>
                Shop by category
              </Text>
              <Text
                style={{
                  marginTop: rV(4),
                  fontFamily: Fonts.text,
                  fontSize: rMS(12.5),
                  color: colors.textMuted,
                }}
              >
                {catalogCategories.length} categor{catalogCategories.length === 1 ? "y" : "ies"} to
                explore
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: tabBarInset,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          catalogCategories.length > 0 ? null : isLoading ? (
            <View style={{ paddingHorizontal: horizontalPadding }}>
              <CategoryListSkeleton />
            </View>
          ) : error ? (
            <View style={{ paddingHorizontal: horizontalPadding }}>
              <NetworkErrorState kind={errorKind} onRetry={() => void refresh()} />
            </View>
          ) : (
            <View style={{ paddingHorizontal: horizontalPadding }}>
              <AccountEmptyState
                icon="grid-outline"
                title="No categories yet"
                message="Categories you enable in admin will show up here automatically."
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
