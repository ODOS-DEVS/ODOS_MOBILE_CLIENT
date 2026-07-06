import { API_BASE_URL } from "@/constants/auth";
import { resolveCatalogImage } from "@/constants/catalogImages";
import {
  appendImageToFormData,
  resolveApiMediaUrl,
} from "@/utils/media";
import type {
  ManagedStoreProfile,
  ManagedStoreUpdateInput,
  VendorOrder,
  VendorOrderStatus,
  VendorProduct,
  VendorProductInput,
  VendorReturnRequest,
} from "@/types/store";
import type { VendorSessionContext } from "@/types/vendor";

type StoreProfileApi = {
  id: string;
  vendor_id?: string;
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  market_id?: string | null;
  location?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  tiktok_url?: string | null;
  twitter_url?: string | null;
  whatsapp_url?: string | null;
  website_url?: string | null;
  region?: string;
  city?: string;
  banner_image_url?: string | null;
  logo_image_url?: string | null;
  audience_slugs?: string[] | null;
  status?: string;
};

type VendorProductApi = {
  id: string;
  store_id?: string;
  vendor_id?: string;
  name?: string;
  description?: string;
  category?: string;
  category_slug?: string | null;
  subcategory?: string | null;
  price?: number;
  old_price?: number | null;
  discount?: string | null;
  stock?: number;
  image_key?: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
  placement_tags?: string[] | null;
  color_options?: string[] | null;
  size_options?: string[] | null;
  specifications?: string[] | null;
  is_returnable?: boolean | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

type VendorOrderApi = {
  id: string;
  order_number?: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  delivery_method?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_region?: string | null;
  payment_label?: string | null;
  product_count?: number;
  total_amount?: number;
  gross_amount?: number | null;
  commission_amount?: number | null;
  net_amount?: number | null;
  is_settled?: boolean;
  currency?: string;
  status?: VendorOrderStatus;
  placed_at?: string | null;
  paid_at?: string | null;
  created_at?: string;
  items?: Array<{
    id: string;
    product_id?: string;
    title?: string;
    quantity?: number;
    unit_price?: number;
    image_url?: string | null;
  }>;
};

type VendorReturnRequestApi = {
  id: string;
  order_id?: string;
  order_number?: string;
  order_item_id?: string;
  product_id?: string;
  product_title?: string;
  product_image_url?: string | null;
  customer_name?: string | null;
  request_type?: string;
  status?: string;
  quantity?: number;
  reason?: string;
  details?: string | null;
  evidence_image_urls?: string[] | null;
  admin_note?: string | null;
  refund_amount?: number | null;
  created_at?: string;
  updated_at?: string;
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

function mapStore(payload: StoreProfileApi): ManagedStoreProfile {
  return {
    id: payload.id,
    vendorId: payload.vendor_id ?? "",
    name: payload.name ?? "",
    slug: payload.slug ?? "",
    description: payload.description ?? "",
    category: payload.category ?? "",
    marketId: payload.market_id ?? undefined,
    location: payload.location ?? undefined,
    phone: payload.phone ?? undefined,
    latitude: payload.latitude ?? undefined,
    longitude: payload.longitude ?? undefined,
    instagramUrl: payload.instagram_url ?? undefined,
    facebookUrl: payload.facebook_url ?? undefined,
    tiktokUrl: payload.tiktok_url ?? undefined,
    twitterUrl: payload.twitter_url ?? undefined,
    whatsappUrl: payload.whatsapp_url ?? undefined,
    websiteUrl: payload.website_url ?? undefined,
    region: payload.region ?? "",
    city: payload.city ?? "",
    bannerImage: payload.banner_image_url ?? undefined,
    logoImage: payload.logo_image_url ?? undefined,
    audienceSlugs: payload.audience_slugs ?? undefined,
    status: (payload.status as ManagedStoreProfile["status"]) ?? "draft",
  };
}

function mapProduct(payload: VendorProductApi): VendorProduct {
  const imageUrls =
    payload.image_urls?.map((value) => resolveApiMediaUrl(value) ?? value) ?? undefined;
  const primaryImageUrl = resolveApiMediaUrl(payload.image_url) ?? imageUrls?.[0];
  return {
    id: payload.id,
    storeId: payload.store_id ?? "",
    vendorId: payload.vendor_id ?? "",
    name: payload.name ?? "",
    description: payload.description ?? "",
    category: payload.category ?? "",
    categorySlug: payload.category_slug ?? undefined,
    subcategory: payload.subcategory ?? undefined,
    price: payload.price ?? 0,
    oldPrice: payload.old_price ?? undefined,
    discount: payload.discount ?? undefined,
    stock: payload.stock ?? 0,
    imageKey: payload.image_key ?? undefined,
    imageUrl: primaryImageUrl,
    imageUrls,
    placementTags: payload.placement_tags ?? undefined,
    colorOptions: payload.color_options ?? undefined,
    sizeOptions: payload.size_options ?? undefined,
    specifications: payload.specifications ?? undefined,
    isReturnable: payload.is_returnable ?? true,
    image: primaryImageUrl
      ? { uri: primaryImageUrl }
      : resolveCatalogImage(payload.image_key),
    status: (payload.status as VendorProduct["status"]) ?? "draft",
    createdAt: payload.created_at ?? new Date().toISOString(),
    updatedAt: payload.updated_at ?? new Date().toISOString(),
  };
}

function mapOrder(payload: VendorOrderApi): VendorOrder {
  return {
    id: payload.id,
    orderNumber: payload.order_number ?? "OD-000000",
    customerName: payload.customer_name ?? undefined,
    customerPhone: payload.customer_phone ?? undefined,
    deliveryMethod: payload.delivery_method ?? undefined,
    addressStreet: payload.address_street ?? undefined,
    addressCity: payload.address_city ?? undefined,
    addressRegion: payload.address_region ?? undefined,
    paymentLabel: payload.payment_label ?? undefined,
    productCount:
      payload.product_count ??
      payload.items?.reduce((count, item) => count + (item.quantity ?? 0), 0) ??
      0,
    totalAmount: payload.total_amount ?? 0,
    grossAmount: payload.gross_amount ?? undefined,
    commissionAmount: payload.commission_amount ?? undefined,
    netAmount: payload.net_amount ?? undefined,
    isSettled: payload.is_settled ?? false,
    currency: payload.currency ?? "GHS",
    status: payload.status ?? "pending",
    placedAt: payload.placed_at ?? undefined,
    paidAt: payload.paid_at ?? undefined,
    createdAt: payload.created_at ?? new Date().toISOString(),
    items:
      payload.items?.map((item) => ({
        id: item.id,
        productId: item.product_id ?? "",
        title: item.title ?? "Product",
        quantity: item.quantity ?? 0,
        unitPrice: item.unit_price ?? 0,
        imageUrl: resolveApiMediaUrl(item.image_url) ?? item.image_url ?? undefined,
      })) ?? [],
  };
}

export function mapRealtimeVendorOrderPayload(
  payload: Record<string, unknown>,
): VendorOrder {
  return mapOrder(payload as VendorOrderApi);
}

export async function fetchVendorStore(session: VendorSessionContext) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/store`, {
    headers: buildHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<StoreProfileApi>(response);
  return payload ? mapStore(payload) : null;
}

export async function updateVendorStore(
  session: VendorSessionContext,
  input: ManagedStoreUpdateInput,
) {
  const accessToken = requireAccessToken(session);
  const formData = new FormData();
  formData.append("name", input.name);
  formData.append("description", input.description);
  formData.append("category", input.category);
  formData.append("region", input.region);
  formData.append("city", input.city);
  if (input.marketId?.trim()) {
    formData.append("market_id", input.marketId.trim());
  }
  if (input.location?.trim()) {
    formData.append("location", input.location.trim());
  }
  if (input.phone?.trim()) {
    formData.append("phone", input.phone.trim());
  }
  if (typeof input.latitude === "number" && Number.isFinite(input.latitude)) {
    formData.append("latitude", String(input.latitude));
  }
  if (typeof input.longitude === "number" && Number.isFinite(input.longitude)) {
    formData.append("longitude", String(input.longitude));
  }
  formData.append("instagram_url", input.instagramUrl?.trim() ?? "");
  formData.append("facebook_url", input.facebookUrl?.trim() ?? "");
  formData.append("tiktok_url", input.tiktokUrl?.trim() ?? "");
  formData.append("twitter_url", input.twitterUrl?.trim() ?? "");
  formData.append("whatsapp_url", input.whatsappUrl?.trim() ?? "");
  formData.append("website_url", input.websiteUrl?.trim() ?? "");
  if (input.audienceSlugs?.length) {
    formData.append("audience_slugs", input.audienceSlugs.join(", "));
  }
  appendImageToFormData(formData, "logo_image", input.logoImage, "store-logo");
  appendImageToFormData(formData, "banner_image", input.bannerImage, "store-banner");

  const response = await fetch(`${API_BASE_URL}/vendor/store`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<StoreProfileApi>(response);
  if (!payload) {
    throw new Error("The store update response was empty.");
  }
  return mapStore(payload);
}

export async function fetchVendorProducts(session: VendorSessionContext) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/products`, {
    headers: buildHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorProductApi[]>(response);
  return payload?.map(mapProduct) ?? [];
}

export async function createVendorProduct(
  session: VendorSessionContext,
  input: VendorProductInput,
) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: (() => {
      const formData = new FormData();
      formData.append("name", input.name);
      formData.append("description", input.description);
      formData.append("category", input.category);
      if (input.categorySlug?.trim()) {
        formData.append("category_slug", input.categorySlug.trim());
      }
      formData.append("price", String(input.price));
      if (typeof input.oldPrice === "number" && Number.isFinite(input.oldPrice)) {
        formData.append("old_price", String(input.oldPrice));
      }
      formData.append("stock", String(input.stock));
      if (input.subcategory?.trim()) {
        formData.append("subcategory", input.subcategory.trim());
      }
      if (input.imageKey?.trim()) {
        formData.append("image_key", input.imageKey.trim());
      }
      if (input.imageUrl?.trim()) {
        formData.append("image_url", input.imageUrl.trim());
      }
      if (input.placementTags?.length) {
        formData.append("placement_tags", input.placementTags.join(", "));
      }
      if (input.colorOptions?.length) {
        formData.append("color_options", input.colorOptions.join(", "));
      }
      if (input.sizeOptions?.length) {
        formData.append("size_options", input.sizeOptions.join(", "));
      }
      if (input.specifications?.length) {
        formData.append("specifications", input.specifications.join("\n"));
      }
      formData.append("is_returnable", String(input.isReturnable ?? true));
      for (const [index, uri] of (input.imageUris ?? []).entries()) {
        appendImageToFormData(formData, "images", uri, `product-image-${index + 1}`);
      }
      return formData;
    })(),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorProductApi>(response);
  if (!payload) {
    throw new Error("The product creation response was empty.");
  }
  return mapProduct(payload);
}

export async function updateVendorProduct(
  session: VendorSessionContext,
  productId: string,
  input: VendorProductInput,
) {
  const accessToken = requireAccessToken(session);
  const formData = new FormData();
  formData.append("name", input.name);
  formData.append("description", input.description);
  formData.append("category", input.category);
  if (input.categorySlug?.trim()) {
    formData.append("category_slug", input.categorySlug.trim());
  }
  formData.append(
    "price",
    String(input.price),
  );
  formData.append(
    "old_price",
    typeof input.oldPrice === "number" && Number.isFinite(input.oldPrice)
      ? String(input.oldPrice)
      : "",
  );
  formData.append("stock", String(input.stock));
  formData.append("subcategory", input.subcategory?.trim() ?? "");
  formData.append("image_key", input.imageKey?.trim() ?? "");
  formData.append("image_url", input.imageUrl?.trim() ?? "");
  formData.append("placement_tags", input.placementTags?.join(", ") ?? "");
  formData.append("color_options", input.colorOptions?.join(", ") ?? "");
  formData.append("size_options", input.sizeOptions?.join(", ") ?? "");
  formData.append("specifications", input.specifications?.join("\n") ?? "");
  formData.append("is_returnable", String(input.isReturnable ?? true));

  const retainedRemoteUrls = (input.imageUris ?? []).filter(
    (value) => !value.startsWith("file://") && !value.startsWith("content://") && !value.startsWith("ph://"),
  );
  formData.append("image_urls", retainedRemoteUrls.join("\n"));

  for (const [index, uri] of (input.imageUris ?? []).entries()) {
    appendImageToFormData(formData, "images", uri, `product-image-${index + 1}`);
  }

  const response = await fetch(`${API_BASE_URL}/vendor/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorProductApi>(response);
  if (!payload) {
    throw new Error("The product update response was empty.");
  }
  return mapProduct(payload);
}

export async function fetchVendorOrders(session: VendorSessionContext) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/orders`, {
    headers: buildHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorOrderApi[]>(response);
  return payload?.map(mapOrder) ?? [];
}

export async function updateVendorOrderStatus(
  session: VendorSessionContext,
  orderId: string,
  status: VendorOrderStatus,
) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(
    `${API_BASE_URL}/vendor/orders/${encodeURIComponent(orderId)}/status`,
    {
      method: "PATCH",
      headers: buildHeaders(accessToken),
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorOrderApi>(response);
  if (!payload) {
    throw new Error("The order update response was empty.");
  }
  return mapOrder(payload);
}

export async function fetchVendorOrder(session: VendorSessionContext, orderId: string) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(
    `${API_BASE_URL}/vendor/orders/${encodeURIComponent(orderId)}`,
    {
      headers: buildHeaders(accessToken),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorOrderApi>(response);
  if (!payload) {
    throw new Error("That order could not be loaded.");
  }
  return mapOrder(payload);
}

export async function acknowledgeVendorOrderApi(
  session: VendorSessionContext,
  orderId: string,
) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(
    `${API_BASE_URL}/vendor/orders/${encodeURIComponent(orderId)}/acknowledge`,
    {
      method: "POST",
      headers: buildHeaders(accessToken),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorOrderApi>(response);
  if (!payload) {
    throw new Error("That order could not be acknowledged.");
  }
  return mapOrder(payload);
}

export async function deleteVendorProduct(session: VendorSessionContext, productId: string) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(
    `${API_BASE_URL}/vendor/products/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
      headers: buildHeaders(accessToken),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function updateVendorProductStatus(
  session: VendorSessionContext,
  productId: string,
  status: "active" | "hidden",
) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(
    `${API_BASE_URL}/vendor/products/${encodeURIComponent(productId)}/status`,
    {
      method: "PATCH",
      headers: buildHeaders(accessToken),
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorProductApi>(response);
  if (!payload) {
    throw new Error("The product status response was empty.");
  }
  return mapProduct(payload);
}

export async function patchVendorProductStock(
  session: VendorSessionContext,
  productId: string,
  stock: number,
) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(
    `${API_BASE_URL}/vendor/products/${encodeURIComponent(productId)}/stock`,
    {
      method: "PATCH",
      headers: buildHeaders(accessToken),
      body: JSON.stringify({ stock }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorProductApi>(response);
  if (!payload) {
    throw new Error("The stock update response was empty.");
  }
  return mapProduct(payload);
}

function mapReturnRequest(payload: VendorReturnRequestApi): VendorReturnRequest {
  return {
    id: payload.id,
    orderId: payload.order_id ?? "",
    orderNumber: payload.order_number ?? "OD-000000",
    orderItemId: payload.order_item_id ?? "",
    productId: payload.product_id ?? "",
    productTitle: payload.product_title ?? "Product",
    productImageUrl: resolveApiMediaUrl(payload.product_image_url) ?? payload.product_image_url,
    customerName: payload.customer_name ?? undefined,
    requestType: payload.request_type ?? "return",
    status: payload.status ?? "requested",
    quantity: payload.quantity ?? 1,
    reason: payload.reason ?? "",
    details: payload.details ?? undefined,
    evidenceImageUrls: payload.evidence_image_urls ?? undefined,
    adminNote: payload.admin_note ?? undefined,
    refundAmount: payload.refund_amount ?? undefined,
    createdAt: payload.created_at ?? new Date().toISOString(),
    updatedAt: payload.updated_at ?? new Date().toISOString(),
  };
}

export async function fetchVendorReturns(session: VendorSessionContext) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/returns`, {
    headers: buildHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorReturnRequestApi[]>(response);
  return payload?.map(mapReturnRequest) ?? [];
}

export async function fetchVendorReturn(
  session: VendorSessionContext,
  returnRequestId: string,
) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(
    `${API_BASE_URL}/vendor/returns/${encodeURIComponent(returnRequestId)}`,
    {
      headers: buildHeaders(accessToken),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseResponse<VendorReturnRequestApi>(response);
  if (!payload) {
    throw new Error("That return request could not be loaded.");
  }
  return mapReturnRequest(payload);
}
