import { useCatalogProducts } from "@/hooks/useCatalog";

/** New arrivals stay featured on the home screen for one week after creation. */
export const NEW_PRODUCTS_MAX_AGE_DAYS = 7;

export function useNewProducts() {
  return useCatalogProducts({ maxAgeDays: NEW_PRODUCTS_MAX_AGE_DAYS });
}
