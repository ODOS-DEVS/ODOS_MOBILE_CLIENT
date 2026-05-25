import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import { enrichStoredReview, enrichStoredReviews } from "@/utils/reviewImages";
import { resolveApiMediaUrl } from "@/utils/media";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo, useState } from "react";

export type ProductReview = {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  userDisplayName: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredReview = {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  title: string;
  category?: string | null;
  imageKey?: string | null;
  imageUrl?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewDraft = {
  orderId: string;
  orderNumber?: string;
  productId: string;
  title?: string;
  category?: string | null;
  imageKey?: string | null;
  imageUrl?: string | null;
  rating: number;
  comment: string;
};

type ProductReviewApiItem = {
  id: string;
  product_id: string;
  rating: number;
  comment: string;
  user_display_name: string;
  created_at: string;
  updated_at: string;
};

type UserReviewApiItem = {
  id: string;
  order_id: string;
  order_number: string;
  product_id: string;
  title: string;
  category?: string | null;
  image_key?: string | null;
  image_url?: string | null;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

function normalizeErrorMessage(detail: unknown) {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  return "We couldn't complete that request right now.";
}

async function parseErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    return normalizeErrorMessage(payload?.detail);
  } catch {
    return normalizeErrorMessage(response.statusText);
  }
}

async function getStoredAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY);
}

function mapUserReview(item: UserReviewApiItem): StoredReview {
  return {
    id: item.id,
    orderId: item.order_id,
    orderNumber: item.order_number,
    productId: item.product_id,
    title: item.title,
    category: item.category ?? undefined,
    imageKey: item.image_key ?? undefined,
    imageUrl: resolveApiMediaUrl(item.image_url) ?? item.image_url ?? undefined,
    rating: item.rating,
    comment: item.comment,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapProductReview(item: ProductReviewApiItem): ProductReview {
  return {
    id: item.id,
    productId: item.product_id,
    rating: item.rating,
    comment: item.comment,
    userDisplayName: item.user_display_name,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

async function getAccessToken(currentToken: string | null) {
  return currentToken || (await getStoredAccessToken());
}

export function useReviews() {
  const { user, accessToken } = useAuth();
  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const refreshReviews = useCallback(async () => {
    if (!user) {
      setReviews([]);
      setIsLoadingReviews(false);
      return;
    }

    const token = await getAccessToken(accessToken);
    if (!token) {
      setReviews([]);
      setIsLoadingReviews(false);
      return;
    }

    setIsLoadingReviews(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const payload = (await response.json()) as UserReviewApiItem[];
      const mapped = payload.map(mapUserReview);
      setReviews(await enrichStoredReviews(mapped));
    } catch {
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [accessToken, user]);

  useEffect(() => {
    void refreshReviews();
  }, [refreshReviews]);

  const submitReview = useCallback(
    async (draft: ReviewDraft) => {
      const token = await getAccessToken(accessToken);
      if (!token) {
        throw new Error("Sign in to submit a review.");
      }

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: draft.orderId,
          product_id: draft.productId,
          rating: draft.rating,
          comment: draft.comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const payload = mapUserReview((await response.json()) as UserReviewApiItem);
      const enriched = await enrichStoredReview(payload, {
        imageUrl: draft.imageUrl,
        imageKey: draft.imageKey,
      });

      setReviews((current) => {
        const existingIndex = current.findIndex((item) => item.id === enriched.id);
        if (existingIndex >= 0) {
          const next = [...current];
          next[existingIndex] = enriched;
          return next.sort(
            (left, right) =>
              new Date(right.updatedAt).getTime() -
              new Date(left.updatedAt).getTime(),
          );
        }

        return [enriched, ...current].sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
        );
      });

      return enriched;
    },
    [accessToken],
  );

  const getReviewForOrderItem = useCallback(
    (orderId: string, productId: string) =>
      reviews.find(
        (item) => item.orderId === orderId && item.productId === productId,
      ),
    [reviews],
  );

  const reviewStats = useMemo(() => {
    const count = reviews.length;
    const averageRating =
      count > 0
        ? reviews.reduce((total, item) => total + item.rating, 0) / count
        : 0;

    return {
      count,
      averageRating,
    };
  }, [reviews]);

  return {
    reviews,
    isLoadingReviews,
    reviewStats,
    refreshReviews,
    submitReview,
    getReviewForOrderItem,
  };
}

export function useProductReviews(productId?: string) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoadingProductReviews, setIsLoadingProductReviews] = useState(
    Boolean(productId),
  );

  const refreshProductReviews = useCallback(async () => {
    if (!productId) {
      setReviews([]);
      setIsLoadingProductReviews(false);
      return;
    }

    setIsLoadingProductReviews(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews/products/${encodeURIComponent(productId)}`,
      );
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const payload = (await response.json()) as ProductReviewApiItem[];
      setReviews(payload.map(mapProductReview));
    } catch {
      setReviews([]);
    } finally {
      setIsLoadingProductReviews(false);
    }
  }, [productId]);

  useEffect(() => {
    void refreshProductReviews();
  }, [refreshProductReviews]);

  return {
    reviews,
    isLoadingProductReviews,
    refreshProductReviews,
  };
}
