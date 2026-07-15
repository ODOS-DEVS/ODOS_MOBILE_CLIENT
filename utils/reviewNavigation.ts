import type { Order } from "@/hooks/useOrders";
import type { StoredReview } from "@/hooks/useReviews";

export type ProductReviewTarget = {
  orderId: string;
  orderNumber: string;
  productId: string;
  title: string;
  category?: string | null;
  imageKey?: string | null;
  imageUrl?: string | null;
  mode: "create" | "edit";
};

type ResolveProductReviewTargetInput = {
  productId: string;
  productTitle: string;
  productCategory?: string | null;
  imageKey?: string | null;
  imageUrl?: string | null;
  orders: Order[];
  userReviews: StoredReview[];
};

export function findDeliveredOrderForProduct(orders: Order[], productId: string) {
  const normalizedProductId = productId.trim();
  if (!normalizedProductId) {
    return null;
  }

  const deliveredOrders = orders
    .filter((order) => order.status === "delivered")
    .sort(
      (left, right) =>
        new Date(right.delivered_at ?? right.placed_at).getTime() -
        new Date(left.delivered_at ?? left.placed_at).getTime(),
    );

  for (const order of deliveredOrders) {
    const item = order.items.find(
      (entry) => entry.product_id === normalizedProductId,
    );
    if (!item) {
      continue;
    }

    return {
      order,
      item,
    };
  }

  return null;
}

export function resolveProductReviewTarget({
  productId,
  productTitle,
  productCategory,
  imageKey,
  imageUrl,
  orders,
  userReviews,
}: ResolveProductReviewTargetInput): ProductReviewTarget | null {
  const match = findDeliveredOrderForProduct(orders, productId);
  if (!match) {
    return null;
  }

  const existingReview = userReviews.find(
    (review) =>
      review.orderId === match.order.id &&
      review.productId === match.item.product_id,
  );

  return {
    orderId: match.order.id,
    orderNumber: match.order.order_number,
    productId: match.item.product_id,
    title: match.item.title || productTitle,
    category: match.item.category ?? productCategory ?? null,
    imageKey: match.item.image_key ?? imageKey ?? null,
    imageUrl: match.item.image_url ?? imageUrl ?? null,
    mode: existingReview ? "edit" : "create",
  };
}

export function buildReviewComposerRoute(target: ProductReviewTarget) {
  return {
    pathname: "/(root)/screens/profileScreens/Account/Reviews" as const,
    params: {
      orderId: target.orderId,
      productId: target.productId,
      openComposer: "1",
    },
  };
}

export function buildReviewsScreenRoute(productId?: string) {
  return {
    pathname: "/(root)/screens/profileScreens/Account/Reviews" as const,
    params: productId ? { productId, openComposer: "1" } : undefined,
  };
}
