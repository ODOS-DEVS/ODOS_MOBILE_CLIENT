import { useCatalogProducts } from "@/hooks/useCatalog";

/**
 * How long a product counts as new.
 *
 * Was one week, which meant the section was hidden almost permanently: ODOS
 * gains products in ones and twos, so most weeks have none and shoppers never
 * saw the row at all. Thirty days keeps it populated without stretching "new"
 * past believable — and the API caps this parameter at 90, so it cannot drift
 * much further by accident.
 */
export const NEW_PRODUCTS_MAX_AGE_DAYS = 30;

export function useNewProducts() {
  return useCatalogProducts({ maxAgeDays: NEW_PRODUCTS_MAX_AGE_DAYS });
}
