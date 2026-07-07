import ProductCard from "@/components/cards/ProductCard";
import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import {
  AccountEmptyState,
  CategoryDetailMetaLine,
  CategorySubcategoryChips,
} from "@/components/category/CategoryUi";
import { ProductGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SearchLauncher from "@/components/search/SearchLauncher";
import { AppColors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { useCatalogCategories } from "@/hooks/useCatalog";
import { useInfiniteCatalogProducts } from "@/hooks/useInfiniteCatalogProducts";
import { rS, rV, useResponsive } from "@/styles/responsive";
import { productMatchesCatalogSubcategory } from "@/utils/catalogTaxonomy";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_SUBCATEGORY = "All";

function parseSubcategoriesParam(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (entry): entry is string => typeof entry === "string" && entry.trim().length > 0,
        )
      : [];
  } catch {
    return [];
  }
}

type CategoryBrowseScreenProps = {
  slug?: string;
  title?: string;
  subtitle?: string;
  subcategoriesParam?: string;
};

export function CategoryBrowseScreen({
  slug,
  title,
  subcategoriesParam,
}: CategoryBrowseScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedSubcategory, setSelectedSubcategory] =
    useState(DEFAULT_SUBCATEGORY);
  const { gridCardWidth, horizontalPadding, responsiveColumns } =
    useResponsive();
  const numColumns = responsiveColumns;
  const gridGap = rS(10);
  const gridPadding = horizontalPadding;
  const cardWidth = gridCardWidth(numColumns, gridGap);

  const detailStyles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: colors.screen,
        },
        header: {
          gap: rV(10),
          paddingTop: rV(6),
          paddingBottom: rV(4),
        },
      }),
    [colors],
  );

  const { categories: catalogCategories } = useCatalogCategories();
  const parsedSubcategoriesFromParams = useMemo(
    () => parseSubcategoriesParam(subcategoriesParam),
    [subcategoriesParam],
  );

  const catalogCategory = useMemo(
    () => catalogCategories.find((entry) => entry.slug === slug),
    [catalogCategories, slug],
  );

  const resolvedSubcategories = useMemo(() => {
    const fromCatalog = catalogCategory?.subcategories ?? [];
    if (fromCatalog.length > 0) {
      return fromCatalog;
    }
    return parsedSubcategoriesFromParams;
  }, [catalogCategory?.subcategories, parsedSubcategoriesFromParams]);

  const apiSubcategory =
    selectedSubcategory === DEFAULT_SUBCATEGORY
      ? undefined
      : selectedSubcategory;

  const {
    products: categoryProducts,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteCatalogProducts({
    category: slug,
    subcategory: apiSubcategory,
  });

  useEffect(() => {
    setSelectedSubcategory(DEFAULT_SUBCATEGORY);
  }, [slug]);

  const filterOptions = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set(DEFAULT_SUBCATEGORY, categoryProducts.length);

    for (const subcategory of resolvedSubcategories) {
      const count = categoryProducts.filter((product) =>
        productMatchesCatalogSubcategory(product, subcategory),
      ).length;
      counts.set(subcategory, count);
    }

    return [DEFAULT_SUBCATEGORY, ...resolvedSubcategories].map((value) => ({
      key: value,
      label: value === DEFAULT_SUBCATEGORY ? "All" : value,
      count: counts.get(value) ?? 0,
    }));
  }, [categoryProducts, resolvedSubcategories]);

  const resolvedTitle = catalogCategory?.title ?? title ?? "Category";

  const filteredProducts = categoryProducts;

  const listHeader = (
    <View style={detailStyles.header}>
      <SearchLauncher
        placeholder="Search products, stores & more"
        params={slug ? { category: slug } : undefined}
      />
      <View style={{ paddingHorizontal: horizontalPadding, gap: rV(8) }}>
        <CategoryDetailMetaLine
          productCount={filteredProducts.length}
          subcategoryCount={resolvedSubcategories.length}
          hasMore={hasMore}
        />
        {filterOptions.length > 1 ? (
          <CategorySubcategoryChips
            options={filterOptions}
            activeKey={selectedSubcategory}
            onChange={setSelectedSubcategory}
          />
        ) : null}
      </View>
    </View>
  );

  if (isLoading && categoryProducts.length === 0) {
    return (
      <View style={detailStyles.screen}>
        <StatusBar barStyle="dark-content" />
        <ProfileHeader title={resolvedTitle} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + rV(88),
            gap: rV(12),
          }}
        >
          {listHeader}
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <ProductGridSkeleton count={4} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={detailStyles.screen}>
      <StatusBar barStyle="dark-content" />
      <ProfileHeader title={resolvedTitle} />
      <FlatList
        data={filteredProducts}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.45}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && categoryProducts.length > 0}
            onRefresh={() => void refresh()}
            tintColor={AppColors.primary}
          />
        }
        ListFooterComponent={
          <CatalogScrollFooter isLoadingMore={isLoadingMore} />
        }
        columnWrapperStyle={
          numColumns > 1
            ? {
                justifyContent: "space-between",
                columnGap: gridGap,
                paddingHorizontal: gridPadding,
              }
            : undefined
        }
        contentContainerStyle={{
          paddingBottom: insets.bottom + rV(88),
          gap: rV(10),
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={{
              width: cardWidth,
              marginBottom: rV(8),
              paddingHorizontal: numColumns === 1 ? gridPadding : 0,
            }}
          >
            <ProductCard
              {...item}
              cardWidth={cardWidth}
              horizontalSpacing={0}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <AccountEmptyState
              icon="cube-outline"
              title={
                selectedSubcategory === DEFAULT_SUBCATEGORY
                  ? "No products here yet"
                  : "No products in this subcategory"
              }
              message={
                selectedSubcategory === DEFAULT_SUBCATEGORY
                  ? "Products linked to this category will appear once they are published."
                  : "Try another subcategory or browse all items in this category."
              }
              actionLabel={
                selectedSubcategory !== DEFAULT_SUBCATEGORY
                  ? "Show all"
                  : undefined
              }
              onAction={
                selectedSubcategory !== DEFAULT_SUBCATEGORY
                  ? () => setSelectedSubcategory(DEFAULT_SUBCATEGORY)
                  : undefined
              }
            />
          </View>
        }
      />
    </View>
  );
}
