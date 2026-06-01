import {
  AccountEmptyState,
  AccountFilterChips,
  AccountInsightCard,
  useAccountStyles,
} from "@/components/account/AccountUi";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  formatReviewDate,
  ReviewComposerSheet,
  ReviewListCard,
  type ReviewListItemData,
} from "@/components/reviews/ReviewUi";
import { useToast } from "@/context/ToastContext";
import { Order } from "@/hooks/useOrders";
import { useOrders } from "@/hooks/useOrders";
import {
  type ReviewDraft,
  type StoredReview,
  useReviews,
} from "@/hooks/useReviews";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";

type ReviewStatus = "pending" | "published";
type ReviewFilter = "all" | ReviewStatus;

type PendingReviewItem = {
  type: "pending";
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  title: string;
  category?: string | null;
  imageKey?: string | null;
  imageUrl?: string | null;
  deliveredAt: string;
};

type PublishedReviewItem = StoredReview & {
  type: "published";
};

type ReviewListItem = PendingReviewItem | PublishedReviewItem;

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function buildPendingItems(
  deliveredOrders: Order[],
  getReviewForOrderItem: (orderId: string, productId: string) => StoredReview | undefined,
) {
  return deliveredOrders
    .flatMap((order) =>
      order.items.map((item) => ({
        id: `${order.id}:${item.product_id}`,
        orderId: order.id,
        orderNumber: order.order_number,
        productId: item.product_id,
        title: item.title,
        category: item.category,
        imageKey: item.image_key,
        imageUrl: item.image_url,
        deliveredAt: order.delivered_at ?? order.placed_at,
        reviewed: Boolean(getReviewForOrderItem(order.id, item.product_id)),
      })),
    )
    .filter((item) => !item.reviewed)
    .map(
      (item) =>
        ({
          type: "pending",
          id: item.id,
          orderId: item.orderId,
          orderNumber: item.orderNumber,
          productId: item.productId,
          title: item.title,
          category: item.category,
          imageKey: item.imageKey,
          imageUrl: item.imageUrl,
          deliveredAt: item.deliveredAt,
        }) satisfies PendingReviewItem,
    )
    .sort(
      (left, right) =>
        new Date(right.deliveredAt).getTime() - new Date(left.deliveredAt).getTime(),
    );
}

function toListCardData(item: ReviewListItem): ReviewListItemData {
  const isPending = item.type === "pending";
  return {
    id: item.id,
    orderId: item.orderId,
    orderNumber: item.orderNumber,
    productId: item.productId,
    title: item.title,
    category: item.category,
    imageKey: item.imageKey,
    imageUrl: item.imageUrl,
    status: isPending ? "pending" : "published",
    rating: isPending ? undefined : item.rating,
    comment: isPending ? undefined : item.comment,
    dateLabel: isPending
      ? formatReviewDate(item.deliveredAt, "Delivered on")
      : formatReviewDate(item.updatedAt, "Reviewed on"),
  };
}

export default function ReviewsScreen() {
  const accountStyles = useAccountStyles();
  const params = useLocalSearchParams<{
    orderId?: string;
    productId?: string;
  }>();
  const { orders, isLoadingOrders } = useOrders();
  const { showToast } = useToast();
  const { reviews, isLoadingReviews, reviewStats, submitReview } = useReviews();
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>("all");
  const [selectedItem, setSelectedItem] = useState<ReviewListItem | null>(null);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deepLinkHandled = useRef(false);

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "delivered"),
    [orders],
  );

  const pendingItems = useMemo(() => {
    return buildPendingItems(
      deliveredOrders,
      (orderId, productId) =>
        reviews.find(
          (item) => item.orderId === orderId && item.productId === productId,
        ),
    );
  }, [deliveredOrders, reviews]);

  const publishedItems = useMemo(
    () =>
      [...reviews]
        .map(
          (item) =>
            ({
              ...item,
              type: "published",
            }) satisfies PublishedReviewItem,
        )
        .sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
        ),
    [reviews],
  );

  const reviewFilters = useMemo(
    () => [
      { key: "all" as const, label: "All" },
      { key: "pending" as const, label: `Pending (${pendingItems.length})` },
      { key: "published" as const, label: `Published (${publishedItems.length})` },
    ],
    [pendingItems.length, publishedItems.length],
  );

  const filteredData = useMemo(() => {
    if (activeFilter === "pending") {
      return pendingItems;
    }

    if (activeFilter === "published") {
      return publishedItems;
    }

    const combined = [...pendingItems, ...publishedItems];
    return combined.sort((left, right) => {
      const leftDate =
        left.type === "pending" ? left.deliveredAt : left.updatedAt;
      const rightDate =
        right.type === "pending" ? right.deliveredAt : right.updatedAt;
      return new Date(rightDate).getTime() - new Date(leftDate).getTime();
    });
  }, [activeFilter, pendingItems, publishedItems]);

  const openComposer = (item: ReviewListItem) => {
    setSelectedItem(item);
    if (item.type === "published") {
      setDraftRating(item.rating);
      setDraftComment(item.comment);
    } else {
      setDraftRating(0);
      setDraftComment("");
    }
  };

  const closeComposer = () => {
    Keyboard.dismiss();
    setSelectedItem(null);
    setDraftRating(0);
    setDraftComment("");
    setIsSubmitting(false);
  };

  const handleSubmitReview = async () => {
    if (!selectedItem) {
      return;
    }

    if (draftRating < 0.5) {
      showToast("Choose a star rating first.");
      return;
    }

    if (draftComment.trim().length < 8) {
      showToast("Add a short comment so your review feels useful.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ReviewDraft = {
        orderId: selectedItem.orderId,
        orderNumber: selectedItem.orderNumber,
        productId: selectedItem.productId,
        title: selectedItem.title,
        category: selectedItem.category,
        imageKey: selectedItem.imageKey,
        imageUrl: selectedItem.imageUrl,
        rating: draftRating,
        comment: draftComment,
      };

      await submitReview(payload);
      showToast(
        selectedItem.type === "published"
          ? "Review updated."
          : "Review published.",
      );
      closeComposer();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't save the review.",
      );
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingOrders || isLoadingReviews;

  useEffect(() => {
    if (isLoading || deepLinkHandled.current) {
      return;
    }

    const orderId = getParam(params.orderId)?.trim();
    const productId = getParam(params.productId)?.trim();
    if (!orderId || !productId) {
      return;
    }

    const pendingMatch = pendingItems.find(
      (item) => item.orderId === orderId && item.productId === productId,
    );
    if (pendingMatch) {
      deepLinkHandled.current = true;
      setActiveFilter("pending");
      openComposer(pendingMatch);
      return;
    }

    const publishedMatch = publishedItems.find(
      (item) => item.orderId === orderId && item.productId === productId,
    );
    if (publishedMatch) {
      deepLinkHandled.current = true;
      setActiveFilter("published");
      openComposer(publishedMatch);
    }
  }, [isLoading, params.orderId, params.productId, pendingItems, publishedItems]);

  if (isLoading) {
    return (
      <View style={accountStyles.screen}>
        <ProfileHeader title="My Reviews" />
        <ScreenLoader label="Loading your reviews..." />
      </View>
    );
  }

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="My Reviews" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={accountStyles.content}
      >
        <AccountInsightCard
          title="Your review activity"
          subtitle="Rate delivered products and keep published feedback in one place."
          stats={[
            {
              value:
                reviewStats.count > 0 ? reviewStats.averageRating.toFixed(1) : "0.0",
              label: "Average",
            },
            { value: publishedItems.length, label: "Published" },
            { value: pendingItems.length, label: "Pending" },
          ]}
        />

        <AccountFilterChips
          options={reviewFilters}
          activeKey={activeFilter}
          onChange={setActiveFilter}
        />

        {filteredData.length === 0 ? (
          <AccountEmptyState
            icon="star-outline"
            title="No reviews yet"
            message="Delivered orders will create review prompts here, and your published ratings will stay in this space."
          />
        ) : (
          filteredData.map((item) => (
            <ReviewListCard
              key={item.id}
              item={toListCardData(item)}
              onWritePress={() => openComposer(item)}
            />
          ))
        )}
      </ScrollView>

      <ReviewComposerSheet
        visible={Boolean(selectedItem)}
        mode={selectedItem?.type === "published" ? "edit" : "create"}
        productTitle={selectedItem?.title ?? "Product"}
        productCategory={selectedItem?.category}
        orderNumber={selectedItem?.orderNumber}
        imageKey={selectedItem?.imageKey}
        imageUrl={selectedItem?.imageUrl}
        rating={draftRating}
        comment={draftComment}
        isSaving={isSubmitting}
        onClose={closeComposer}
        onRatingChange={setDraftRating}
        onCommentChange={setDraftComment}
        onSubmit={() => void handleSubmitReview()}
      />
    </View>
  );
}
