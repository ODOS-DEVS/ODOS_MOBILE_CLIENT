import type { VendorProductPerformance } from "@/services/storeService";
import type { VendorProduct } from "@/types/store";

/**
 * Turns "how much stock?" into "when do I reorder?".
 *
 * A bare on-hand count cannot answer the question a vendor actually has.
 * Twelve units is three days of trading on a fast line and a year of dead
 * capital on a slow one, so every signal here is stock *divided by how fast
 * it actually sells* — which is what the per-SKU performance endpoint exists
 * to provide.
 */

/** Below this many days of remaining cover, restocking is already late. */
export const REORDER_NOW_DAYS = 7;
/** Below this, it is time to place the order rather than watch it. */
export const REORDER_SOON_DAYS = 14;
/**
 * A product younger than this is never called dead.
 *
 * Without this, every listing added yesterday reports as dead stock — zero
 * sales is the expected state for a new product, not a diagnosis.
 */
export const DEAD_STOCK_MIN_AGE_DAYS = 14;

export type VendorStockUrgency =
  | "reorder_now"
  | "reorder_soon"
  | "healthy"
  | "dead"
  | "new";

export type VendorStockSignal = {
  urgency: VendorStockUrgency;
  /** Trading days of stock left at the current rate; null when nothing sells. */
  daysOfCover: number | null;
  /** Units per day over the performance window. */
  dailyVelocity: number;
  unitsSold: number;
  grossSales: number;
  /** On-hand units not already promised to open orders. */
  freeStock: number;
  /** Suggested reorder quantity to reach `REORDER_SOON_DAYS` of cover. */
  suggestedReorder: number;
};

function ageInDays(isoDate: string | undefined, now: number) {
  if (!isoDate) {
    return Number.POSITIVE_INFINITY;
  }
  const created = new Date(isoDate).getTime();
  if (!Number.isFinite(created)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, (now - created) / 86_400_000);
}

export function getVendorStockSignal(
  product: VendorProduct,
  performance: VendorProductPerformance | undefined,
  windowDays: number,
  now = Date.now(),
): VendorStockSignal {
  const unitsSold = performance?.unitsSold ?? 0;
  const grossSales = performance?.grossSales ?? 0;
  const safeWindow = Math.max(1, windowDays);
  const dailyVelocity = unitsSold / safeWindow;
  const reserved = product.reservedStock ?? 0;
  const freeStock = Math.max(0, product.stock - reserved);

  // Cover is measured on free stock: units already committed to open orders
  // cannot be sold again, so counting them would overstate the runway.
  const daysOfCover = dailyVelocity > 0 ? freeStock / dailyVelocity : null;

  const suggestedReorder =
    dailyVelocity > 0
      ? Math.max(0, Math.ceil(dailyVelocity * REORDER_SOON_DAYS - freeStock))
      : 0;

  let urgency: VendorStockUrgency;
  if (dailyVelocity > 0) {
    urgency =
      (daysOfCover ?? 0) < REORDER_NOW_DAYS
        ? "reorder_now"
        : (daysOfCover ?? 0) < REORDER_SOON_DAYS
          ? "reorder_soon"
          : "healthy";
  } else if (ageInDays(product.createdAt, now) < DEAD_STOCK_MIN_AGE_DAYS) {
    urgency = "new";
  } else if (product.stock > 0) {
    urgency = "dead";
  } else {
    // Nothing sold and nothing on hand: not dead capital, just inactive.
    urgency = "new";
  }

  return {
    urgency,
    daysOfCover,
    dailyVelocity,
    unitsSold,
    grossSales,
    freeStock,
    suggestedReorder,
  };
}

export const VENDOR_STOCK_URGENCY_LABELS: Record<VendorStockUrgency, string> = {
  reorder_now: "Reorder now",
  reorder_soon: "Reorder soon",
  healthy: "Healthy",
  dead: "Not selling",
  new: "No sales yet",
};

/** Maps an urgency onto the row dot tones the vendor lists already use. */
export function getVendorStockTone(
  urgency: VendorStockUrgency,
): "live" | "warn" | "danger" | "muted" {
  switch (urgency) {
    case "reorder_now":
      return "danger";
    case "reorder_soon":
      return "warn";
    case "healthy":
      return "live";
    default:
      return "muted";
  }
}

/** "8d cover", "2d cover", "—" — short enough to sit inside a row. */
export function formatDaysOfCover(daysOfCover: number | null) {
  if (daysOfCover === null) {
    return "No sales";
  }
  if (daysOfCover < 1) {
    return "<1d cover";
  }
  if (daysOfCover >= 365) {
    return "1y+ cover";
  }
  return `${Math.round(daysOfCover)}d cover`;
}

export type VendorInventorySummary = {
  /** Retail value of everything on hand. */
  stockValue: number;
  unitsOnHand: number;
  reorderNow: number;
  reorderSoon: number;
  deadCount: number;
  /** Capital tied up in stock that is not selling. */
  deadValue: number;
  outOfStock: number;
};

export function summarizeVendorInventory(
  products: VendorProduct[],
  performance: Record<string, VendorProductPerformance>,
  windowDays: number,
  now = Date.now(),
): VendorInventorySummary {
  const summary: VendorInventorySummary = {
    stockValue: 0,
    unitsOnHand: 0,
    reorderNow: 0,
    reorderSoon: 0,
    deadCount: 0,
    deadValue: 0,
    outOfStock: 0,
  };

  for (const product of products) {
    const signal = getVendorStockSignal(product, performance[product.id], windowDays, now);
    const value = product.price * Math.max(0, product.stock);

    summary.stockValue += value;
    summary.unitsOnHand += Math.max(0, product.stock);

    if (product.stock <= 0) {
      summary.outOfStock += 1;
    }
    if (signal.urgency === "reorder_now") {
      summary.reorderNow += 1;
    } else if (signal.urgency === "reorder_soon") {
      summary.reorderSoon += 1;
    } else if (signal.urgency === "dead") {
      summary.deadCount += 1;
      summary.deadValue += value;
    }
  }

  return summary;
}

export type VendorCatalogPerformanceSummary = {
  grossSales: number;
  unitsSold: number;
  /** Products that sold at least one unit in the window. */
  sellingCount: number;
  deadCount: number;
};

export function summarizeVendorCatalogPerformance(
  products: VendorProduct[],
  performance: Record<string, VendorProductPerformance>,
  windowDays: number,
  now = Date.now(),
): VendorCatalogPerformanceSummary {
  const summary: VendorCatalogPerformanceSummary = {
    grossSales: 0,
    unitsSold: 0,
    sellingCount: 0,
    deadCount: 0,
  };

  for (const product of products) {
    const signal = getVendorStockSignal(product, performance[product.id], windowDays, now);
    summary.grossSales += signal.grossSales;
    summary.unitsSold += signal.unitsSold;
    if (signal.unitsSold > 0) {
      summary.sellingCount += 1;
    }
    if (signal.urgency === "dead") {
      summary.deadCount += 1;
    }
  }

  return summary;
}

/**
 * Relative velocity, 0–1, for sizing an in-row bar.
 *
 * Scaled against the best seller on screen rather than an absolute number:
 * "how does this line compare to my strongest one" is the comparison a vendor
 * can actually act on while scanning a list.
 */
export function getVendorVelocityShare(
  unitsSold: number,
  peakUnitsSold: number,
) {
  if (peakUnitsSold <= 0 || unitsSold <= 0) {
    return 0;
  }
  return Math.min(1, unitsSold / peakUnitsSold);
}

export function getVendorPeakUnitsSold(
  products: VendorProduct[],
  performance: Record<string, VendorProductPerformance>,
) {
  let peak = 0;
  for (const product of products) {
    const units = performance[product.id]?.unitsSold ?? 0;
    if (units > peak) {
      peak = units;
    }
  }
  return peak;
}

/** Products a vendor should restock, worst runway first. */
export function sortByRestockUrgency(
  products: VendorProduct[],
  performance: Record<string, VendorProductPerformance>,
  windowDays: number,
  now = Date.now(),
) {
  const rank: Record<VendorStockUrgency, number> = {
    reorder_now: 0,
    reorder_soon: 1,
    dead: 2,
    healthy: 3,
    new: 4,
  };

  return [...products].sort((a, b) => {
    const left = getVendorStockSignal(a, performance[a.id], windowDays, now);
    const right = getVendorStockSignal(b, performance[b.id], windowDays, now);
    if (rank[left.urgency] !== rank[right.urgency]) {
      return rank[left.urgency] - rank[right.urgency];
    }
    // Inside a band, the shorter runway is the more urgent.
    const leftCover = left.daysOfCover ?? Number.POSITIVE_INFINITY;
    const rightCover = right.daysOfCover ?? Number.POSITIVE_INFINITY;
    return leftCover - rightCover;
  });
}
