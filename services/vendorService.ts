import { API_BASE_URL } from "@/constants/auth";
import { parseApiErrorMessage } from "@/services/apiClient";
import { appendImageToFormData } from "@/utils/media";
import type {
  VendorApplication,
  VendorApplicationInput,
  VendorAnalytics,
  VendorCustomer,
  VendorDashboardStats,
  VendorPayoutInstitution,
  VendorPayoutDetailsInput,
  VendorProfile,
  VendorReview,
  VendorSessionContext,
  VendorWallet,
  VendorWalletTransaction,
  VendorWithdrawalInput,
  VendorWithdrawalRequest,
} from "@/types/vendor";

type VendorApplicationApi = {
  id: string;
  user_id?: string;
  status?: string;
  submitted_at?: string;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  business_name?: string;
  business_category?: string;
  business_description?: string;
  phone_number?: string;
  whatsapp_number?: string | null;
  region?: string;
  city?: string;
  market_id?: string | null;
  store_location?: string | null;
  store_latitude?: number | null;
  store_longitude?: number | null;
  store_instagram_url?: string | null;
  store_facebook_url?: string | null;
  store_tiktok_url?: string | null;
  store_twitter_url?: string | null;
  store_whatsapp_url?: string | null;
  store_website_url?: string | null;
  store_name?: string;
  store_description?: string | null;
  ghana_card_number?: string | null;
  business_registration_number?: string | null;
  logo_image_url?: string | null;
  banner_image_url?: string | null;
  shop_image_url?: string | null;
};

type VendorProfileApi = {
  id: string;
  user_id?: string;
  status?: string;
  business_name?: string;
  business_category?: string;
  business_description?: string;
  phone_number?: string;
  whatsapp_number?: string | null;
  created_at?: string;
  store_id?: string | null;
  store_name?: string | null;
  rejection_reason?: string | null;
};

type VendorDashboardApi = {
  store_name?: string;
  vendor_status?: string;
  total_products?: number;
  active_products?: number;
  pending_orders?: number;
  processing_orders?: number;
  completed_orders?: number;
  cancelled_orders?: number;
  total_sales?: number;
  today_sales?: number;
  today_orders?: number;
  low_stock_count?: number;
  out_of_stock_count?: number;
  avg_rating?: number | null;
  review_count?: number;
  customer_count?: number;
  currency?: string;
  available_balance?: number;
  pending_withdrawal_balance?: number;
  lifetime_earnings?: number;
  total_commission?: number;
  active_voucher_count?: number;
  is_on_vacation?: boolean;
};

type VendorReviewApi = {
  id: string;
  product_id?: string;
  product_title?: string;
  product_image_url?: string | null;
  rating?: number;
  comment?: string;
  customer_name?: string | null;
  is_hidden?: boolean;
  created_at?: string;
  vendor_reply?: string | null;
  vendor_replied_at?: string | null;
};

type VendorCustomerApi = {
  customer_key?: string;
  customer_name?: string;
  customer_phone?: string | null;
  order_count?: number;
  total_spent?: number;
  last_order_at?: string | null;
  currency?: string;
};

type VendorAnalyticsApi = {
  currency?: string;
  today_sales?: number;
  week_sales?: number;
  today_orders?: number;
  week_orders?: number;
  open_returns?: number;
  period?: string;
  period_sales?: number;
  period_orders?: number;
  daily_points?: Array<{
    date?: string;
    sales?: number;
    orders?: number;
  }>;
  top_products?: Array<{
    product_id?: string;
    product_title?: string;
    product_image_url?: string | null;
    units_sold?: number;
    gross_sales?: number;
  }>;
};

type VendorWalletTransactionApi = {
  id: string;
  kind?: string;
  title?: string;
  amount?: number;
  gross_amount?: number | null;
  commission_amount?: number | null;
  balance_after?: number;
  order_id?: string | null;
  return_request_id?: string | null;
  withdrawal_request_id?: string | null;
  created_at?: string;
};

type VendorWithdrawalRequestApi = {
  id: string;
  status?: string;
  amount?: number;
  note?: string | null;
  admin_note?: string | null;
  payout_method_type?: string;
  payout_account_name?: string;
  payout_account_number_masked?: string;
  payout_provider?: string | null;
  transfer_failure_reason?: string | null;
  reviewed_by_user_id?: string | null;
  reviewed_by_name?: string | null;
  reviewed_at?: string | null;
  paid_at?: string | null;
  transfer_initiated_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type VendorPayoutInstitutionApi = {
  code: string;
  name: string;
  payout_method_type?: string;
  currency?: string;
};

type VendorWalletApi = {
  id: string;
  vendor_user_id?: string;
  currency?: string;
  available_balance?: number;
  pending_withdrawal_balance?: number;
  lifetime_earnings?: number;
  total_withdrawn?: number;
  total_commission?: number;
  payout_method_type?: string | null;
  payout_account_name?: string | null;
  payout_account_number_masked?: string | null;
  payout_provider?: string | null;
  recent_transactions?: VendorWalletTransactionApi[];
  withdrawal_requests?: VendorWithdrawalRequestApi[];
};

async function parseResponse<T>(response: Response) {
  let payload: T | null = null;
  try {
    payload = (await response.json()) as T;
  } catch {
    payload = null;
  }

  return payload;
}

async function parseErrorMessage(response: Response) {
  return parseApiErrorMessage(response, "We couldn't complete that request.");
}

function buildHeaders(accessToken?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

function mapApplication(
  payload: VendorApplicationApi,
  session: VendorSessionContext,
): VendorApplication {
  return {
    id: payload.id,
    userId: payload.user_id ?? session.userId ?? "",
    status: (payload.status as VendorApplication["status"]) ?? "pending",
    submittedAt: payload.submitted_at ?? new Date().toISOString(),
    reviewedAt: payload.reviewed_at ?? undefined,
    rejectionReason: payload.rejection_reason ?? undefined,
    businessName: payload.business_name ?? "",
    businessCategory: payload.business_category ?? "",
    businessDescription: payload.business_description ?? "",
    phoneNumber: payload.phone_number ?? "",
    whatsappNumber: payload.whatsapp_number ?? undefined,
    region: payload.region ?? "",
    city: payload.city ?? "",
    marketId: payload.market_id ?? undefined,
    storeLocation: payload.store_location ?? undefined,
    storeLatitude: payload.store_latitude ?? undefined,
    storeLongitude: payload.store_longitude ?? undefined,
    storeInstagramUrl: payload.store_instagram_url ?? undefined,
    storeFacebookUrl: payload.store_facebook_url ?? undefined,
    storeTiktokUrl: payload.store_tiktok_url ?? undefined,
    storeTwitterUrl: payload.store_twitter_url ?? undefined,
    storeWhatsappUrl: payload.store_whatsapp_url ?? undefined,
    storeWebsiteUrl: payload.store_website_url ?? undefined,
    storeName: payload.store_name ?? "",
    storeDescription: payload.store_description ?? undefined,
    ghanaCardNumber: payload.ghana_card_number ?? undefined,
    businessRegistrationNumber:
      payload.business_registration_number ?? undefined,
    logoImage: payload.logo_image_url ?? undefined,
    bannerImage: payload.banner_image_url ?? undefined,
    shopImage: payload.shop_image_url ?? undefined,
  };
}

function mapProfile(
  payload: VendorProfileApi,
  session: VendorSessionContext,
): VendorProfile {
  return {
    id: payload.id,
    userId: payload.user_id ?? session.userId ?? "",
    status: (payload.status as VendorProfile["status"]) ?? "pending",
    businessName: payload.business_name ?? "",
    businessCategory: payload.business_category ?? "",
    businessDescription: payload.business_description ?? "",
    phoneNumber: payload.phone_number ?? "",
    whatsappNumber: payload.whatsapp_number ?? undefined,
    createdAt: payload.created_at ?? new Date().toISOString(),
    storeId: payload.store_id ?? undefined,
    storeName: payload.store_name ?? undefined,
    rejectionReason: payload.rejection_reason ?? undefined,
  };
}

function mapDashboard(payload: VendorDashboardApi): VendorDashboardStats {
  return {
    storeName: payload.store_name ?? "Your Store",
    vendorStatus: (payload.vendor_status as VendorDashboardStats["vendorStatus"]) ?? "approved",
    totalProducts: payload.total_products ?? 0,
    activeProducts: payload.active_products ?? 0,
    pendingOrders: payload.pending_orders ?? 0,
    processingOrders: payload.processing_orders ?? 0,
    completedOrders: payload.completed_orders ?? 0,
    cancelledOrders: payload.cancelled_orders ?? 0,
    totalSales: payload.total_sales ?? 0,
    todaySales: payload.today_sales ?? 0,
    todayOrders: payload.today_orders ?? 0,
    lowStockCount: payload.low_stock_count ?? 0,
    outOfStockCount: payload.out_of_stock_count ?? 0,
    avgRating:
      payload.avg_rating === null || payload.avg_rating === undefined
        ? null
        : Number(payload.avg_rating),
    reviewCount: payload.review_count ?? 0,
    customerCount: payload.customer_count ?? 0,
    currency: payload.currency ?? "GHS",
    availableBalance: payload.available_balance ?? 0,
    pendingWithdrawalBalance: payload.pending_withdrawal_balance ?? 0,
    lifetimeEarnings: payload.lifetime_earnings ?? 0,
    totalCommission: payload.total_commission ?? 0,
    activeVoucherCount: payload.active_voucher_count ?? 0,
    isOnVacation: Boolean(payload.is_on_vacation),
  };
}

function toDashboardApi(
  payload: Partial<VendorDashboardApi> & Partial<VendorDashboardStats>,
): VendorDashboardApi {
  return {
    store_name: payload.store_name ?? payload.storeName,
    vendor_status: payload.vendor_status ?? payload.vendorStatus,
    total_products: payload.total_products ?? payload.totalProducts,
    active_products: payload.active_products ?? payload.activeProducts,
    pending_orders: payload.pending_orders ?? payload.pendingOrders,
    processing_orders: payload.processing_orders ?? payload.processingOrders,
    completed_orders: payload.completed_orders ?? payload.completedOrders,
    cancelled_orders: payload.cancelled_orders ?? payload.cancelledOrders,
    total_sales: payload.total_sales ?? payload.totalSales,
    today_sales: payload.today_sales ?? payload.todaySales,
    today_orders: payload.today_orders ?? payload.todayOrders,
    low_stock_count: payload.low_stock_count ?? payload.lowStockCount,
    out_of_stock_count: payload.out_of_stock_count ?? payload.outOfStockCount,
    avg_rating: payload.avg_rating ?? payload.avgRating,
    review_count: payload.review_count ?? payload.reviewCount,
    customer_count: payload.customer_count ?? payload.customerCount,
    currency: payload.currency,
    available_balance: payload.available_balance ?? payload.availableBalance,
    pending_withdrawal_balance:
      payload.pending_withdrawal_balance ?? payload.pendingWithdrawalBalance,
    lifetime_earnings: payload.lifetime_earnings ?? payload.lifetimeEarnings,
    total_commission: payload.total_commission ?? payload.totalCommission,
    active_voucher_count:
      payload.active_voucher_count ?? payload.activeVoucherCount,
    is_on_vacation: payload.is_on_vacation ?? payload.isOnVacation,
  };
}

export function normalizeVendorDashboardStats(
  payload: unknown,
  fallback?: VendorDashboardStats | null,
): VendorDashboardStats | null {
  if (!payload || typeof payload !== "object") {
    return fallback ?? null;
  }

  const mapped = mapDashboard(
    toDashboardApi(payload as Partial<VendorDashboardApi> & Partial<VendorDashboardStats>),
  );

  return fallback ? { ...fallback, ...mapped } : mapped;
}

function mapAnalytics(payload: VendorAnalyticsApi): VendorAnalytics {
  const period =
    payload.period === "7d" || payload.period === "30d" || payload.period === "90d"
      ? payload.period
      : undefined;

  return {
    currency: payload.currency ?? "GHS",
    todaySales: payload.today_sales ?? 0,
    weekSales: payload.week_sales ?? 0,
    todayOrders: payload.today_orders ?? 0,
    weekOrders: payload.week_orders ?? 0,
    openReturns: payload.open_returns ?? 0,
    period,
    periodSales: payload.period_sales ?? undefined,
    periodOrders: payload.period_orders ?? undefined,
    dailyPoints:
      payload.daily_points?.map((point) => ({
        date: point.date ?? "",
        sales: point.sales ?? 0,
        orders: point.orders ?? 0,
      })) ?? [],
    topProducts:
      payload.top_products?.map((item) => ({
        productId: item.product_id ?? "",
        productTitle: item.product_title ?? "Product",
        productImageUrl: item.product_image_url ?? undefined,
        unitsSold: item.units_sold ?? 0,
        grossSales: item.gross_sales ?? 0,
      })) ?? [],
  };
}

function mapWalletTransaction(
  payload: VendorWalletTransactionApi,
): VendorWalletTransaction {
  return {
    id: payload.id,
    kind: payload.kind ?? "wallet_update",
    title: payload.title ?? "Wallet activity",
    amount: payload.amount ?? 0,
    grossAmount: payload.gross_amount ?? null,
    commissionAmount: payload.commission_amount ?? null,
    balanceAfter: payload.balance_after ?? 0,
    orderId: payload.order_id ?? null,
    returnRequestId: payload.return_request_id ?? null,
    withdrawalRequestId: payload.withdrawal_request_id ?? null,
    createdAt: payload.created_at ?? new Date().toISOString(),
  };
}

function mapWithdrawalRequest(
  payload: VendorWithdrawalRequestApi,
): VendorWithdrawalRequest {
  return {
    id: payload.id,
    status: (payload.status as VendorWithdrawalRequest["status"]) ?? "pending",
    amount: payload.amount ?? 0,
    note: payload.note ?? null,
    adminNote: payload.admin_note ?? null,
    payoutMethodType: payload.payout_method_type ?? "mobile_money",
    payoutAccountName: payload.payout_account_name ?? "",
    payoutAccountNumberMasked: payload.payout_account_number_masked ?? "",
    payoutProvider: payload.payout_provider ?? null,
    transferFailureReason: payload.transfer_failure_reason ?? null,
    reviewedByUserId: payload.reviewed_by_user_id ?? null,
    reviewedByName: payload.reviewed_by_name ?? null,
    reviewedAt: payload.reviewed_at ?? null,
    paidAt: payload.paid_at ?? null,
    transferInitiatedAt: payload.transfer_initiated_at ?? null,
    createdAt: payload.created_at ?? new Date().toISOString(),
    updatedAt: payload.updated_at ?? new Date().toISOString(),
  };
}

function mapPayoutInstitution(
  payload: VendorPayoutInstitutionApi,
): VendorPayoutInstitution {
  return {
    code: payload.code,
    name: payload.name,
    payoutMethodType:
      payload.payout_method_type === "bank_transfer"
        ? "bank_transfer"
        : "mobile_money",
    currency: payload.currency ?? "GHS",
  };
}

function mapWallet(
  payload: VendorWalletApi,
  session: VendorSessionContext,
): VendorWallet {
  return {
    id: payload.id,
    vendorUserId: payload.vendor_user_id ?? session.userId ?? "",
    currency: payload.currency ?? "GHS",
    availableBalance: payload.available_balance ?? 0,
    pendingWithdrawalBalance: payload.pending_withdrawal_balance ?? 0,
    lifetimeEarnings: payload.lifetime_earnings ?? 0,
    totalWithdrawn: payload.total_withdrawn ?? 0,
    totalCommission: payload.total_commission ?? 0,
    payoutMethodType: payload.payout_method_type ?? null,
    payoutAccountName: payload.payout_account_name ?? null,
    payoutAccountNumberMasked: payload.payout_account_number_masked ?? null,
    payoutProvider: payload.payout_provider ?? null,
    recentTransactions: (payload.recent_transactions ?? []).map(
      mapWalletTransaction,
    ),
    withdrawalRequests: (payload.withdrawal_requests ?? []).map(
      mapWithdrawalRequest,
    ),
  };
}

function requireUserId(session: VendorSessionContext) {
  if (!session.userId) {
    throw new Error("Please sign in to continue.");
  }
}

function requireAccessToken(session: VendorSessionContext) {
  requireUserId(session);
  if (!session.accessToken) {
    throw new Error("Please sign in to continue.");
  }
  return session.accessToken;
}

export async function fetchMyVendorApplication(session: VendorSessionContext) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/applications/me`, {
    headers: buildHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorApplicationApi>(response);
  return payload ? mapApplication(payload, session) : null;
}

export async function submitVendorApplication(
  session: VendorSessionContext,
  input: VendorApplicationInput,
) {
  const accessToken = requireAccessToken(session);
  const formData = new FormData();
  formData.append("business_name", input.businessName);
  formData.append("business_category", input.businessCategory);
  formData.append("business_description", input.businessDescription);
  formData.append("phone_number", input.phoneNumber);
  formData.append("region", input.region);
  formData.append("city", input.city);
  formData.append("store_name", input.storeName);
  if (input.whatsappNumber?.trim()) {
    formData.append("whatsapp_number", input.whatsappNumber.trim());
  }
  if (input.marketId?.trim()) {
    formData.append("market_id", input.marketId.trim());
  }
  if (input.storeLocation?.trim()) {
    formData.append("store_location", input.storeLocation.trim());
  }
  if (typeof input.storeLatitude === "number" && Number.isFinite(input.storeLatitude)) {
    formData.append("store_latitude", String(input.storeLatitude));
  }
  if (typeof input.storeLongitude === "number" && Number.isFinite(input.storeLongitude)) {
    formData.append("store_longitude", String(input.storeLongitude));
  }
  if (input.storeInstagramUrl?.trim()) {
    formData.append("store_instagram_url", input.storeInstagramUrl.trim());
  }
  if (input.storeFacebookUrl?.trim()) {
    formData.append("store_facebook_url", input.storeFacebookUrl.trim());
  }
  if (input.storeTiktokUrl?.trim()) {
    formData.append("store_tiktok_url", input.storeTiktokUrl.trim());
  }
  if (input.storeTwitterUrl?.trim()) {
    formData.append("store_twitter_url", input.storeTwitterUrl.trim());
  }
  if (input.storeWhatsappUrl?.trim()) {
    formData.append("store_whatsapp_url", input.storeWhatsappUrl.trim());
  }
  if (input.storeWebsiteUrl?.trim()) {
    formData.append("store_website_url", input.storeWebsiteUrl.trim());
  }
  if (input.storeDescription?.trim()) {
    formData.append("store_description", input.storeDescription.trim());
  }
  if (input.ghanaCardNumber?.trim()) {
    formData.append("ghana_card_number", input.ghanaCardNumber.trim());
  }
  if (input.businessRegistrationNumber?.trim()) {
    formData.append(
      "business_registration_number",
      input.businessRegistrationNumber.trim(),
    );
  }
  appendImageToFormData(formData, "logo_image", input.logoImage, "vendor-logo");
  appendImageToFormData(formData, "banner_image", input.bannerImage, "vendor-banner");
  appendImageToFormData(formData, "shop_image", input.shopImage, "vendor-shop");

  const response = await fetch(`${API_BASE_URL}/vendor/applications`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorApplicationApi>(response);
  if (!payload) {
    throw new Error("The vendor application response was empty.");
  }
  return mapApplication(payload, session);
}

export async function fetchVendorProfile(session: VendorSessionContext) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/me`, {
    headers: buildHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorProfileApi>(response);
  return payload ? mapProfile(payload, session) : null;
}

export async function fetchVendorDashboard(session: VendorSessionContext) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/dashboard`, {
    headers: buildHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorDashboardApi>(response);
  return payload ? mapDashboard(payload) : null;
}

export async function fetchVendorReviews(session: VendorSessionContext) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/reviews`, {
    headers: buildHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorReviewApi[]>(response);
  return (payload ?? []).map(
    (item): VendorReview => ({
      id: String(item.id),
      productId: item.product_id ?? "",
      productTitle: item.product_title ?? "Product",
      productImageUrl: item.product_image_url ?? null,
      rating: Number(item.rating ?? 0),
      comment: item.comment ?? "",
      customerName: item.customer_name ?? null,
      isHidden: Boolean(item.is_hidden),
      createdAt: item.created_at ?? new Date().toISOString(),
      vendorReply: item.vendor_reply ?? null,
      vendorRepliedAt: item.vendor_replied_at ?? null,
    }),
  );
}

export async function replyToVendorReview(
  session: VendorSessionContext,
  reviewId: string,
  reply: string,
) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(
    `${API_BASE_URL}/vendor/reviews/${encodeURIComponent(reviewId)}/reply`,
    {
      method: "PATCH",
      headers: {
        ...buildHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const item = await parseResponse<VendorReviewApi>(response);
  if (!item) {
    throw new Error("Empty review reply response.");
  }

  return {
    id: String(item.id),
    productId: item.product_id ?? "",
    productTitle: item.product_title ?? "Product",
    productImageUrl: item.product_image_url ?? null,
    rating: Number(item.rating ?? 0),
    comment: item.comment ?? "",
    customerName: item.customer_name ?? null,
    isHidden: Boolean(item.is_hidden),
    createdAt: item.created_at ?? new Date().toISOString(),
    vendorReply: item.vendor_reply ?? null,
    vendorRepliedAt: item.vendor_replied_at ?? null,
  } satisfies VendorReview;
}

export async function fetchVendorCustomers(session: VendorSessionContext) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/customers`, {
    headers: buildHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorCustomerApi[]>(response);
  return (payload ?? []).map(
    (item): VendorCustomer => ({
      customerKey: item.customer_key ?? item.customer_name ?? "customer",
      customerName: item.customer_name ?? "Customer",
      customerPhone: item.customer_phone ?? null,
      orderCount: item.order_count ?? 0,
      totalSpent: item.total_spent ?? 0,
      lastOrderAt: item.last_order_at ?? null,
      currency: item.currency ?? "GHS",
    }),
  );
}

export async function fetchVendorAnalytics(
  session: VendorSessionContext,
  period: "7d" | "30d" | "90d" = "30d",
) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(
    `${API_BASE_URL}/vendor/analytics?period=${encodeURIComponent(period)}`,
    {
      headers: buildHeaders(accessToken),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorAnalyticsApi>(response);
  if (!payload) {
    throw new Error("The vendor analytics response was empty.");
  }
  return mapAnalytics(payload);
}

export async function fetchVendorWallet(session: VendorSessionContext) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/wallet`, {
    headers: buildHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorWalletApi>(response);
  if (!payload) {
    throw new Error("The vendor wallet response was empty.");
  }
  return mapWallet(payload, session);
}

export async function fetchVendorPayoutInstitutions(
  session: VendorSessionContext,
  payoutMethodType: VendorPayoutDetailsInput["payoutMethodType"],
) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(
    `${API_BASE_URL}/vendor/wallet/payout-institutions?payout_method_type=${encodeURIComponent(
      payoutMethodType,
    )}`,
    {
      headers: buildHeaders(accessToken),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorPayoutInstitutionApi[]>(response);
  return (payload ?? []).map(mapPayoutInstitution);
}

export async function updateVendorPayoutDetails(
  session: VendorSessionContext,
  input: VendorPayoutDetailsInput,
) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/wallet/payout-details`, {
    method: "PATCH",
    headers: buildHeaders(accessToken),
    body: JSON.stringify({
      payout_method_type: input.payoutMethodType,
      payout_account_name: input.payoutAccountName,
      payout_account_number: input.payoutAccountNumber,
      payout_provider: input.payoutProvider.trim(),
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorWalletApi>(response);
  if (!payload) {
    throw new Error("The updated wallet response was empty.");
  }
  return mapWallet(payload, session);
}

export async function createVendorWithdrawal(
  session: VendorSessionContext,
  input: VendorWithdrawalInput,
) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/wallet/withdrawals`, {
    method: "POST",
    headers: buildHeaders(accessToken),
    body: JSON.stringify({
      amount: input.amount,
      note: input.note?.trim() || null,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorWithdrawalRequestApi>(response);
  if (!payload) {
    throw new Error("The withdrawal response was empty.");
  }
  return mapWithdrawalRequest(payload);
}
