import type { VendorProductPerformance } from "@/services/storeService";
import type { VendorProduct } from "@/types/store";
import {
  getVendorStockSignal,
  VENDOR_STOCK_URGENCY_LABELS,
} from "@/utils/vendorInventoryIntelligence";

/**
 * Stock as a spreadsheet.
 *
 * Vendors reconcile against something outside the app — a physical count, a
 * supplier invoice, a bookkeeper. That work happens in Excel or Sheets, and
 * without an export the only way to get numbers there was to retype them off
 * a phone screen, which is where the counts start disagreeing.
 *
 * The export carries the derived columns too (cover, suggested reorder), not
 * just the raw stock, because those are the figures a vendor builds a purchase
 * order from and they cannot be recomputed in a spreadsheet without the sales
 * history the app already fetched.
 */

/** Wraps a value so commas, quotes and newlines inside it cannot break the row. */
function toCsvCell(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

const COLUMNS = [
  "Product",
  "Category",
  "Price",
  "On hand",
  "Reserved",
  "Free",
  "Stock value",
  "Units sold",
  "Gross sales",
  "Days of cover",
  "Suggested reorder",
  "Status",
  "Signal",
] as const;

export function buildVendorStockCsv(
  products: VendorProduct[],
  performance: Record<string, VendorProductPerformance>,
  windowDays: number,
  now = Date.now(),
) {
  const rows: string[] = [COLUMNS.join(",")];

  for (const product of products) {
    const signal = getVendorStockSignal(product, performance[product.id], windowDays, now);
    const reserved = product.reservedStock ?? 0;

    rows.push(
      [
        toCsvCell(product.name),
        toCsvCell(product.category || "Uncategorised"),
        toCsvCell(product.price.toFixed(2)),
        toCsvCell(product.stock),
        toCsvCell(reserved),
        toCsvCell(signal.freeStock),
        toCsvCell((product.price * Math.max(0, product.stock)).toFixed(2)),
        toCsvCell(signal.unitsSold),
        toCsvCell(signal.grossSales.toFixed(2)),
        // Blank rather than "Infinity" for a line with no sales: an empty cell
        // sorts and filters sanely in a spreadsheet, a sentinel does not.
        toCsvCell(signal.daysOfCover === null ? "" : Math.round(signal.daysOfCover)),
        toCsvCell(signal.suggestedReorder || ""),
        toCsvCell(product.status),
        toCsvCell(VENDOR_STOCK_URGENCY_LABELS[signal.urgency]),
      ].join(","),
    );
  }

  return rows.join("\n");
}

/** `odos-stock-2026-10-21.csv` — sorts chronologically in a downloads folder. */
export function buildVendorStockCsvFilename(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `odos-stock-${year}-${month}-${day}.csv`;
}
