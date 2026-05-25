import { CategoryBrowseScreen } from "@/components/category/CategoryBrowseScreen";
import { buildCategoryRouteParams } from "@/utils/catalogLanes";
import { useCatalogCategories } from "@/hooks/useCatalog";
import React, { useMemo } from "react";

/** Legacy route — unified with dynamic category browsing. */
export default function LadiesScreen() {
  const { categories } = useCatalogCategories();
  const category = useMemo(
    () => categories.find((entry) => entry.slug === "ladies"),
    [categories],
  );

  const params = category
    ? buildCategoryRouteParams(category)
    : {
        slug: "ladies",
        title: "Ladies",
        subtitle: "Women's fashion, beauty & more",
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
