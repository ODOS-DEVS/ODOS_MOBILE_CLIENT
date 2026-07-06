import type { VendorOrder } from "@/types/store";
import type {
  VendorAnalytics,
  VendorAnalyticsInsights,
  VendorDailySales,
  VendorDashboardStats,
  VendorTopProduct,
} from "@/types/vendor";

const COUNTABLE_ORDER_STATUSES = new Set([
  "confirmed",
  "processing",
  "ready",
  "out_for_delivery",
  "delivered",
]);

const ACTIVE_ORDER_STATUSES = new Set([
  "pending",
  "confirmed",
  "processing",
  "ready",
  "out_for_delivery",
]);

function orderTimestamp(order: VendorOrder) {
  return new Date(order.placedAt || order.createdAt).getTime();
}

function startOfToday() {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value.getTime();
}

function startOfWeek() {
  const value = new Date(startOfToday());
  value.setDate(value.getDate() - 6);
  return value.getTime();
}

function startOfMonth() {
  const value = new Date(startOfToday());
  value.setDate(value.getDate() - 29);
  return value.getTime();
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function sumOrderTotals(orders: VendorOrder[]) {
  return roundMoney(orders.reduce((sum, order) => sum + order.totalAmount, 0));
}

function filterOrdersSince(orders: VendorOrder[], since: number) {
  return orders.filter(
    (order) =>
      COUNTABLE_ORDER_STATUSES.has(order.status) && orderTimestamp(order) >= since,
  );
}

function buildTopProducts(orders: VendorOrder[]): VendorTopProduct[] {
  const monthStart = startOfMonth();
  const grouped = new Map<
    string,
    {
      productId: string;
      productTitle: string;
      productImageUrl?: string | null;
      unitsSold: number;
      grossSales: number;
    }
  >();

  for (const order of orders) {
    if (order.status !== "delivered" || orderTimestamp(order) < monthStart) {
      continue;
    }

    for (const item of order.items) {
      const key = item.productId || item.id;
      const existing = grouped.get(key);
      const lineTotal = item.unitPrice * item.quantity;

      if (existing) {
        existing.unitsSold += item.quantity;
        existing.grossSales += lineTotal;
        continue;
      }

      grouped.set(key, {
        productId: item.productId,
        productTitle: item.title,
        productImageUrl: item.imageUrl,
        unitsSold: item.quantity,
        grossSales: lineTotal,
      });
    }
  }

  return [...grouped.values()]
    .sort((left, right) => right.grossSales - left.grossSales)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      grossSales: roundMoney(item.grossSales),
    }));
}

function buildDailyTrend(orders: VendorOrder[]): VendorDailySales[] {
  const todayStart = startOfToday();
  const days: VendorDailySales[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const dayStart = new Date(todayStart);
    dayStart.setDate(dayStart.getDate() - offset);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayOrders = orders.filter((order) => {
      if (!COUNTABLE_ORDER_STATUSES.has(order.status)) {
        return false;
      }
      const timestamp = orderTimestamp(order);
      return timestamp >= dayStart.getTime() && timestamp < dayEnd.getTime();
    });

    days.push({
      label: dayStart.toLocaleDateString(undefined, { weekday: "short" }),
      sales: sumOrderTotals(dayOrders),
      orders: dayOrders.length,
    });
  }

  return days;
}

export function buildVendorAnalyticsFromOrders(
  orders: VendorOrder[],
  dashboardStats?: VendorDashboardStats | null,
): VendorAnalytics {
  const todayStart = startOfToday();
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();
  const todayOrders = filterOrdersSince(orders, todayStart);
  const weekOrders = filterOrdersSince(orders, weekStart);
  const monthOrders = filterOrdersSince(orders, monthStart);

  return {
    currency: dashboardStats?.currency ?? "GHS",
    todaySales: sumOrderTotals(todayOrders),
    weekSales: sumOrderTotals(weekOrders),
    todayOrders: todayOrders.length,
    weekOrders: weekOrders.length,
    openReturns: 0,
    topProducts: buildTopProducts(orders),
  };
}

export function buildVendorAnalyticsInsights(
  orders: VendorOrder[],
  dashboardStats: VendorDashboardStats | null | undefined,
  analytics: VendorAnalytics,
  usedFallback = false,
): VendorAnalyticsInsights {
  const todayStart = startOfToday();
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();
  const todayOrders = filterOrdersSince(orders, todayStart);
  const weekOrders = filterOrdersSince(orders, weekStart);
  const monthOrders = filterOrdersSince(orders, monthStart);

  const pending =
    dashboardStats?.pendingOrders ??
    orders.filter((order) => ACTIVE_ORDER_STATUSES.has(order.status)).length;
  const delivered =
    dashboardStats?.completedOrders ??
    orders.filter((order) => order.status === "delivered").length;
  const cancelled = orders.filter((order) => order.status === "cancelled").length;
  const closedOrders = delivered + cancelled;
  const fulfillmentRate =
    closedOrders > 0 ? Math.round((delivered / closedOrders) * 100) : delivered > 0 ? 100 : 0;

  const weekSales = analytics.weekSales || sumOrderTotals(weekOrders);
  const weekOrderCount = analytics.weekOrders || weekOrders.length;

  return {
    currency: analytics.currency || dashboardStats?.currency || "GHS",
    usedFallback,
    period: {
      today: {
        sales: analytics.todaySales || sumOrderTotals(todayOrders),
        orders: analytics.todayOrders || todayOrders.length,
      },
      week: {
        sales: weekSales,
        orders: weekOrderCount,
        avgOrderValue:
          weekOrderCount > 0 ? roundMoney(weekSales / weekOrderCount) : 0,
        dailyAverage: roundMoney(weekSales / 7),
      },
      month: {
        sales: sumOrderTotals(monthOrders),
        orders: monthOrders.length,
      },
    },
    operations: {
      pending,
      delivered,
      cancelled,
      fulfillmentRate,
      openReturns: analytics.openReturns,
    },
    finance: {
      availableBalance: dashboardStats?.availableBalance ?? 0,
      lifetimeEarnings: dashboardStats?.lifetimeEarnings ?? 0,
      totalSales: dashboardStats?.totalSales ?? sumOrderTotals(weekOrders),
    },
    catalog: {
      totalProducts: dashboardStats?.totalProducts ?? 0,
      activeProducts: dashboardStats?.activeProducts ?? 0,
    },
    topProducts:
      analytics.topProducts.length > 0
        ? analytics.topProducts
        : buildTopProducts(orders),
    dailyTrend: buildDailyTrend(orders),
  };
}

export function buildVendorDashboardStatsFallback(
  orders: VendorOrder[],
  storeName?: string | null,
): VendorDashboardStats {
  const pendingOrders = orders.filter((order) =>
    ACTIVE_ORDER_STATUSES.has(order.status),
  ).length;
  const completedOrders = orders.filter((order) => order.status === "delivered").length;
  const totalSales = orders
    .filter((order) => COUNTABLE_ORDER_STATUSES.has(order.status))
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    storeName: storeName?.trim() || "My store",
    vendorStatus: "approved",
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders,
    completedOrders,
    totalSales: roundMoney(totalSales),
    currency: "GHS",
    availableBalance: 0,
    pendingWithdrawalBalance: 0,
    lifetimeEarnings: 0,
    totalCommission: 0,
  };
}

export function mergeVendorAnalytics(
  remote: VendorAnalytics | null,
  local: VendorAnalytics,
): VendorAnalytics {
  if (!remote) {
    return local;
  }

  return {
    currency: remote.currency || local.currency,
    todaySales: remote.todaySales ?? local.todaySales,
    weekSales: remote.weekSales ?? local.weekSales,
    todayOrders: remote.todayOrders ?? local.todayOrders,
    weekOrders: remote.weekOrders ?? local.weekOrders,
    openReturns: remote.openReturns ?? local.openReturns,
    topProducts: remote.topProducts.length > 0 ? remote.topProducts : local.topProducts,
  };
}

export function formatCompactCurrency(value: number, currency = "GHS") {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${currency} ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 10_000) {
    return `${currency} ${(value / 1000).toFixed(1)}k`;
  }
  return `${currency} ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
