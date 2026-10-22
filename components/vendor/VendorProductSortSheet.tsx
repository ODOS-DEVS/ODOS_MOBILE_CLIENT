import VendorOptionSheet from "@/components/vendor/VendorOptionSheet";
import React from "react";

/**
 * How the catalog is ordered.
 *
 * This replaces a button that cycled name → stock → price on each tap. Cycling
 * hid two things a vendor needs: which direction the sort runs, and that
 * "recently updated" exists at all — the order you want right after editing a
 * batch of listings. Naming the options outright costs one tap and removes the
 * guesswork.
 */
export type VendorProductSort =
  | "best_selling"
  | "worst_selling"
  | "cover_low"
  | "updated"
  | "name"
  | "stock_low"
  | "stock_high"
  | "price_low"
  | "price_high";

/**
 * Best-selling leads, because it is the ordering a vendor wants most often and
 * the one the catalog could not express at all before per-SKU performance
 * existed — the list could be sorted by what a product *is* but never by how
 * it actually trades.
 */
export const VENDOR_PRODUCT_SORTS: { value: VendorProductSort; label: string }[] = [
  { value: "best_selling", label: "Best selling" },
  { value: "worst_selling", label: "Worst selling" },
  { value: "cover_low", label: "Running out soonest" },
  { value: "updated", label: "Recently updated" },
  { value: "name", label: "Name A–Z" },
  { value: "stock_low", label: "Stock: low to high" },
  { value: "stock_high", label: "Stock: high to low" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
];

export function formatVendorSortLabel(sort: VendorProductSort) {
  return VENDOR_PRODUCT_SORTS.find((option) => option.value === sort)?.label ?? "Sort";
}

export default function VendorProductSortSheet({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: VendorProductSort;
  onSelect: (sort: VendorProductSort) => void;
  onClose: () => void;
}) {
  return (
    <VendorOptionSheet
      visible={visible}
      title="Sort products"
      options={VENDOR_PRODUCT_SORTS}
      selected={selected}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
