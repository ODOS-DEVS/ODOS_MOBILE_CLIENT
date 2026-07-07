import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { StoreItem } from "@/hooks/useCommerce";
import { rMS, rS, rV } from "@/styles/responsive";
import { hasStoreCoordinates } from "@/utils/location";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type StoreInfoPanelProps = {
  store: StoreItem;
  horizontalPadding: number;
  onMap?: () => void;
};

function formatAudienceLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function StoreInfoPanel({
  store,
  horizontalPadding,
  onMap,
}: StoreInfoPanelProps) {
  const { colors } = useTheme();

  const locationLine = useMemo(() => {
    const parts = [store.city, store.region].filter(Boolean);
    if (parts.length) {
      return parts.join(", ");
    }
    if (store.address?.trim()) {
      return store.address.trim();
    }
    if (store.distanceKm) {
      return `${store.distanceKm} away`;
    }
    return null;
  }, [store.address, store.city, store.distanceKm, store.region]);

  const tags = useMemo(() => {
    const items: string[] = [];
    if (store.category?.trim()) {
      items.push(store.category.trim());
    }
    if (store.marketSlug?.trim()) {
      items.push(
        store.marketSlug
          .split("-")
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
      );
    }
    store.audienceSlugs?.forEach((slug) => {
      const label = formatAudienceLabel(slug);
      if (label && !items.includes(label)) {
        items.push(label);
      }
    });
    return items;
  }, [store.audienceSlugs, store.category, store.marketSlug]);

  const hasMap =
    Boolean(onMap) &&
    (hasStoreCoordinates(store.latitude, store.longitude) ||
      Boolean(store.address || store.city));

  const hasPhone = Boolean(store.phone?.trim());
  const hasContent = Boolean(locationLine || hasPhone || tags.length);

  if (!hasContent) {
    return null;
  }

  const styles = StyleSheet.create({
    wrap: {
      marginTop: rV(20),
      gap: rV(12),
    },
    eyebrow: {
      fontFamily: Fonts.title,
      fontSize: rMS(11),
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: colors.textMuted,
    },
    card: {
      borderRadius: rMS(16),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.cardBorder,
      backgroundColor: colors.card,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(12),
      paddingHorizontal: rS(14),
      paddingVertical: rV(13),
    },
    rowIcon: {
      width: rS(36),
      height: rS(36),
      borderRadius: rS(12),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.pill,
    },
    rowCopy: {
      flex: 1,
      gap: rV(2),
    },
    rowTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.text,
    },
    rowSubtitle: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
      lineHeight: rMS(17),
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginHorizontal: rS(14),
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: rS(8),
      paddingHorizontal: rS(14),
      paddingBottom: rV(14),
      paddingTop: rV(4),
    },
    tag: {
      paddingHorizontal: rS(10),
      paddingVertical: rV(5),
      borderRadius: 999,
      backgroundColor: colors.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    tagText: {
      fontFamily: Fonts.text,
      fontSize: rMS(11.5),
      color: colors.textSecondary,
    },
  });

  return (
    <View style={[styles.wrap, { paddingHorizontal: horizontalPadding }]}>
      <Text style={styles.eyebrow}>About this store</Text>
      <View style={styles.card}>
        {locationLine ? (
          <>
            {hasMap ? (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.86}
                onPress={onMap}
              >
                <View style={styles.rowIcon}>
                  <Ionicons
                    name="location-outline"
                    size={rMS(18)}
                    color={colors.text}
                  />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>Location</Text>
                  <Text style={styles.rowSubtitle} numberOfLines={2}>
                    {locationLine}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={rMS(16)}
                  color={colors.iconMuted}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Ionicons
                    name="location-outline"
                    size={rMS(18)}
                    color={colors.text}
                  />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>Location</Text>
                  <Text style={styles.rowSubtitle} numberOfLines={2}>
                    {locationLine}
                  </Text>
                </View>
              </View>
            )}
            {hasPhone ? <View style={styles.divider} /> : null}
          </>
        ) : null}

        {hasPhone ? (
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.86}
            onPress={() => void Linking.openURL(`tel:${store.phone!.trim()}`)}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="call-outline" size={rMS(18)} color={colors.text} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Phone</Text>
              <Text style={styles.rowSubtitle}>{store.phone}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={rMS(16)}
              color={colors.iconMuted}
            />
          </TouchableOpacity>
        ) : null}

        {tags.length ? (
          <>
            {(locationLine || hasPhone) && tags.length ? (
              <View style={styles.divider} />
            ) : null}
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}
