import type { CatalogCategoryItem } from "@/hooks/useCatalog";
import { normalizeCatalogSlug } from "@/utils/catalogTaxonomy";
import type { ImageSourcePropType } from "react-native";

export type CatalogDepartmentLane = {
  slug: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
};

export const CATALOG_DEPARTMENT_LANES: CatalogDepartmentLane[] = [
  {
    slug: "gents",
    title: "Gents",
    subtitle: "Men's style, footwear & essentials",
    image: require("@/assets/images/gents.png"),
  },
  {
    slug: "ladies",
    title: "Ladies",
    subtitle: "Women's fashion, beauty & more",
    image: require("@/assets/images/ladiesstore.png"),
  },
  {
    slug: "kids",
    title: "Kids",
    subtitle: "Kids clothing, shoes & accessories",
    image: require("@/assets/images/sports.png"),
  },
];

const DEPARTMENT_SLUGS = new Set(CATALOG_DEPARTMENT_LANES.map((lane) => lane.slug));

export function isCatalogDepartmentSlug(slug?: string | null) {
  if (!slug) {
    return false;
  }
  return DEPARTMENT_SLUGS.has(normalizeCatalogSlug(slug));
}

export function partitionCatalogCategories(categories: CatalogCategoryItem[]) {
  const bySlug = new Map(
    categories.map((category) => [normalizeCatalogSlug(category.slug), category]),
  );

  const departments = CATALOG_DEPARTMENT_LANES.map((lane) => {
    const match = bySlug.get(lane.slug);
    return {
      lane,
      category: match,
    };
  });

  const collections = categories.filter(
    (category) => !DEPARTMENT_SLUGS.has(normalizeCatalogSlug(category.slug)),
  );

  return { departments, collections };
}

export function buildCategoryRouteParams(
  category: Pick<CatalogCategoryItem, "slug" | "title" | "subtitle" | "subcategories">,
) {
  return {
    slug: category.slug,
    title: category.title,
    subtitle: category.subtitle,
    subcategories: JSON.stringify(category.subcategories ?? []),
  };
}
