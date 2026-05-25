import { CategoryBrowseScreen } from "@/components/category/CategoryBrowseScreen";
import { buildCategoryRouteParams } from "@/utils/catalogLanes";
import { useCatalogCategories } from "@/hooks/useCatalog";
import React, { useMemo } from "react";

/** Legacy route — unified with dynamic category browsing. */
export default function GentsScreen() {
  const { categories } = useCatalogCategories();
  const category = useMemo(
    () => categories.find((entry) => entry.slug === "gents"),
    [categories],
  );

  const params = category
    ? buildCategoryRouteParams(category)
    : {
        slug: "gents",
        title: "Gents",
        subtitle: "Men's style, footwear & essentials",
        subcategories: "[]",
      };

  return (
    <CategoryBrowseScreen
      slug={params.slug}
      title={params.title}
      subtitle={params.subtitle}
      subcategoriesParam={params.subcategories}
    />
  );
}
