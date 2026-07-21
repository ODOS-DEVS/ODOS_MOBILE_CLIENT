import {
  AccountEmptyState,
  AccountFilterChips,
  AccountListCard,
} from "@/components/account/AccountUi";
import {
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { fetchVendorReviews, replyToVendorReview } from "@/services/vendorService";
import type { VendorReview } from "@/types/vendor";
import { resolveApiMediaUrl } from "@/utils/media";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ReviewFilter = "all" | "unanswered";

export default function VendorReviewsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { contentMaxWidth } = useResponsive();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [draftReplies, setDraftReplies] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reviewsCountRef = useRef(0);
  reviewsCountRef.current = reviews.length;

  const load = useCallback(async () => {
    try {
      setError(null);
      const rows = await fetchVendorReviews(session);
      setReviews(rows);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load reviews.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      if (!hasVendorAccess) return undefined;
      if (reviewsCountRef.current === 0) {
        setIsLoading(true);
      }
      void load();
      return undefined;
    }, [hasVendorAccess, load]),
  );

  const visibleReviews = useMemo(
    () => reviews.filter((item) => !item.isHidden),
    [reviews],
  );
  const filteredReviews = useMemo(() => {
    if (filter === "unanswered") {
      return visibleReviews.filter((item) => !item.vendorReply?.trim());
    }
    return visibleReviews;
  }, [filter, visibleReviews]);
  const unansweredCount = useMemo(
    () => visibleReviews.filter((item) => !item.vendorReply?.trim()).length,
    [visibleReviews],
  );
  const avgRating =
    visibleReviews.length > 0
      ? visibleReviews.reduce((sum, item) => sum + item.rating, 0) / visibleReviews.length
      : null;

  const handleReply = async (review: VendorReview) => {
    const reply = (draftReplies[review.id] ?? "").trim();
    if (!reply) {
      showToast("Write a short reply before sending.", "error");
      return;
    }

    setReplyingId(review.id);
    try {
      const updated = await replyToVendorReview(session, review.id, reply);
      setReviews((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setDraftReplies((current) => {
        const next = { ...current };
        delete next[review.id];
        return next;
      });
      showToast("Reply posted.", "success");
    } catch (replyError) {
      showToast(
        replyError instanceof Error ? replyError.message : "Could not post reply.",
        "error",
      );
    } finally {
      setReplyingId(null);
    }
  };

  if (isCheckingVendorAccess || !hasVendorAccess) {
    return <VendorScreenShell title="Reviews" loading loadingLabel="Loading reviews..." />;
  }

  return (
    <VendorScreenShell title="Reviews">
      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              void load();
            }}
          />
        }
        contentContainerStyle={[
          vendorStyles.listContent,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        ListHeaderComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth, gap: rV(12) }]}>
            <VendorPageIntro
              title="Customer feedback"
              subtitle="Ratings left on your products after delivery. Reply to unanswered reviews."
              stats={[
                {
                  value: avgRating ? avgRating.toFixed(1) : "—",
                  label: "Avg rating",
                },
                { value: visibleReviews.length, label: "Reviews" },
                { value: unansweredCount, label: "Unanswered" },
              ]}
              error={error}
            />
            <AccountFilterChips
              options={[
                { key: "all", label: "All" },
                { key: "unanswered", label: "Unanswered" },
              ]}
              activeKey={filter}
              onChange={setFilter}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountEmptyState
              icon="star-outline"
              title={
                isLoading
                  ? "Loading reviews"
                  : error
                    ? "Couldn't load reviews"
                    : filter === "unanswered"
                      ? "All caught up"
                      : "No reviews yet"
              }
              message={
                error ??
                (filter === "unanswered"
                  ? "There are no unanswered reviews right now."
                  : "When shoppers rate your products, their feedback will appear here.")
              }
            />
          </View>
        }
        renderItem={({ item }) => {
          const image = resolveApiMediaUrl(item.productImageUrl);
          const hasReply = Boolean(item.vendorReply?.trim());
          const busy = replyingId === item.id;
          return (
            <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
              <AccountListCard>
                <View style={{ flexDirection: "row", gap: rS(12) }}>
                  <View
                    style={{
                      width: rS(52),
                      height: rS(52),
                      borderRadius: rMS(12),
                      backgroundColor: colors.pill,
                      overflow: "hidden",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {image ? (
                      <Image source={{ uri: image }} style={{ width: "100%", height: "100%" }} />
                    ) : (
                      <Ionicons name="cube-outline" size={rMS(20)} color={colors.iconMuted} />
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                    <Text
                      style={{
                        fontFamily: Fonts.titleBold,
                        fontSize: rMS(14),
                        color: colors.text,
                      }}
                      numberOfLines={1}
                    >
                      {item.productTitle}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Ionicons
                          key={`${item.id}-star-${index}`}
                          name={index < Math.round(item.rating) ? "star" : "star-outline"}
                          size={rMS(13)}
                          color="#F59E0B"
                        />
                      ))}
                      <Text
                        style={{
                          marginLeft: 4,
                          fontFamily: Fonts.text,
                          fontSize: rMS(12),
                          color: colors.textMuted,
                        }}
                      >
                        {item.customerName || "Shopper"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: Fonts.text,
                        fontSize: rMS(13),
                        color: colors.textBody,
                        lineHeight: rMS(18),
                      }}
                    >
                      {item.comment}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.text,
                        fontSize: rMS(11.5),
                        color: colors.textMuted,
                      }}
                    >
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>

                    {hasReply ? (
                      <View
                        style={{
                          marginTop: rV(8),
                          padding: rS(10),
                          borderRadius: rMS(12),
                          backgroundColor: colors.pill,
                          gap: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.textBold,
                            fontSize: rMS(11.5),
                            color: colors.textMuted,
                          }}
                        >
                          Your reply
                          {item.vendorRepliedAt
                            ? ` · ${new Date(item.vendorRepliedAt).toLocaleDateString()}`
                            : ""}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Fonts.text,
                            fontSize: rMS(13),
                            color: colors.textBody,
                            lineHeight: rMS(18),
                          }}
                        >
                          {item.vendorReply}
                        </Text>
                      </View>
                    ) : (
                      <View style={{ marginTop: rV(8), gap: rV(8) }}>
                        <TextInput
                          value={draftReplies[item.id] ?? ""}
                          onChangeText={(text) =>
                            setDraftReplies((current) => ({
                              ...current,
                              [item.id]: text,
                            }))
                          }
                          placeholder="Write a public reply…"
                          placeholderTextColor={colors.textMuted}
                          editable={!busy}
                          multiline
                          style={{
                            minHeight: rV(72),
                            borderWidth: 1,
                            borderColor: colors.inputBorder,
                            backgroundColor: colors.inputBg,
                            borderRadius: rMS(12),
                            paddingHorizontal: rS(12),
                            paddingVertical: rV(10),
                            fontFamily: Fonts.text,
                            fontSize: rMS(13),
                            color: colors.text,
                            textAlignVertical: "top",
                          }}
                        />
                        <TouchableOpacity
                          disabled={busy}
                          onPress={() => void handleReply(item)}
                          style={{
                            alignSelf: "flex-start",
                            backgroundColor: colors.text,
                            borderRadius: rMS(12),
                            paddingHorizontal: rS(14),
                            paddingVertical: rV(10),
                            opacity: busy ? 0.6 : 1,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {busy ? (
                            <ActivityIndicator size="small" color={colors.onPrimary} />
                          ) : null}
                          <Text
                            style={{
                              fontFamily: Fonts.textBold,
                              fontSize: rMS(12.5),
                              color: colors.onPrimary,
                            }}
                          >
                            Reply
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </AccountListCard>
            </View>
          );
        }}
      />
    </VendorScreenShell>
  );
}
