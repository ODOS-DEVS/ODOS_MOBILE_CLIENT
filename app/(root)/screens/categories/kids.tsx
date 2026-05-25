import { CategoryBrowseScreen } from "@/components/category/CategoryBrowseScreen";
import { buildCategoryRouteParams } from "@/utils/catalogLanes";
import { useCatalogCategories } from "@/hooks/useCatalog";
import React, { useMemo } from "react";

/** Legacy route — unified with dynamic category browsing. */
export default function KidsScreen() {
  const { categories } = useCatalogCategories();
  const category = useMemo(
    () => categories.find((entry) => entry.slug === "kids"),
    [categories],
  );

  const params = category
    ? buildCategoryRouteParams(category)
    : {
        slug: "kids",
        title: "Kids",
        subtitle: "Kids clothing, shoes & accessories",
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
