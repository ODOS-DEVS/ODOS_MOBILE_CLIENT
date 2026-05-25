import { CategoryBrowseScreen } from "@/components/category/CategoryBrowseScreen";
import { useLocalSearchParams } from "expo-router";
import React from "react";

const CategoryDetailScreen = () => {
  const { slug, title, subtitle, subcategories } = useLocalSearchParams<{
    slug?: string;
    title?: string;
    subtitle?: string;
    subcategories?: string;
  }>();

  return (
    <CategoryBrowseScreen
      slug={typeof slug === "string" ? slug : undefined}
      title={typeof title === "string" ? title : undefined}
      subtitle={typeof subtitle === "string" ? subtitle : undefined}
      subcategoriesParam={
        typeof subcategories === "string"
          ? subcategories
          : Array.isArray(subcategories)
            ? subcategories[0]
            : undefined
      }
    />
  );
};

export default CategoryDetailScreen;
