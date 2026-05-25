import {
  AccountActionButton,
  AccountActionRow,
  AccountBadge,
  AccountFormSheet,
  AccountListCard,
} from "@/components/account/AccountUi";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { getHalfStepRatingFromLocation, getStarIconName } from "@/utils/ratings";
import { resolveImageSource } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  LayoutAnimation,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ReviewComposerStep = "rating" | "comment";

export const reviewStyles = StyleSheet.create({
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  imageWrap: {
    width: rS(64),
    height: rS(64),
    borderRadius: rMS(16),
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    flex: 1,
    gap: rV(2),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14.5),
    color: AppColors.text,
  },
  sub: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
  },
  meta: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#9CA3AF",
  },
  orderText: {
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    color: "#64748B",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(4),
    marginTop: rV(10),
  },
  starsValue: {
    marginLeft: rS(6),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: AppColors.text,
  },
  commentPreview: {
    marginTop: rV(8),
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#4B5563",
  },
  ratingSection: {
    gap: rV(10),
  },
  ratingHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(12),
  },
  ratingValuePill: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11.5),
    color: "#B45309",
    backgroundColor: "#FFF4D6",
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
    borderRadius: 999,
    overflow: "hidden",
  },
  ratingControlWrap: {
    alignItems: "center",
    gap: rV(10),
  },
  ratingGestureArea: {
    alignSelf: "stretch",
    paddingHorizontal: rS(12),
    paddingVertical: rV(14),
    borderRadius: rMS(20),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#F3D28A",
    backgroundColor: "#FFFBEB",
  },
  ratingTrack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingTrackStar: {
    width: rS(44),
    height: rS(44),
    alignItems: "center",
    justifyContent: "center",
  },
  ratingMoodPill: {
    paddingHorizontal: rS(12),
    paddingVertical: rV(6),
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
  },
  ratingMoodText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    color: "#A16207",
  },
  ratingHint: {
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
    color: "#6B7280",
    textAlign: "center",
    lineHeight: rMS(17),
  },
  commentInput: {
    minHeight: rV(128),
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
    color: AppColors.text,
    fontFamily: Fonts.text,
    fontSize: rMS(13.5),
    lineHeight: rMS(20),
    textAlignVertical: "top",
  },
  composerProductCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    backgroundColor: "#F9FAFB",
    borderRadius: rMS(18),
    padding: rS(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  sectionLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ratingStepWrap: {
    gap: rV(14),
    paddingVertical: rV(4),
  },
  ratingStepPrompt: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
    color: "#6B7280",
    textAlign: "center",
  },
  ratingStepPromptHighlight: {
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  ratingRequiredHint: {
    textAlign: "center",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#DC2626",
  },
  commentStepCard: {
    gap: rV(12),
    marginTop: rV(4),
    padding: rS(14),
    borderRadius: rMS(20),
    backgroundColor: "#F9FAFB",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  ratingSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(10),
  },
  changeRatingButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(4),
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
    borderRadius: 999,
    backgroundColor: "#FFFBEB",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FDE68A",
  },
  changeRatingText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    color: "#B45309",
  },
});

export function formatReviewDate(value: string, prefix: string) {
  return `${prefix} ${new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export function getReviewImageSource(item: {
  imageKey?: string | null;
  imageUrl?: string | null;
}) {
  return resolveImageSource(item.imageUrl, item.imageKey);
}

export function getRatingToneLabel(rating: number) {
  if (rating >= 4.5) {
    return "Excellent";
  }
  if (rating >= 3.5) {
    return "Very good";
  }
  if (rating >= 2.5) {
    return "Good";
  }
  if (rating >= 1.5) {
    return "Fair";
  }
  if (rating >= 0.5) {
    return "Needs work";
  }
  return "Tap or slide to rate";
}

type ReviewStarsRowProps = {
  rating: number;
  size?: number;
  showValue?: boolean;
};

export function ReviewStarsRow({ rating, size = rMS(14), showValue = false }: ReviewStarsRowProps) {
  return (
    <View style={reviewStyles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={`star-${star}-${rating}`}
          name={getStarIconName(star, rating)}
          size={size}
          color="#F59E0B"
        />
      ))}
      {showValue ? <Text style={reviewStyles.starsValue}>{rating.toFixed(1)}</Text> : null}
    </View>
  );
}

type ReviewProductThumbnailProps = {
  imageKey?: string | null;
  imageUrl?: string | null;
  size?: number;
};

export function ReviewProductThumbnail({
  imageKey,
  imageUrl,
  size = rS(64),
}: ReviewProductThumbnailProps) {
  return (
    <View style={[reviewStyles.imageWrap, { width: size, height: size }]}>
      <Image
        source={getReviewImageSource({ imageKey, imageUrl })}
        style={reviewStyles.image}
        resizeMode="cover"
      />
    </View>
  );
}

export type ReviewListItemData = {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  title: string;
  category?: string | null;
  imageKey?: string | null;
  imageUrl?: string | null;
  status: "pending" | "published";
  rating?: number;
  comment?: string;
  dateLabel: string;
};

type ReviewListCardProps = {
  item: ReviewListItemData;
  onWritePress: () => void;
};

export function ReviewListCard({ item, onWritePress }: ReviewListCardProps) {
  const isPending = item.status === "pending";

  return (
    <AccountListCard>
      <View style={reviewStyles.productRow}>
        <ReviewProductThumbnail imageKey={item.imageKey} imageUrl={item.imageUrl} />
        <View style={reviewStyles.info}>
          <Text style={reviewStyles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={reviewStyles.sub}>{item.category ?? "Product"}</Text>
          <Text style={reviewStyles.meta}>{item.dateLabel}</Text>
          <Text style={reviewStyles.orderText}>Order #{item.orderNumber}</Text>
        </View>
        <AccountBadge label={isPending ? "Pending" : "Published"} tone={isPending ? "warning" : "success"} />
      </View>

      {!isPending && item.rating !== undefined ? (
        <>
          <ReviewStarsRow rating={item.rating} showValue />
          {item.comment ? <Text style={reviewStyles.commentPreview}>{item.comment}</Text> : null}
        </>
      ) : null}

      <AccountActionRow>
        <AccountActionButton
          label={isPending ? "Write review" : "Edit review"}
          variant={isPending ? "primary" : "secondary"}
          onPress={onWritePress}
        />
        <AccountActionButton
          label="View product"
          variant="ghost"
          onPress={() =>
            router.push({
              pathname: "/screens/[id]" as any,
              params: {
                id: item.productId,
                imageKey: item.imageKey ?? undefined,
                imageUrl: item.imageUrl ?? undefined,
                title: item.title,
                category: item.category ?? undefined,
              },
            })
          }
        />
      </AccountActionRow>
    </AccountListCard>
  );
}

type ReviewRatingPickerProps = {
  rating: number;
  onChange: (rating: number) => void;
};

export function ReviewRatingPicker({ rating, onChange }: ReviewRatingPickerProps) {
  const [trackWidth, setTrackWidth] = useState(0);

  const handleGesture = useCallback(
    (locationX: number) => {
      const nextRating = getHalfStepRatingFromLocation(locationX, trackWidth);
      if (nextRating > 0) {
        onChange(nextRating);
      }
    },
    [onChange, trackWidth],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          handleGesture(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          handleGesture(event.nativeEvent.locationX);
        },
      }),
    [handleGesture],
  );

  return (
    <View style={reviewStyles.ratingSection}>
      <View style={reviewStyles.ratingHeaderRow}>
        <Text style={reviewStyles.sectionLabel}>Your rating</Text>
        <Text style={reviewStyles.ratingValuePill}>
          {rating > 0 ? `${rating.toFixed(1)} / 5` : "Not rated"}
        </Text>
      </View>

      <View style={reviewStyles.ratingControlWrap}>
        <View
          style={reviewStyles.ratingGestureArea}
          onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
          {...panResponder.panHandlers}
        >
          <View style={reviewStyles.ratingTrack}>
            {[1, 2, 3, 4, 5].map((star) => (
              <View key={`picker-star-${star}`} style={reviewStyles.ratingTrackStar}>
                <Ionicons
                  name={getStarIconName(star, rating)}
                  size={rMS(30)}
                  color={rating >= star - 0.5 ? "#F59E0B" : "#CBD5E1"}
                />
              </View>
            ))}
          </View>
        </View>
        <View style={reviewStyles.ratingMoodPill}>
          <Text style={reviewStyles.ratingMoodText}>{getRatingToneLabel(rating)}</Text>
        </View>
      </View>

      <Text style={reviewStyles.ratingHint}>
        Tap or slide across the stars for a half or full star rating.
      </Text>
    </View>
  );
}

type ReviewComposerSheetProps = {
  visible: boolean;
  mode: "create" | "edit";
  productTitle: string;
  productCategory?: string | null;
  orderNumber?: string;
  imageKey?: string | null;
  imageUrl?: string | null;
  rating: number;
  comment: string;
  isSaving?: boolean;
  onClose: () => void;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
};

export function ReviewComposerSheet({
  visible,
  mode,
  productTitle,
  productCategory,
  orderNumber,
  imageKey,
  imageUrl,
  rating,
  comment,
  isSaving = false,
  onClose,
  onRatingChange,
  onCommentChange,
  onSubmit,
}: ReviewComposerSheetProps) {
  const [step, setStep] = useState<ReviewComposerStep>("rating");
  const [showRatingRequired, setShowRatingRequired] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowRatingRequired(false);
      return;
    }

    setStep(mode === "edit" && rating >= 0.5 ? "comment" : "rating");
    setShowRatingRequired(false);
  }, [visible, mode]);

  const goToCommentStep = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep("comment");
    setShowRatingRequired(false);
  }, []);

  const goToRatingStep = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep("rating");
  }, []);

  const handlePrimaryAction = useCallback(() => {
    if (step === "rating") {
      if (rating < 0.5) {
        setShowRatingRequired(true);
        return;
      }
      goToCommentStep();
      return;
    }

    onSubmit();
  }, [goToCommentStep, onSubmit, rating, step]);

  const sheetTitle =
    step === "rating"
      ? mode === "edit"
        ? "Update your rating"
        : "How was this product?"
      : mode === "edit"
        ? "Add your comments"
        : "Tell us more";

  const sheetSubtitle =
    step === "rating"
      ? "Choose your stars first — the comment box opens on the next step."
      : productTitle;

  const saveLabel =
    step === "rating"
      ? "Continue"
      : mode === "edit"
        ? "Update review"
        : "Publish review";

  return (
    <AccountFormSheet
      visible={visible}
      title={sheetTitle}
      subtitle={sheetSubtitle}
      onClose={onClose}
      onSave={handlePrimaryAction}
      saveLabel={saveLabel}
      isSaving={isSaving}
      saveDisabled={step === "rating" && rating < 0.5}
    >
      <View style={reviewStyles.composerProductCard}>
        <ReviewProductThumbnail imageKey={imageKey} imageUrl={imageUrl} size={rS(56)} />
        <View style={reviewStyles.info}>
          <Text style={reviewStyles.title} numberOfLines={2}>
            {productTitle}
          </Text>
          <Text style={reviewStyles.sub}>{productCategory ?? "Product"}</Text>
          {orderNumber ? <Text style={reviewStyles.orderText}>Order #{orderNumber}</Text> : null}
        </View>
      </View>

      {step === "rating" ? (
        <View style={reviewStyles.ratingStepWrap}>
          <Text style={reviewStyles.ratingStepPrompt}>
            <Text style={reviewStyles.ratingStepPromptHighlight}>Step 1 of 2</Text>
            {" · "}
            Tap or slide the stars, then continue to share your experience.
          </Text>
          <ReviewRatingPicker rating={rating} onChange={onRatingChange} />
          {showRatingRequired ? (
            <Text style={reviewStyles.ratingRequiredHint}>
              Select a star rating to continue.
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={reviewStyles.commentStepCard}>
          <View style={reviewStyles.ratingSummaryRow}>
            <ReviewStarsRow rating={rating} showValue />
            <TouchableOpacity
              style={reviewStyles.changeRatingButton}
              activeOpacity={0.86}
              onPress={goToRatingStep}
            >
              <Ionicons name="star-outline" size={rMS(12)} color="#B45309" />
              <Text style={reviewStyles.changeRatingText}>Change rating</Text>
            </TouchableOpacity>
          </View>

          <Text style={reviewStyles.ratingStepPrompt}>
            <Text style={reviewStyles.ratingStepPromptHighlight}>Step 2 of 2</Text>
            {" · "}
            What should other shoppers know about this item?
          </Text>

          <TextInput
            value={comment}
            onChangeText={onCommentChange}
            multiline
            autoFocus
            placeholder="Share fit, quality, delivery, or anything future shoppers should know."
            placeholderTextColor="#94A3B8"
            style={reviewStyles.commentInput}
            textAlignVertical="top"
          />
          <Text style={reviewStyles.ratingHint}>
            {comment.trim().length < 8
              ? "Add at least 8 characters so your review feels helpful."
              : "Looks good — publish when you're ready."}
          </Text>
        </View>
      )}
    </AccountFormSheet>
  );
}

export type ProductReviewPreview = {
  id: string;
  rating: number;
  comment: string;
  updatedAt: string;
};

type ProductReviewsPanelProps = {
  rating: number;
  reviewsLabel: string;
  reviewCount: number;
  reviews: ProductReviewPreview[];
};

export function ProductReviewsPanel({
  rating,
  reviewsLabel,
  reviewCount,
  reviews,
}: ProductReviewsPanelProps) {
  return (
    <AccountListCard>
      <View style={styles.panelHeader}>
        <View style={styles.panelHeaderCopy}>
          <Text style={styles.panelTitle}>Customer reviews</Text>
          <Text style={styles.panelSubtitle}>
            {reviewCount > 0
              ? "Latest feedback from delivered ODOS purchases."
              : "Review after delivery from My Reviews — feedback appears here."}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.manageButton}
          activeOpacity={0.86}
          onPress={() => router.push("/(root)/screens/profileScreens/Account/Reviews" as any)}
        >
          <Ionicons name="create-outline" size={rMS(14)} color={AppColors.text} />
          <Text style={styles.manageButtonText}>Write review</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryScoreCard}>
          <Text style={styles.summaryScore}>{rating > 0 ? rating.toFixed(1) : "0.0"}</Text>
          <ReviewStarsRow rating={rating > 0 ? rating : 0} size={rMS(13)} />
          <Text style={styles.summaryLabel}>{reviewsLabel}</Text>
        </View>
        <View style={styles.summaryHintCard}>
          <Ionicons name="star-outline" size={rMS(20)} color={AppColors.primary} />
          <Text style={styles.summaryHint}>
            Delivered orders unlock reviews in your account. Honest ratings help other shoppers choose with confidence.
          </Text>
        </View>
      </View>

      {reviews.length > 0 ? (
        <View style={styles.previewStack}>
          {reviews.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.previewCard}>
              <View style={styles.previewTop}>
                <ReviewStarsRow rating={item.rating} size={rMS(12)} />
                <Text style={styles.previewDate}>
                  {new Date(item.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <Text style={styles.previewComment}>{item.comment}</Text>
            </View>
          ))}
          {reviewCount > 3 ? (
            <Text style={styles.moreReviewsText}>+{reviewCount - 3} more in My Reviews</Text>
          ) : null}
        </View>
      ) : null}
    </AccountListCard>
  );
}

const styles = StyleSheet.create({
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(12),
  },
  panelHeaderCopy: {
    flex: 1,
    gap: rV(4),
  },
  panelTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
  },
  panelSubtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: "#6B7280",
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    backgroundColor: "#F3F4F6",
    borderRadius: rMS(14),
    paddingHorizontal: rS(12),
    paddingVertical: rV(9),
  },
  manageButtonText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11.5),
    color: AppColors.text,
  },
  summaryRow: {
    marginTop: rV(14),
    flexDirection: "row",
    gap: rS(10),
  },
  summaryScoreCard: {
    flex: 0.9,
    backgroundColor: AppColors.text,
    borderRadius: rMS(18),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    gap: rV(6),
  },
  summaryScore: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(26),
    color: "#FFFFFF",
  },
  summaryLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#CBD5E1",
  },
  summaryHintCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: rMS(18),
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    gap: rV(8),
  },
  summaryHint: {
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
    lineHeight: rMS(17),
    color: "#6B7280",
  },
  previewStack: {
    marginTop: rV(14),
    gap: rV(10),
  },
  previewCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: rMS(16),
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EEF2F6",
  },
  previewTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(8),
  },
  previewDate: {
    fontFamily: Fonts.text,
    fontSize: rMS(10.5),
    color: "#9CA3AF",
  },
  previewComment: {
    marginTop: rV(8),
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: AppColors.text,
  },
  moreReviewsText: {
    textAlign: "center",
    fontFamily: Fonts.title,
    fontSize: rMS(11.5),
    color: AppColors.primary,
  },
});
