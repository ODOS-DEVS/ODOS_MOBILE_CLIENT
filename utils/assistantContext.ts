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
  if (!context?.store_id) {
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
}): AssistantReferenceContext | null {
  const read = (value?: string | string[]) =>
    typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;

  return buildStoreAssistantContext({
    storeId: read(params.storeId),
    storeName: read(params.storeName),
    marketTitle: read(params.marketTitle),
    vendorUserId: read(params.vendorUserId),
    category: read(params.category),
  });
}
