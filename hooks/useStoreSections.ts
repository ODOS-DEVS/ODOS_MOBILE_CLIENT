import { API_BASE_URL } from "@/constants/auth";
import {
  mapProduct,
  type CatalogProductItem,
  type ProductApiItem,
} from "@/hooks/useCatalog";
import { useCallback, useEffect, useState } from "react";

export type StoreSectionWithProducts = {
  id: string;
  title: string;
  slug: string;
  sortOrder: number;
  products: CatalogProductItem[];
};

type StoreSectionApi = {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  // The API speaks snake_case; CatalogProductItem is camelCase. Typing this as
  // the latter would compile and then render blank cards, because every field
  // ProductCard reads would be undefined.
  products: ProductApiItem[];
};

/**
 * The shelves a shop arranged for its own page.
 *
 * The server already omits inactive and visibly-empty sections, so whatever
 * comes back is safe to render as-is. A store that has never created a section
 * simply returns an empty list and the page looks exactly as it did before —
 * this is additive, so it must never make an existing store look broken.
 */
export function useStoreSections(storeId: string | undefined) {
  const [sections, setSections] = useState<StoreSectionWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!storeId) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/catalog/stores/${encodeURIComponent(storeId)}/sections`,
      );
      if (!response.ok) {
        // A store page is still perfectly usable without its shelves, so a
        // failure here degrades to "no sections" rather than an error state
        // over content that loaded fine.
        setSections([]);
        return;
      }
      const payload = (await response.json()) as StoreSectionApi[];
      setSections(
        (payload ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          sortOrder: item.sort_order ?? 0,
          products: (item.products ?? []).map(mapProduct),
        })),
      );
    } catch {
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { sections, isLoading, refresh: load };
}
