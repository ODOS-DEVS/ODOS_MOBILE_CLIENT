import { API_BASE_URL } from "@/constants/auth";
import {
  deriveDashboardStats,
  ensureVendorMockState,
  loadVendorMockState,
  saveVendorMockState,
} from "@/services/vendorMock";
import { appendImageToFormData } from "@/utils/media";
import type {
  VendorApplication,
  VendorApplicationInput,
  VendorDashboardStats,
  VendorProfile,
  VendorSessionContext,
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
  completed_orders?: number;
  total_sales?: number;
  currency?: string;
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
  try {
    const payload = await response.json();
    return typeof payload?.detail === "string"
      ? payload.detail
      : "We couldn't complete that request.";
  } catch {
    return response.statusText || "We couldn't complete that request.";
  }
}

function buildHeaders(accessToken?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
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
    completedOrders: payload.completed_orders ?? 0,
    totalSales: payload.total_sales ?? 0,
    currency: payload.currency ?? "GHS",
  };
}

function requireUserId(session: VendorSessionContext) {
  if (!session.userId) {
    throw new Error("Please sign in to continue.");
  }
}

function shouldUseFallback(status: number) {
  return status === 404 || status === 405 || status === 501;
}

export async function fetchMyVendorApplication(session: VendorSessionContext) {
  requireUserId(session);

  if (session.accessToken) {
    const response = await fetch(`${API_BASE_URL}/vendor/applications/me`, {
      headers: buildHeaders(session.accessToken),
    });

    if (response.ok) {
      const payload = await parseResponse<VendorApplicationApi>(response);
      return payload ? mapApplication(payload, session) : null;
    }

    if (!shouldUseFallback(response.status)) {
      throw new Error(await parseErrorMessage(response));
    }
  }

  const mockState = await ensureVendorMockState(session);
  return mockState.application;
}

export async function submitVendorApplication(
  session: VendorSessionContext,
  input: VendorApplicationInput,
) {
  requireUserId(session);

  if (session.accessToken) {
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
      headers: session.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : undefined,
      body: formData,
    });

    if (response.ok) {
      const payload = await parseResponse<VendorApplicationApi>(response);
      if (!payload) {
        throw new Error("The vendor application response was empty.");
      }
      return mapApplication(payload, session);
    }

    if (!shouldUseFallback(response.status)) {
      throw new Error(await parseErrorMessage(response));
    }
  }

  const mockState = await loadVendorMockState(session.userId!);
  const nextApplication: VendorApplication = {
    id: `vendor-application-${Date.now()}`,
    userId: session.userId!,
    status: "pending",
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    rejectionReason: undefined,
    ...input,
  };

  await saveVendorMockState(session.userId!, {
    ...mockState,
    application: nextApplication,
    profile: null,
  });

  return nextApplication;
}

export async function fetchVendorProfile(session: VendorSessionContext) {
  requireUserId(session);

  if (session.accessToken) {
    const response = await fetch(`${API_BASE_URL}/vendor/me`, {
      headers: buildHeaders(session.accessToken),
    });

    if (response.ok) {
      const payload = await parseResponse<VendorProfileApi>(response);
      return payload ? mapProfile(payload, session) : null;
    }

    if (!shouldUseFallback(response.status)) {
      throw new Error(await parseErrorMessage(response));
    }
  }

  const mockState = await ensureVendorMockState(session);
  return mockState.profile;
}

export async function fetchVendorDashboard(session: VendorSessionContext) {
  requireUserId(session);

  if (session.accessToken) {
    const response = await fetch(`${API_BASE_URL}/vendor/dashboard`, {
      headers: buildHeaders(session.accessToken),
    });

    if (response.ok) {
      const payload = await parseResponse<VendorDashboardApi>(response);
      return payload ? mapDashboard(payload) : null;
    }

    if (!shouldUseFallback(response.status)) {
      throw new Error(await parseErrorMessage(response));
    }
  }

  const mockState = await ensureVendorMockState(session);
  return deriveDashboardStats(
    mockState,
    mockState.profile?.status ?? mockState.application?.status ?? session.vendorStatus ?? "none",
  );
}
