import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import type { ActiveStoreFilter, ActiveStoreFilterKind } from "@/utils/storeProductBrowse";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * The filters currently narrowing the grid, each removable in one tap.
 *
 * Renders nothing when nothing is applied, so an unfiltered store shows no
 * extra row at all — the browse screen stays as short as it can be and only
 * grows when there is something to say.
 */
export default function StoreActiveFilterPills({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: ActiveStoreFilter[];
  onRemove: (kind: ActiveStoreFilterKind) => void;
  onClearAll: () => void;
}) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          alignItems: "center",
          gap: rS(8),
          paddingRight: rS(4),
        },
        pill: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          borderRadius: 999,
          paddingLeft: rS(12),
          paddingRight: rS(8),
          paddingVertical: rV(7),
          backgroundColor: colors.accentSoft,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primary,
        },
        pillText: {
          fontFamily: Fonts.title,
          fontSize: rMS(11.5),
          color: colors.text,
          maxWidth: rS(140),
        },
        clear: {
          paddingHorizontal: rS(10),
          paddingVertical: rV(7),
        },
        clearText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11.5),
          color: colors.primary,
        },
      }),
    [colors],
  );

  if (filters.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.kind}
          style={styles.pill}
          activeOpacity={0.82}
          onPress={() => onRemove(filter.kind)}
          accessibilityRole="button"
          accessibilityLabel={`Remove filter: ${filter.label}`}
        >
          <Text style={styles.pillText} numberOfLines={1}>
            {filter.label}
          </Text>
          <Ionicons name="close-circle" size={rMS(15)} color={colors.primary} />
        </TouchableOpacity>
      ))}

      {filters.length > 1 ? (
        <TouchableOpacity style={styles.clear} activeOpacity={0.75} onPress={onClearAll}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}
    </ScrollView>
  );
}
