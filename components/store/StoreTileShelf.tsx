import CommerceImage from "@/components/media/CommerceImage";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * A row of places to go, not a row of things to buy.
 *
 * The shelves and categories on a storefront used to render their products
 * inline, one horizontal rail of cards per shelf. That reads fine for a shop
 * with two shelves and collapses for a shop with ten: the page becomes a
 * stack of near-identical rails, every rail shows an arbitrary first handful
 * of its contents, and the shopper still cannot see the shape of the shop —
 * which is the one thing a storefront should tell them.
 *
 * A tile answers "what is in here?" and hands off. The products live on the
 * browse screen, which already has search, filters, sorting and paging; the
 * storefront's job is to get you there knowing what you picked.
 *
 * NOTE: never pass a function to `style` in this app — NativeWind owns the JSX
 * runtime and silently drops callback styles. Layout goes on plain Views and
 * press feedback through `activeOpacity`. See components/vendor/VendorRowUi.tsx.
 */

export type StoreTile = {
  key: string;
  label: string;
  /** Optional count, e.g. how many products sit behind the tile. */
  count?: number;
  /** Artwork for the tile; falls back to an icon when absent. */
  imageUrl?: string | null;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

/** How many tiles a shelf shows before deferring to "View all". */
export const STORE_SHELF_TILE_LIMIT = 5;

export default function StoreTileShelf({
  title,
  tiles,
  horizontalPadding,
  onSeeAll,
  maxTiles = STORE_SHELF_TILE_LIMIT,
}: {
  title: string;
  tiles: StoreTile[];
  horizontalPadding: number;
  onSeeAll?: () => void;
  maxTiles?: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  /**
   * A shelf shows a handful, not a catalogue.
   *
   * An unbounded rail invites a shopper to swipe through forty tiles sideways,
   * which is the worst way to read a list — no sense of how far it runs, no
   * way back to one they passed. Capping it keeps the rail a preview and makes
   * "View all" the honest route into the full set, on a screen built to show
   * one.
   */
  const visible = tiles.slice(0, maxTiles);
  const hasMore = tiles.length > visible.length;

  // An empty shelf is not an empty state — a shop with no shelves should look
  // like a shop without shelves, not like one that failed to load them.
  if (tiles.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.headerRow, { paddingHorizontal: horizontalPadding }]}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {onSeeAll && hasMore ? (
          <TouchableOpacity activeOpacity={0.75} onPress={onSeeAll} hitSlop={8}>
            <View style={styles.seeAll}>
              <Text style={styles.seeAllLabel}>See all</Text>
              <Ionicons name="chevron-forward" size={rMS(13)} color={colors.text} />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.rail, { paddingHorizontal: horizontalPadding }]}
      >
        {visible.map((tile) => (
          <TouchableOpacity key={tile.key} activeOpacity={0.82} onPress={tile.onPress}>
            <View style={styles.tile}>
              <View style={styles.art}>
                {tile.imageUrl ? (
                  <CommerceImage
                    source={{ uri: tile.imageUrl }}
                    style={styles.artImage}
                    contentFit="cover"
                    trackingId={`store-tile-${tile.key}`}
                    recyclingKey={tile.imageUrl}
                    placeholderColor={colors.surfaceMuted}
                  />
                ) : (
                  <Ionicons
                    name={tile.icon ?? "grid-outline"}
                    size={rMS(22)}
                    color={colors.iconMuted}
                  />
                )}
              </View>

              <Text style={styles.tileLabel} numberOfLines={2}>
                {tile.label}
              </Text>
              {typeof tile.count === "number" ? (
                <Text style={styles.tileCount} numberOfLines={1}>
                  {tile.count} {tile.count === 1 ? "item" : "items"}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    wrap: { marginTop: rV(18), gap: rV(10) },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: rS(12),
    },
    title: {
      flex: 1,
      fontFamily: Fonts.titleBold,
      fontSize: rMS(17),
      color: colors.text,
    },
    seeAll: { flexDirection: "row", alignItems: "center", gap: rS(2) },
    seeAllLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.text,
    },

    rail: { gap: rS(10), paddingVertical: rV(2) },
    tile: {
      width: rS(116),
      gap: rV(7),
    },
    art: {
      width: rS(116),
      height: rV(84),
      borderRadius: rMS(14),
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.cardBorder,
    },
    artImage: { width: "100%", height: "100%" },
    tileLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12.5),
      lineHeight: rMS(16),
      color: colors.text,
    },
    tileCount: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: colors.textMuted,
    },
  });
}
