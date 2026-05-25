import type { StoredReview } from "@/hooks/useReviews";
import { resolveApiMediaUrl } from "@/utils/media";
import { getProductImageSnapshot } from "@/utils/orderImages";

const GENERIC_IMAGE_KEYS = new Set(["bag", "odos", "placeholder"]);

function hasUsableReviewImage(review: {
  imageUrl?: string | null;
  imageKey?: string | null;
}) {
  if (resolveApiMediaUrl(review.imageUrl)) {
    return true;
  }

  const imageKey = review.imageKey?.trim().toLowerCase();
  return Boolean(imageKey && !GENERIC_IMAGE_KEYS.has(imageKey));
}

function mergeReviewWithSnapshot(
  review: StoredReview,
  snapshot: { image_url: string | null; image_key: string | null } | null,
  fallback?: { imageUrl?: string | null; imageKey?: string | null },
): StoredReview {
  const draftUrl = resolveApiMediaUrl(fallback?.imageUrl);
  const draftKey = fallback?.imageKey?.trim();

  if (draftUrl || (draftKey && !GENERIC_IMAGE_KEYS.has(draftKey.toLowerCase()))) {
    return {
      ...review,
      imageUrl: draftUrl ?? review.imageUrl,
      imageKey: draftKey ?? review.imageKey,
    };
  }

  if (hasUsableReviewImage(review)) {
    return {
      ...review,
      imageUrl: resolveApiMediaUrl(review.imageUrl) ?? review.imageUrl,
    };
  }

  if (!snapshot) {
    return review;
  }

  const productUrl = resolveApiMediaUrl(snapshot.image_url);
  if (productUrl) {
    return {
      ...review,
      imageUrl: productUrl,
      imageKey: snapshot.image_key ?? review.imageKey,
    };
  }

  const productKey = snapshot.image_key?.trim();
  if (productKey && !GENERIC_IMAGE_KEYS.has(productKey.toLowerCase())) {
    return {
      ...review,
      imageKey: productKey,
    };
  }

  return review;
}

export async function enrichStoredReview(
  review: StoredReview,
  fallback?: { imageUrl?: string | null; imageKey?: string | null },
): Promise<StoredReview> {
  if (hasUsableReviewImage(review)) {
    return mergeReviewWithSnapshot(review, null, fallback);
  }

  const snapshot = await getProductImageSnapshot(review.productId);
  return mergeReviewWithSnapshot(review, snapshot, fallback);
}

export async function enrichStoredReviews(
  reviews: StoredReview[],
): Promise<StoredReview[]> {
  const productIds = [...new Set(reviews.map((review) => review.productId))];
  await Promise.all(productIds.map((productId) => getProductImageSnapshot(productId)));

  return Promise.all(
    reviews.map((review) => enrichStoredReview(review)),
  );
}
