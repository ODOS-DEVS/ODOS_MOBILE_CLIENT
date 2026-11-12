import { CategoryCollectionTile } from "@/components/category/CategoryUi";
import { CategoryListSkeleton } from "@/components/loaders/CommerceSkeletons";
import { AccountEmptyState } from "@/components/account/AccountUi";
import { NetworkErrorState } from "@/components/empty/NetworkErrorState";
import SearchField from "@/components/search/SearchField";
import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import Fonts from "@/constants/Fonts";
import { useCatalogCategories } from "@/hooks/useCatalog";
import { useFocusRevalidate } from "@/hooks/useLiveRefresh";
import { buildCategoryRouteParams } from "@/utils/catalogLanes";
import { useTheme } from "@/context/ThemeContext";
import { productCardGapX, rMS, rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
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
  const [query, setQuery] = useState("");
  const { categories: catalogCategories, isLoading, error, errorKind, refresh } =
    useCatalogCategories();

  const revalidateCategories = useFocusRevalidate(
    useCallback(() => refresh({ background: true }), [refresh]),
  );
  useFocusEffect(revalidateCategories);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  /**
   * Filtering happens here rather than on the product search screen.
   *
   * Tapping search on a screen of categories used to jump to product search,
   * which threw away the context the shopper was already in: they were looking
   * for a *category*, and landed somewhere that searches products. Matching
   * covers subcategory names too, so "sneakers" finds Footwear even when no
   * category is called that.
   */
  const visibleCategories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return catalogCategories;
    }
    return catalogCategories.filter((category) => {
      const haystack = [
        category.title,
        category.subtitle,
        ...(category.subcategories ?? []),
      ];
      return haystack.some((value) => value?.toLowerCase().includes(needle));
    });
  }, [catalogCategories, query]);

  const handlePress = useCallback((category: (typeof catalogCategories)[number]) => {
    router.push({
      pathname: "/screens/categories/[slug]" as any,
      params: buildCategoryRouteParams(category),
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={["top"]}>
      <FlatList
        data={visibleCategories}
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
            <SearchField
              embedded
              value={query}
              onChangeText={setQuery}
              placeholder="Search categories"
            />
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
                {query.trim()
                  ? `${visibleCategories.length} match${
                      visibleCategories.length === 1 ? "" : "es"
                    } for "${query.trim()}"`
                  : `${catalogCategories.length} categor${
                      catalogCategories.length === 1 ? "y" : "ies"
                    } to explore`}
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: tabBarInset,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          visibleCategories.length > 0 ? undefined : query.trim() ? (
            <View style={{ paddingHorizontal: horizontalPadding, gap: rV(10) }}>
              <AccountEmptyState
                icon="search-outline"
                title="No matching category"
                message={`Nothing here matches "${query.trim()}".`}
              />
              {/* The search box filters categories, so product search stays
                  reachable as an explicit next step rather than hijacking it. */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() =>
                  router.push({
                    pathname: "/screens/search" as any,
                    params: { query: query.trim() },
                  })
                }
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: Fonts.titleBold,
                    fontSize: rMS(13.5),
                    color: AppColors.primary,
                  }}
                >
                  Search products for “{query.trim()}”
                </Text>
              </TouchableOpacity>
            </View>
          ) : isLoading ? (
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
