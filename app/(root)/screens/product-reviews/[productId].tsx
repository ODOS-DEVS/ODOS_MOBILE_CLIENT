import ProfileHeader from "@/components/profile/ProfileHeader";
import { ReviewStarsRow, formatReviewDate } from "@/components/reviews/ReviewUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useProductReviews } from "@/hooks/useReviews";
import { rMS, rS, rV } from "@/styles/responsive";
import type { ThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Every review for one product, with the shop's replies. */
export default function ProductReviewsScreen() {
  const { productId, title } = useLocalSearchParams<{
    productId: string;
    title?: string;
  }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // 200 is the API ceiling. Reviews are read in one pass here rather than
  // paged: a product with more than that is far beyond anything on ODOS today,
  // and a paginated list would add a loading state for a case that does not
  // exist yet.
  const { reviews, isLoadingProductReviews, refreshProductReviews } =
    useProductReviews(productId, 200);

  const summary = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 0, total: 0, distribution: [] as { stars: number; count: number }[] };
    }
    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((review) => Math.round(review.rating) === stars).length,
    }));
    return { average: sum / total, total, distribution };
  }, [reviews]);

  return (
    <View style={styles.screen}>
      <ProfileHeader title={title ? `Reviews · ${title}` : "Reviews"} />

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingProductReviews && reviews.length > 0}
            onRefresh={() => void refreshProductReviews()}
          />
        }
        ListHeaderComponent={
          reviews.length > 0 ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryLeft}>
                <Text style={styles.average}>{summary.average.toFixed(1)}</Text>
                <ReviewStarsRow rating={summary.average} size={rMS(15)} />
                <Text style={styles.summaryCount}>
                  {summary.total} review{summary.total === 1 ? "" : "s"}
                </Text>
              </View>

              <View style={styles.distribution}>
                {summary.distribution.map((row) => {
                  // Share of the total, so the bars read as proportions rather
                  // than raw counts a reader has to compare by eye.
                  const share = summary.total > 0 ? row.count / summary.total : 0;
                  return (
                    <View key={row.stars} style={styles.distRow}>
                      <Text style={styles.distStar}>{row.stars}</Text>
                      <Ionicons name="star" size={rMS(10)} color={colors.ratingText} />
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.fill,
                            {
                              width: `${Math.round(share * 100)}%`,
                              backgroundColor: colors.ratingText,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.distCount}>{row.count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHead}>
              <Text style={styles.reviewer}>{item.userDisplayName}</Text>
              <Text style={styles.date}>
                {formatReviewDate(item.createdAt, "")}
              </Text>
            </View>
            <ReviewStarsRow rating={item.rating} size={rMS(13)} />
            <Text style={styles.comment}>{item.comment}</Text>

            {item.vendorReply ? (
              <View style={styles.replyCard}>
                <View style={styles.replyHead}>
                  <Ionicons
                    name="storefront-outline"
                    size={rMS(13)}
                    color={colors.textMuted}
                  />
                  <Text style={styles.replyLabel}>Reply from the shop</Text>
                </View>
                <Text style={styles.replyText}>{item.vendorReply}</Text>
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            {isLoadingProductReviews ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={rMS(34)}
                  color={colors.iconMuted}
                />
                <Text style={styles.emptyTitle}>No reviews yet</Text>
                <Text style={styles.emptyBody}>
                  Be the first to review this item after your order arrives.
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.screen },
    content: { paddingHorizontal: rS(16), paddingTop: rV(12), gap: rV(10) },

    summaryCard: {
      flexDirection: "row",
      gap: rS(16),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: rMS(14),
      padding: rS(14),
      marginBottom: rV(6),
    },
    summaryLeft: { alignItems: "center", gap: rV(4), minWidth: rS(84) },
    average: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(30),
      color: colors.text,
    },
    summaryCount: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: colors.textMuted,
    },

    distribution: { flex: 1, justifyContent: "center", gap: rV(4) },
    distRow: { flexDirection: "row", alignItems: "center", gap: rS(5) },
    distStar: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: colors.textMuted,
      width: rS(8),
    },
    track: {
      flex: 1,
      height: rV(5),
      borderRadius: rMS(3),
      backgroundColor: colors.surfaceMuted,
      overflow: "hidden",
    },
    fill: { height: "100%", borderRadius: rMS(3) },
    distCount: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: colors.textMuted,
      width: rS(18),
      textAlign: "right",
    },

    reviewCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: rMS(14),
      padding: rS(14),
      gap: rV(6),
    },
    reviewHead: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: rS(10),
    },
    reviewer: {
      fontFamily: Fonts.textBold,
      fontSize: rMS(14),
      color: colors.text,
      flex: 1,
    },
    date: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: colors.textMuted,
    },
    comment: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      lineHeight: rMS(19),
      color: colors.textBody,
    },

    replyCard: {
      marginTop: rV(4),
      backgroundColor: colors.surfaceMuted,
      borderRadius: rMS(10),
      padding: rS(10),
      gap: rV(4),
    },
    replyHead: { flexDirection: "row", alignItems: "center", gap: rS(5) },
    replyLabel: {
      fontFamily: Fonts.textBold,
      fontSize: rMS(11),
      color: colors.textMuted,
    },
    replyText: {
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      lineHeight: rMS(18),
      color: colors.textBody,
    },

    empty: { alignItems: "center", gap: rV(8), paddingTop: rV(60) },
    emptyTitle: {
      fontFamily: Fonts.textBold,
      fontSize: rMS(15),
      color: colors.text,
    },
    emptyBody: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      color: colors.textMuted,
      textAlign: "center",
      paddingHorizontal: rS(30),
    },
  });
}
