import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import { resolveCatalogImage } from "@/constants/catalogImages";
import Fonts from "@/constants/Fonts";
import { useToast } from "@/context/ToastContext";
import { Order } from "@/hooks/useOrders";
import { useOrders } from "@/hooks/useOrders";
import {
  type ReviewDraft,
  type StoredReview,
  useReviews,
} from "@/hooks/useReviews";
import { rMS, rS, rV } from "@/styles/responsive";
import { getHalfStepRatingFromLocation, getStarIconName } from "@/utils/ratings";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

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

const reviewFilters: { key: ReviewFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "published", label: "Published" },
];

function getImageSource(item: {
  imageKey?: string | null;
  imageUrl?: string | null;
}) {
  if (item.imageUrl) {
    return { uri: item.imageUrl };
  }

  return resolveCatalogImage(item.imageKey);
}

function formatDateLabel(value: string, prefix: string) {
  return `${prefix} ${new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function getRatingToneLabel(rating: number) {
  if (rating >= 4.5) {
    return "Excellent";
  }
  if (rating >= 3.5) {
    return "Very Good";
  }
  if (rating >= 2.5) {
    return "Good";
  }
  if (rating >= 1.5) {
    return "Fair";
  }
  if (rating >= 0.5) {
    return "Needs Work";
  }

  return "Tap or slide";
}

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

export default function ReviewsScreen() {
  const { orders, isLoadingOrders } = useOrders();
  const { showToast } = useToast();
  const { reviews, isLoadingReviews, reviewStats, submitReview } = useReviews();
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>("all");
  const [selectedItem, setSelectedItem] = useState<ReviewListItem | null>(null);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingTrackWidth, setRatingTrackWidth] = useState(0);

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

  const handleRatingGesture = useCallback(
    (locationX: number) => {
      const nextRating = getHalfStepRatingFromLocation(locationX, ratingTrackWidth);
      if (nextRating > 0) {
        setDraftRating(nextRating);
      }
    },
    [ratingTrackWidth],
  );

  const ratingPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          handleRatingGesture(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          handleRatingGesture(event.nativeEvent.locationX);
        },
      }),
    [handleRatingGesture],
  );

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
      const payload: ReviewDraft =
        selectedItem.type === "published"
          ? {
              orderId: selectedItem.orderId,
              orderNumber: selectedItem.orderNumber,
              productId: selectedItem.productId,
              title: selectedItem.title,
              category: selectedItem.category,
              imageKey: selectedItem.imageKey,
              imageUrl: selectedItem.imageUrl,
              rating: draftRating,
              comment: draftComment,
            }
          : {
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

  return (
    <View style={styles.container}>
      <ProfileHeader title="My Reviews" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard} className="shadow-sm">
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>
              {reviewStats.count > 0 ? reviewStats.averageRating.toFixed(1) : "0.0"}
            </Text>
            <Text style={styles.metricLabel}>Average Rating</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{publishedItems.length}</Text>
            <Text style={styles.metricLabel}>Published</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{pendingItems.length}</Text>
            <Text style={styles.metricLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {reviewFilters.map((item) => {
            const isActive = activeFilter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                onPress={() => setActiveFilter(item.key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Loading your review activity...</Text>
            <Text style={styles.emptyText}>
              Delivered items and saved reviews will appear here shortly.
            </Text>
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No reviews to show yet</Text>
            <Text style={styles.emptyText}>
              Delivered orders will create review prompts here, and your published
              ratings will stay in this space.
            </Text>
          </View>
        ) : (
          filteredData.map((item) => {
            const isPending = item.type === "pending";
            const imageSource = getImageSource(item);
            return (
              <View key={item.id} style={styles.card} className="shadow-sm">
                <View style={styles.topRow}>
                  <View style={styles.imageWrap}>
                    <Image source={imageSource} style={styles.image} resizeMode="contain" />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.sub}>{item.category ?? "Product"}</Text>
                    <Text style={styles.date}>
                      {isPending
                        ? formatDateLabel(item.deliveredAt, "Delivered on")
                        : formatDateLabel(item.updatedAt, "Reviewed on")}
                    </Text>
                    <Text style={styles.orderText}>Order #{item.orderNumber}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      isPending ? styles.pendingBadge : styles.publishedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isPending ? styles.pendingText : styles.publishedText,
                      ]}
                    >
                      {isPending ? "Pending" : "Published"}
                    </Text>
                  </View>
                </View>

                {!isPending ? (
                  <>
                    <View style={styles.ratingRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={`${item.id}-${star}`}
                          name={getStarIconName(star, item.rating)}
                          size={rMS(14)}
                          color="#F59E0B"
                        />
                      ))}
                      <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.comment}>{item.comment}</Text>
                  </>
                ) : null}

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={isPending ? styles.primaryBtn : styles.outlineBtn}
                    activeOpacity={0.85}
                    onPress={() => openComposer(item)}
                  >
                    <Text
                      style={
                        isPending ? styles.primaryBtnText : styles.outlineBtnText
                      }
                    >
                      {isPending ? "Write Review" : "Edit Review"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: "/screens/[id]" as any,
                        params: {
                          id: item.productId,
                          image: item.imageUrl ?? item.imageKey,
                          imageKey: item.imageKey,
                          imageUrl: item.imageUrl,
                          title: item.title,
                          category: item.category,
                        },
                      })
                    }
                  >
                    <Text style={styles.primaryBtnText}>View Product</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={Boolean(selectedItem)}
        animationType="slide"
        transparent
        onRequestClose={closeComposer}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => undefined} accessible={false}>
                <View style={styles.modalCard}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.modalScrollContent}
                  >
                    <View style={styles.modalHeader}>
                      <View style={styles.modalHeadingWrap}>
                        <Text style={styles.modalTitle}>
                          {selectedItem?.type === "published"
                            ? "Edit your review"
                            : "Rate this product"}
                        </Text>
                        <Text style={styles.modalSubtitle}>
                          {selectedItem?.title ?? "Product"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={closeComposer}
                        style={styles.modalCloseButton}
                        activeOpacity={0.82}
                      >
                        <Ionicons name="close" size={rMS(18)} color={AppColors.text} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalSection}>
                      <View style={styles.ratingHeaderRow}>
                        <Text style={styles.fieldLabel}>Your rating</Text>
                        <Text style={styles.ratingValueLabel}>
                          {draftRating > 0
                            ? `${draftRating.toFixed(1)} / 5`
                            : "Tap or slide"}
                        </Text>
                      </View>
                      <View style={styles.ratingControlWrap}>
                        <View
                          style={styles.ratingGestureArea}
                          onLayout={(event) =>
                            setRatingTrackWidth(event.nativeEvent.layout.width)
                          }
                          {...ratingPanResponder.panHandlers}
                        >
                          <View style={styles.ratingTrack}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <View
                                key={`draft-star-${star}`}
                                style={styles.ratingTrackStar}
                              >
                                <Ionicons
                                  name={getStarIconName(star, draftRating)}
                                  size={rMS(28)}
                                  color={
                                    draftRating >= star - 0.5 ? "#F59E0B" : "#CBD5E1"
                                  }
                                />
                              </View>
                            ))}
                          </View>
                        </View>
                        <View style={styles.ratingMoodPill}>
                          <Text style={styles.ratingMoodText}>
                            {getRatingToneLabel(draftRating)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.ratingHint}>
                        Tap or slide across the stars to choose a half or full rating.
                      </Text>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.fieldLabel}>What stood out?</Text>
                      <TextInput
                        value={draftComment}
                        onChangeText={setDraftComment}
                        multiline
                        placeholder="Share a short experience with the product, fit, quality, or delivery."
                        placeholderTextColor="#94A3B8"
                        style={styles.commentInput}
                        textAlignVertical="top"
                      />
                    </View>

                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.modalSecondaryButton}
                        activeOpacity={0.84}
                        onPress={closeComposer}
                      >
                        <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalPrimaryButton,
                          isSubmitting && styles.modalPrimaryButtonDisabled,
                        ]}
                        activeOpacity={0.84}
                        disabled={isSubmitting}
                        onPress={() => void handleSubmitReview()}
                      >
                        <Text style={styles.modalPrimaryButtonText}>
                          {isSubmitting ? "Saving..." : "Publish Review"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
    paddingBottom: rV(28),
  },
  summaryCard: {
    backgroundColor: AppColors.secondary,
    borderRadius: rMS(16),
    paddingVertical: rV(14),
    flexDirection: "row",
    alignItems: "center",
  },
  metricBlock: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: rMS(20),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
  },
  metricLabel: {
    marginTop: rV(3),
    fontSize: rMS(11),
    color: "#E5E7EB",
    fontFamily: Fonts.text,
  },
  metricDivider: {
    width: 1,
    height: "64%",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  filterRow: {
    flexDirection: "row",
    gap: rS(8),
    marginTop: rV(14),
    marginBottom: rV(10),
  },
  filterBtn: {
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderRadius: rMS(999),
    borderWidth: 1,
    borderColor: "#D6DCE5",
    backgroundColor: AppColors.white,
  },
  filterBtnActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterText: {
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  filterTextActive: {
    color: AppColors.white,
  },
  emptyState: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    padding: rS(18),
    marginTop: rV(6),
  },
  emptyTitle: {
    fontSize: rMS(15),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    marginBottom: rV(6),
  },
  emptyText: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    lineHeight: rMS(18),
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    padding: rS(14),
    marginBottom: rV(10),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageWrap: {
    width: rMS(60),
    height: rMS(60),
    borderRadius: rMS(12),
    backgroundColor: "#F1F4F7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "82%",
    height: "82%",
  },
  info: {
    flex: 1,
    marginLeft: rS(10),
  },
  title: {
    fontSize: rMS(14),
    color: AppColors.text,
    fontFamily: Fonts.title,
  },
  sub: {
    marginTop: rV(2),
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  date: {
    marginTop: rV(4),
    fontSize: rMS(11),
    color: AppColors.subtext[100],
    fontFamily: Fonts.text,
  },
  orderText: {
    marginTop: rV(2),
    fontSize: rMS(11),
    color: "#64748B",
    fontFamily: Fonts.textBold,
  },
  statusBadge: {
    borderRadius: rMS(999),
    paddingHorizontal: rS(9),
    paddingVertical: rV(4),
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },
  publishedBadge: {
    backgroundColor: "#DCFCE7",
  },
  statusText: {
    fontSize: rMS(10),
    fontFamily: Fonts.textBold,
  },
  pendingText: {
    color: "#92400E",
  },
  publishedText: {
    color: "#166534",
  },
  ratingRow: {
    marginTop: rV(10),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(3),
  },
  ratingText: {
    marginLeft: rS(5),
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  comment: {
    marginTop: rV(8),
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    lineHeight: rMS(18),
  },
  actionRow: {
    marginTop: rV(12),
    flexDirection: "row",
    gap: rS(8),
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D6DCE5",
    borderRadius: rMS(10),
    paddingVertical: rV(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
  },
  outlineBtnText: {
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: rMS(10),
    paddingVertical: rV(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.primary,
  },
  primaryBtnText: {
    fontSize: rMS(12),
    color: AppColors.white,
    fontFamily: Fonts.textBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
    justifyContent: "flex-end",
    padding: rS(12),
  },
  modalRoot: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    padding: rS(18),
    maxHeight: "88%",
  },
  modalScrollContent: {
    paddingBottom: rV(6),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(12),
  },
  modalHeadingWrap: {
    flex: 1,
  },
  modalTitle: {
    fontSize: rMS(16),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  modalSubtitle: {
    marginTop: rV(4),
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  modalCloseButton: {
    width: rMS(34),
    height: rMS(34),
    borderRadius: rMS(17),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSection: {
    marginTop: rV(18),
  },
  fieldLabel: {
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  ratingHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(12),
  },
  ratingValueLabel: {
    fontSize: rMS(12),
    color: "#B45309",
    fontFamily: Fonts.textBold,
    backgroundColor: "#FFF4D6",
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
    borderRadius: rMS(999),
    overflow: "hidden",
  },
  ratingControlWrap: {
    marginTop: rV(12),
    alignItems: "center",
  },
  ratingGestureArea: {
    minWidth: rMS(248),
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
    borderRadius: rMS(999),
    borderWidth: 1,
    borderColor: "#F3D28A",
    backgroundColor: "#FFF9EC",
  },
  ratingTrack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(4),
  },
  ratingTrackStar: {
    width: rMS(34),
    height: rMS(34),
    alignItems: "center",
    justifyContent: "center",
  },
  ratingMoodPill: {
    marginTop: rV(10),
    paddingHorizontal: rS(12),
    paddingVertical: rV(6),
    borderRadius: rMS(999),
    backgroundColor: "#FFF4D6",
  },
  ratingMoodText: {
    fontSize: rMS(11),
    color: "#A16207",
    fontFamily: Fonts.textBold,
    letterSpacing: 0.2,
  },
  ratingHint: {
    marginTop: rV(8),
    fontSize: rMS(11),
    color: "#64748B",
    fontFamily: Fonts.text,
    textAlign: "center",
    lineHeight: rMS(16),
  },
  commentInput: {
    marginTop: rV(10),
    minHeight: rV(120),
    borderRadius: rMS(16),
    borderWidth: 1,
    borderColor: "#D8DEE6",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
    color: AppColors.text,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
  },
  modalActions: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(22),
  },
  modalSecondaryButton: {
    flex: 1,
    borderRadius: rMS(14),
    borderWidth: 1,
    borderColor: "#D8DEE6",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(13),
    backgroundColor: AppColors.white,
  },
  modalSecondaryButtonText: {
    color: AppColors.text,
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
  },
  modalPrimaryButton: {
    flex: 1.2,
    borderRadius: rMS(14),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(13),
    backgroundColor: AppColors.primary,
  },
  modalPrimaryButtonDisabled: {
    opacity: 0.7,
  },
  modalPrimaryButtonText: {
    color: AppColors.white,
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
  },
});
