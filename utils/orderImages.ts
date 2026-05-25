import { API_BASE_URL } from "@/constants/auth";
import type { Order, OrderItem } from "@/hooks/useOrders";
import { resolveApiMediaUrl, resolveImageSource } from "@/utils/media";
import type { ImageSourcePropType } from "react-native";

type ProductImageSnapshot = {
  image_url: string | null;
  image_key: string | null;
};

const productImageCache = new Map<string, ProductImageSnapshot>();

export function buildOrderItemImagePayload(item: {
  image?: { uri?: string } | number | null;
  imageKey?: string | null;
  imageUrl?: string | null;
}) {
  const image_url =
    resolveApiMediaUrl(item.imageUrl) ??
    (item.image &&
    typeof item.image === "object" &&
    "uri" in item.image &&
    typeof item.image.uri === "string"
      ? resolveApiMediaUrl(item.image.uri) ?? item.image.uri
      : null);

  return {
    image_url,
    image_key: item.imageKey?.trim() || null,
  };
}

export function resolveOrderItemImageSource(item: {
  image_url?: string | null;
  image_key?: string | null;
}): ImageSourcePropType {
  const resolvedUrl = resolveApiMediaUrl(item.image_url);
  if (resolvedUrl) {
    return { uri: resolvedUrl };
  }

  const imageKey = item.image_key?.trim();
  if (imageKey) {
    return resolveImageSource(null, imageKey);
  }

  return resolveImageSource(null, "bag");
}

export async function getProductImageSnapshot(
  productId: string,
): Promise<ProductImageSnapshot | null> {
  const cached = productImageCache.get(productId);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/catalog/products/${encodeURIComponent(productId)}`,
    );
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      image_url?: string | null;
      image_key?: string | null;
    };
    const snapshot: ProductImageSnapshot = {
      image_url: payload.image_url ?? null,
      image_key: payload.image_key ?? null,
    };
    productImageCache.set(productId, snapshot);
    return snapshot;
  } catch {
    return null;
  }
}

function mergeOrderItemWithProductSnapshot(
  item: OrderItem,
  snapshot: ProductImageSnapshot | null,
): OrderItem {
  if (!snapshot) {
    return item;
  }

  const productUrl = resolveApiMediaUrl(snapshot.image_url);
  if (productUrl) {
    return {
      ...item,
      image_url: snapshot.image_url,
      image_key: snapshot.image_key ?? item.image_key,
    };
  }

  if (resolveApiMediaUrl(item.image_url)) {
    return item;
  }

  if (snapshot.image_key) {
    return {
      ...item,
      image_key: snapshot.image_key,
    };
  }

  return item;
}

export async function enrichOrderWithProductImages(order: Order): Promise<Order> {
  const items = await Promise.all(
    order.items.map(async (item) => {
      const snapshot = await getProductImageSnapshot(item.product_id);
      return mergeOrderItemWithProductSnapshot(item, snapshot);
    }),
  );

  return { ...order, items };
}

export async function enrichOrdersWithProductImages(orders: Order[]): Promise<Order[]> {
  const productIds = [
    ...new Set(orders.flatMap((order) => order.items.map((item) => item.product_id))),
  ];

  await Promise.all(productIds.map((productId) => getProductImageSnapshot(productId)));

  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) =>
      mergeOrderItemWithProductSnapshot(
        item,
        productImageCache.get(item.product_id) ?? null,
      ),
    ),
  }));
}
