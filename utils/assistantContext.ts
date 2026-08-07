import type { AssistantReferenceContext } from "@/types/assistant";

export function buildStoreAssistantContext(input: {
  storeId?: string | null;
  storeName?: string | null;
  marketTitle?: string | null;
  vendorUserId?: string | null;
  category?: string | null;
}): AssistantReferenceContext | null {
  const storeId = input.storeId?.trim();
  if (!storeId) {
    return null;
  }

  return {
    type: "store",
    store_id: storeId,
    store_name: input.storeName?.trim() || null,
    market_title: input.marketTitle?.trim() || null,
    vendor_user_id: input.vendorUserId?.trim() || null,
    category: input.category?.trim() || null,
  };
}

export function buildProductAssistantContext(input: {
  productId?: string | null;
  productTitle?: string | null;
  storeId?: string | null;
  storeName?: string | null;
  category?: string | null;
}): AssistantReferenceContext | null {
  const productId = input.productId?.trim();
  if (!productId) {
    return null;
  }

  return {
    type: "product",
    product_id: productId,
    product_title: input.productTitle?.trim() || null,
    store_id: input.storeId?.trim() || null,
    store_name: input.storeName?.trim() || null,
    category: input.category?.trim() || null,
  };
}

export function buildCheckoutAssistantContext(): AssistantReferenceContext {
  return { type: "checkout" };
}

export function extractStoreIdFromPath(pathname: string): string | null {
  const match = pathname.match(/\/stores\/([^/?#]+)/i);
  const candidate = match?.[1]?.trim();
  if (!candidate || candidate === "[id]" || candidate === "stores" || candidate === "map") {
    return null;
  }
  return candidate;
}

export function assistantContextToParams(
  context: AssistantReferenceContext | null | undefined,
): Record<string, string> {
  if (!context) {
    return {};
  }

  if (context.type === "checkout") {
    return { contextType: "checkout" };
  }

  if (context.type === "product" && context.product_id) {
    const params: Record<string, string> = { productId: context.product_id };
    if (context.product_title) {
      params.productTitle = context.product_title;
    }
    if (context.store_id) {
      params.storeId = context.store_id;
    }
    if (context.store_name) {
      params.storeName = context.store_name;
    }
    if (context.category) {
      params.category = context.category;
    }
    return params;
  }

  if (!context.store_id) {
    return {};
  }

  const params: Record<string, string> = {
    storeId: context.store_id,
  };
  if (context.store_name) {
    params.storeName = context.store_name;
  }
  if (context.market_title) {
    params.marketTitle = context.market_title;
  }
  if (context.vendor_user_id) {
    params.vendorUserId = context.vendor_user_id;
  }
  if (context.category) {
    params.category = context.category;
  }
  return params;
}

export function assistantContextFromParams(params: {
  storeId?: string | string[];
  storeName?: string | string[];
  marketTitle?: string | string[];
  vendorUserId?: string | string[];
  category?: string | string[];
  productId?: string | string[];
  productTitle?: string | string[];
  contextType?: string | string[];
}): AssistantReferenceContext | null {
  const read = (value?: string | string[]) =>
    typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;

  const productId = read(params.productId);
  if (productId) {
    return buildProductAssistantContext({
      productId,
      productTitle: read(params.productTitle),
      storeId: read(params.storeId),
      storeName: read(params.storeName),
      category: read(params.category),
    });
  }

  if (read(params.contextType) === "checkout") {
    return buildCheckoutAssistantContext();
  }

  return buildStoreAssistantContext({
    storeId: read(params.storeId),
    storeName: read(params.storeName),
    marketTitle: read(params.marketTitle),
    vendorUserId: read(params.vendorUserId),
    category: read(params.category),
  });
}
