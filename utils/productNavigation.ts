import { router } from "expo-router";

import {
  BEHAVIOR_EVENT_TYPES,
  trackBehaviorEvent,
  type BehaviorEventType,
} from "@/services/behaviorTracking";

export type ProductOpenParams = {
  id: string;
  image?: string;
  imageKey?: string;
  imageUrl?: string;
  title: string;
  category?: string;
  oldPrice?: number;
  price?: number;
  discount?: string;
  rating?: number;
  reviews?: number | string;
};

type OpenProductOptions = {
  sourceScreen: string;
  storeId?: string | null;
  searchQuery?: string | null;
  eventType?: Extract<BehaviorEventType, "product_click" | "search_result_click">;
  metadata?: Record<string, unknown>;
};

export function trackProductOpen(
  product: Pick<ProductOpenParams, "id" | "category">,
  {
    sourceScreen,
    storeId,
    searchQuery,
    eventType = BEHAVIOR_EVENT_TYPES.PRODUCT_CLICK,
    metadata,
  }: OpenProductOptions,
) {
  trackBehaviorEvent({
    eventType,
    productId: product.id,
    storeId: storeId ?? null,
    category: product.category ?? null,
    searchQuery: searchQuery ?? null,
    sourceScreen,
    metadata,
  });
}

export function openProductDetail(
  params: ProductOpenParams,
  options?: OpenProductOptions,
) {
  if (options?.sourceScreen) {
    trackProductOpen(params, options);
  }

  router.push({
    pathname: "/screens/[id]" as any,
    params: {
      id: params.id,
      image: params.imageUrl ?? undefined,
      imageKey: params.imageKey,
      imageUrl: params.imageUrl,
      title: params.title,
      category: params.category,
      oldPrice: params.oldPrice,
      price: params.price,
      discount: params.discount,
      rating: params.rating,
      reviews: params.reviews,
    },
  });
}
