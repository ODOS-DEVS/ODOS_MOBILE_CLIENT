import { API_BASE_URL } from "@/constants/auth";
import { resolveCatalogImage } from "@/constants/catalogImages";
import {
  createVendorProductRecord,
  ensureVendorMockState,
  loadVendorMockState,
  saveVendorMockState,
} from "@/services/vendorMock";
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
  status?: string;
  created_at?: string;
  updated_at?: string;
};

type VendorOrderApi = {
  id: string;
  order_number?: string;
  customer_name?: string | null;
  product_count?: number;
  total_amount?: number;
  status?: VendorOrderStatus;
  created_at?: string;
  items?: Array<{
    id: string;
    product_id?: string;
    title?: string;
    quantity?: number;
    unit_price?: number;
  }>;
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

function shouldUseFallback(status: number) {
  return status === 404 || status === 405 || status >= 500;
}

function requireUserId(session: VendorSessionContext) {
  if (!session.userId) {
    throw new Error("Please sign in to continue.");
  }
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
    productCount:
      payload.product_count ??
      payload.items?.reduce((count, item) => count + (item.quantity ?? 0), 0) ??
      0,
    totalAmount: payload.total_amount ?? 0,
    status: payload.status ?? "pending",
    createdAt: payload.created_at ?? new Date().toISOString(),
    items:
      payload.items?.map((item) => ({
        id: item.id,
        productId: item.product_id ?? "",
        title: item.title ?? "Product",
        quantity: item.quantity ?? 0,
        unitPrice: item.unit_price ?? 0,
      })) ?? [],
  };
}

export async function fetchVendorStore(session: VendorSessionContext) {
  requireUserId(session);

  if (session.accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/store`, {
        headers: buildHeaders(session.accessToken),
      });

      if (response.ok) {
        const payload = await parseResponse<StoreProfileApi>(response);
        return payload ? mapStore(payload) : null;
      }

      if (!shouldUseFallback(response.status)) {
        throw new Error(await parseErrorMessage(response));
      }
    } catch {
      // fall back to local vendor state during development
    }
  }

  const mockState = await ensureVendorMockState(session);
  return mockState.store;
}

export async function updateVendorStore(
  session: VendorSessionContext,
  input: ManagedStoreUpdateInput,
) {
  requireUserId(session);

  if (session.accessToken) {
    try {
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
      if (input.audienceSlugs?.length) {
        formData.append("audience_slugs", input.audienceSlugs.join(", "));
      }
      appendImageToFormData(formData, "logo_image", input.logoImage, "store-logo");
      appendImageToFormData(formData, "banner_image", input.bannerImage, "store-banner");

      const response = await fetch(`${API_BASE_URL}/vendor/store`, {
        method: "PATCH",
        headers: session.accessToken
          ? { Authorization: `Bearer ${session.accessToken}` }
          : undefined,
        body: formData,
      });

      if (response.ok) {
        const payload = await parseResponse<StoreProfileApi>(response);
        if (!payload) {
          throw new Error("The store update response was empty.");
        }
        return mapStore(payload);
      }

      if (!shouldUseFallback(response.status)) {
        throw new Error(await parseErrorMessage(response));
      }
    } catch (error) {
      if (error instanceof Error && error.message) {
        throw error;
      }
    }
  }

  const mockState = await ensureVendorMockState(session);
  if (!mockState.store) {
    throw new Error("No managed store is linked to this vendor yet.");
  }

  const nextStore: ManagedStoreProfile = {
    ...mockState.store,
    ...input,
  };

  await saveVendorMockState(session.userId!, {
    ...mockState,
    store: nextStore,
    profile: mockState.profile
      ? {
          ...mockState.profile,
          storeName: nextStore.name,
        }
      : mockState.profile,
  });

  return nextStore;
}

export async function fetchVendorProducts(session: VendorSessionContext) {
  requireUserId(session);

  if (session.accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/products`, {
        headers: buildHeaders(session.accessToken),
      });

      if (response.ok) {
        const payload = await parseResponse<VendorProductApi[]>(response);
        return payload?.map(mapProduct) ?? [];
      }

      if (!shouldUseFallback(response.status)) {
        throw new Error(await parseErrorMessage(response));
      }
    } catch {
      // fall back to local vendor state during development
    }
  }

  const mockState = await ensureVendorMockState(session);
  return mockState.products.map((product) => ({
    ...product,
    image: product.imageUrl
      ? { uri: resolveApiMediaUrl(product.imageUrl)! }
      : resolveCatalogImage(product.imageKey),
  }));
}

export async function createVendorProduct(
  session: VendorSessionContext,
  input: VendorProductInput,
) {
  requireUserId(session);

  if (session.accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/products`, {
        method: "POST",
        headers: session.accessToken
          ? { Authorization: `Bearer ${session.accessToken}` }
          : undefined,
        body: (() => {
          const formData = new FormData();
          formData.append("name", input.name);
          formData.append("description", input.description);
          formData.append("category", input.category);
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
          for (const [index, uri] of (input.imageUris ?? []).entries()) {
            appendImageToFormData(formData, "images", uri, `product-image-${index + 1}`);
          }
          return formData;
        })(),
      });

      if (response.ok) {
        const payload = await parseResponse<VendorProductApi>(response);
        if (!payload) {
          throw new Error("The product creation response was empty.");
        }
        return mapProduct(payload);
      }

      if (!shouldUseFallback(response.status)) {
        throw new Error(await parseErrorMessage(response));
      }
    } catch (error) {
      if (error instanceof Error && error.message) {
        throw error;
      }
    }
  }

  const mockState = await ensureVendorMockState(session);
  if (!mockState.store || !mockState.profile) {
    throw new Error("Your vendor profile needs an approved store before adding products.");
  }

  const nextProduct = {
    ...createVendorProductRecord({
      vendorId: mockState.profile.id,
      storeId: mockState.store.id,
      ...input,
    }),
    image: input.imageUrl
      ? { uri: resolveApiMediaUrl(input.imageUrl)! }
      : input.imageUris?.[0]
        ? { uri: input.imageUris[0] }
      : resolveCatalogImage(input.imageKey),
  };

  await saveVendorMockState(session.userId!, {
    ...mockState,
    products: [nextProduct, ...mockState.products],
  });

  return nextProduct;
}

export async function updateVendorProduct(
  session: VendorSessionContext,
  productId: string,
  input: VendorProductInput,
) {
  requireUserId(session);

  if (session.accessToken) {
    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("description", input.description);
    formData.append("category", input.category);
    formData.append("price", String(input.price));
    formData.append("old_price", typeof input.oldPrice === "number" && Number.isFinite(input.oldPrice) ? String(input.oldPrice) : "");
    formData.append("stock", String(input.stock));
    formData.append("subcategory", input.subcategory?.trim() ?? "");
    formData.append("image_key", input.imageKey?.trim() ?? "");
    formData.append("image_url", input.imageUrl?.trim() ?? "");
    formData.append("placement_tags", input.placementTags?.join(", ") ?? "");
    formData.append("color_options", input.colorOptions?.join(", ") ?? "");
    formData.append("size_options", input.sizeOptions?.join(", ") ?? "");
    formData.append("specifications", input.specifications?.join("\n") ?? "");

    const retainedRemoteUrls = (input.imageUris ?? []).filter(
      (value) => !value.startsWith("file://") && !value.startsWith("content://") && !value.startsWith("ph://"),
    );
    formData.append("image_urls", retainedRemoteUrls.join("\n"));

    for (const [index, uri] of (input.imageUris ?? []).entries()) {
      appendImageToFormData(formData, "images", uri, `product-image-${index + 1}`);
    }

    const response = await fetch(`${API_BASE_URL}/vendor/products/${encodeURIComponent(productId)}`, {
      method: "PATCH",
      headers: session.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : undefined,
      body: formData,
    });

    if (response.ok) {
      const payload = await parseResponse<VendorProductApi>(response);
      if (!payload) {
        throw new Error("The product update response was empty.");
      }
      return mapProduct(payload);
    }

    if (!shouldUseFallback(response.status)) {
      throw new Error(await parseErrorMessage(response));
    }
  }

  const mockState = await ensureVendorMockState(session);
  const existingProduct = mockState.products.find((product) => product.id === productId);
  if (!existingProduct) {
    throw new Error("That vendor product could not be found.");
  }

  const updatedProduct = {
    ...existingProduct,
    ...input,
    imageUrls: input.imageUris?.length ? input.imageUris : existingProduct.imageUrls,
    imageUrl: input.imageUris?.[0] ?? existingProduct.imageUrl,
    image:
      input.imageUris?.[0]
        ? { uri: input.imageUris[0] }
        : existingProduct.imageUrl
          ? { uri: resolveApiMediaUrl(existingProduct.imageUrl)! }
          : resolveCatalogImage(existingProduct.imageKey),
    discount:
      input.oldPrice && input.oldPrice > input.price
        ? `${Math.round(((input.oldPrice - input.price) / input.oldPrice) * 100)}% off`
        : undefined,
    updatedAt: new Date().toISOString(),
  } satisfies VendorProduct;

  await saveVendorMockState(session.userId!, {
    ...mockState,
    products: mockState.products.map((product) =>
      product.id === productId ? updatedProduct : product,
    ),
  });

  return updatedProduct;
}

export async function fetchVendorOrders(session: VendorSessionContext) {
  requireUserId(session);

  if (session.accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/orders`, {
        headers: buildHeaders(session.accessToken),
      });

      if (response.ok) {
        const payload = await parseResponse<VendorOrderApi[]>(response);
        return payload?.map(mapOrder) ?? [];
      }

      if (!shouldUseFallback(response.status)) {
        throw new Error(await parseErrorMessage(response));
      }
    } catch {
      // fall back to local vendor state during development
    }
  }

  const mockState = await ensureVendorMockState(session);
  return mockState.orders;
}

export async function updateVendorOrderStatus(
  session: VendorSessionContext,
  orderId: string,
  status: VendorOrderStatus,
) {
  requireUserId(session);

  if (session.accessToken) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vendor/orders/${encodeURIComponent(orderId)}/status`,
        {
          method: "PATCH",
          headers: buildHeaders(session.accessToken),
          body: JSON.stringify({ status }),
        },
      );

      if (response.ok) {
        const payload = await parseResponse<VendorOrderApi>(response);
        if (!payload) {
          throw new Error("The order update response was empty.");
        }
        return mapOrder(payload);
      }

      if (!shouldUseFallback(response.status)) {
        throw new Error(await parseErrorMessage(response));
      }
    } catch (error) {
      if (error instanceof Error && error.message) {
        throw error;
      }
    }
  }

  const mockState = await ensureVendorMockState(session);
  const nextOrders = mockState.orders.map((order) =>
    order.id === orderId ? { ...order, status } : order,
  );
  const updatedOrder = nextOrders.find((order) => order.id === orderId);

  if (!updatedOrder) {
    throw new Error("We couldn't find that order.");
  }

  await saveVendorMockState(session.userId!, {
    ...mockState,
    orders: nextOrders,
  });

  return updatedOrder;
}
