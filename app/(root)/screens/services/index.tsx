import CommerceImage from "@/components/media/CommerceImage";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import {
  fetchServiceCategories,
  searchServices,
} from "@/services/serviceMarketplaceService";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import {
  formatPriceLabel,
  type ServiceCategory,
  type ServiceSummary,
} from "@/types/service";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * Services discovery.
 *
 * Deliberately the same shape as the product browse screens — a search
 * field, a row of category chips, then a list — because a shopper should
 * not have to learn a second way to look for things. The only structural
 * difference is the price label, which has to say *how* a service is
 * priced: "From ₵200" and "₵200 / hour" are different promises, and showing
 * either as a bare "₵200" misleads.
 */

const PAGE_SIZE = 20;

export default function ServicesDiscoveryScreen() {
  const { colors } = useTheme();
  const { horizontalPadding } = useResponsive();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({ append = false }: { append?: boolean } = {}) => {
      try {
        setError(null);
        const offset = append ? services.length : 0;
        const results = await searchServices(
          {
            query: query.trim() || undefined,
            categoryId: activeCategory ?? undefined,
          },
          { limit: PAGE_SIZE, offset },
        );
        setHasMore(results.length === PAGE_SIZE);
        setServices((current) => (append ? [...current, ...results] : results));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "We couldn't load services.",
        );
      }
    },
    [activeCategory, query, services.length],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await fetchServiceCategories();
        if (!cancelled) {
          setCategories(list);
        }
      } catch {
        // Categories are navigation, not content: the list below still
        // works without them, so a failure here is not worth an error state.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced: a keystroke should not be a request.
  //
  // The spinner is raised inside the timer rather than at effect entry.
  // Setting it synchronously in the effect body triggers a second render
  // pass before the first has painted -- the cascade the compiler's
  // set-state-in-effect rule exists to catch -- and it made the list flash
  // a spinner on every keystroke even when the request was debounced away.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      void load().finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCategory]);

  const renderCard = useCallback(
    ({ item }: { item: ServiceSummary }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: "/(root)/screens/services/[serviceId]" as never,
            params: { serviceId: item.id },
          })
        }
      >
        <View style={styles.card}>
          <View style={styles.thumb}>
            {item.imageUrl ? (
              <CommerceImage
                source={{ uri: item.imageUrl }}
                style={styles.thumbImage}
                contentFit="cover"
                trackingId={`service-${item.id}`}
                recyclingKey={item.imageUrl}
                placeholderColor={colors.imagePlaceholder}
              />
            ) : (
              <Ionicons
                name="construct-outline"
                size={rMS(20)}
                color={colors.iconMuted}
              />
            )}
          </View>

          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.summary ? (
              <Text style={styles.cardSummary} numberOfLines={1}>
                {item.summary}
              </Text>
            ) : null}
            <View style={styles.cardMeta}>
              <Text style={styles.cardPrice}>{formatPriceLabel(item)}</Text>
              {item.rating ? (
                <>
                  <Text style={styles.dim}>·</Text>
                  <Ionicons name="star" size={rMS(11)} color={colors.warningText} />
                  <Text style={styles.dim}>
                    {item.rating.toFixed(1)} ({item.reviewCount})
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.dim}>·</Text>
                  <Text style={styles.dim}>New</Text>
                </>
              )}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={rMS(16)} color={colors.iconMuted} />
        </View>
      </TouchableOpacity>
    ),
    [colors, styles],
  );

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Services" />

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: rV(32) }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              void load().finally(() => setIsRefreshing(false));
            }}
          />
        }
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasMore && !isLoadingMore && !isLoading) {
            setIsLoadingMore(true);
            void load({ append: true }).finally(() => setIsLoadingMore(false));
          }
        }}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={rMS(16)} color={colors.iconMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search services or providers"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                returnKeyType="search"
              />
              {query ? (
                <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={rMS(16)} color={colors.iconMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {categories.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
                keyboardShouldPersistTaps="handled"
              >
                <CategoryChip
                  label="All"
                  active={activeCategory === null}
                  onPress={() => setActiveCategory(null)}
                  styles={styles}
                  colors={colors}
                />
                {categories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    label={category.title}
                    active={activeCategory === category.id}
                    onPress={() =>
                      setActiveCategory(
                        activeCategory === category.id ? null : category.id,
                      )
                    }
                    styles={styles}
                    colors={colors}
                  />
                ))}
              </ScrollView>
            ) : null}

            {error ? (
              <View style={styles.errorRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={rMS(14)}
                  color={colors.dangerText}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centre}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.centre}>
              <Text style={styles.emptyTitle}>
                {query.trim() ? "No services match that" : "No services yet"}
              </Text>
              <Text style={styles.emptyBody}>
                {query.trim()
                  ? "Try a different search, or clear the filters."
                  : "Service providers will appear here as they join."}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : undefined
        }
      />
    </View>
  );
}

function CategoryChip({
  label,
  active,
  onPress,
  styles,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View
        style={[
          styles.chip,
          {
            backgroundColor: active ? colors.inverseSurface : colors.card,
            borderColor: active ? colors.inverseSurface : colors.cardBorder,
          },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            { color: active ? colors.onInverseSurface : colors.text },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.screen },

    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(8),
      paddingHorizontal: rS(14),
      paddingVertical: rV(11),
      borderRadius: rMS(12),
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.cardBorder,
      marginTop: rV(10),
    },
    searchInput: {
      flex: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(13.5),
      color: colors.text,
      padding: 0,
    },

    chipRow: { gap: rS(8), paddingVertical: rV(14) },
    chip: {
      paddingHorizontal: rS(14),
      paddingVertical: rV(8),
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    chipText: { fontFamily: Fonts.titleBold, fontSize: rMS(12.5) },

    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(12),
      paddingHorizontal: rS(16),
      paddingVertical: rV(12),
      backgroundColor: colors.card,
    },
    thumb: {
      width: rMS(52),
      height: rMS(52),
      borderRadius: rMS(12),
      backgroundColor: colors.imagePlaceholder,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    thumbImage: { width: "100%", height: "100%" },
    cardCopy: { flex: 1, minWidth: 0, gap: rV(3) },
    cardTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: colors.text,
    },
    cardSummary: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
    },
    cardMeta: { flexDirection: "row", alignItems: "center", gap: rS(5) },
    cardPrice: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12.5),
      color: colors.text,
    },
    dim: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
    },

    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: rS(16),
    },

    centre: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: rV(64),
      paddingHorizontal: rS(32),
      gap: rV(6),
    },
    emptyTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(15),
      color: colors.text,
    },
    emptyBody: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      lineHeight: rMS(19),
      color: colors.textMuted,
      textAlign: "center",
    },
    footer: { paddingVertical: rV(20), alignItems: "center" },

    errorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(7),
      paddingHorizontal: rS(12),
      paddingVertical: rV(9),
      borderRadius: rMS(11),
      backgroundColor: colors.dangerSoft,
      marginBottom: rV(10),
    },
    errorText: {
      flex: 1,
      fontFamily: Fonts.title,
      fontSize: rMS(12),
      color: colors.dangerText,
    },
  });
}
