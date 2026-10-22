import VendorListSearch from "@/components/vendor/VendorListSearch";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * One header for all three vendor lists.
 *
 * It replaces a stats card stacked on top of three separate rows of pills.
 * Those rows each carried their own "All …" chip, so the screen opened with
 * four near-identical controls and a panel of numbers before a single row of
 * real content — and on Orders and Products the panel ended up clipped behind
 * the pinned bar.
 *
 * Two observations collapsed it:
 *
 *   1. The stats card was saying what the chips already say. "3 SKUs · 0 Low ·
 *      0 Out" is the same information as `All 3`, `Low 0`, `Out 0`. The chips
 *      are the stats, so the card went.
 *   2. Sort and category are *settings*, not navigation. They belong in the
 *      sheet behind a label that shows the current value, not as two more rows
 *      of pills competing with the one axis that matters.
 *
 * What is left is search, one row of status chips, and a quiet context line.
 */

export type VendorHeaderChip = {
  key: string;
  label: string;
  count?: number;
  /** Tints the chip when its count is non-zero — used for "needs you". */
  urgent?: boolean;
};

export default function VendorListHeader({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  chips,
  activeChip,
  onChipChange,
  summary,
  controls,
  error,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  chips: VendorHeaderChip[];
  activeChip: string;
  onChipChange: (key: string) => void;
  /** Left side of the context line, e.g. "12 products". */
  summary: string;
  /**
   * Right side: small text buttons for sort, category, select.
   *
   * `icon` overrides the default chevron — a dropdown affordance is right for
   * a setting that opens a picker, and wrong for an action like "Export" that
   * simply happens.
   */
  controls?: {
    label: string;
    onPress: () => void;
    active?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
  }[];
  /** Shown as a quiet inline line — a failed fetch must not be silent. */
  error?: string | null;
}) {
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: rV(12) },
        chipRow: { gap: rS(8), paddingRight: rS(4) },
        chip: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(7),
          paddingHorizontal: rS(14),
          paddingVertical: rV(9),
          borderRadius: 999,
          borderWidth: StyleSheet.hairlineWidth,
        },
        chipLabel: { fontFamily: Fonts.titleBold, fontSize: rMS(12.5) },
        chipCount: { fontFamily: Fonts.titleBold, fontSize: rMS(11), opacity: 0.75 },
        contextRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: rS(10),
        },
        summary: {
          flexShrink: 1,
          fontFamily: Fonts.title,
          fontSize: rMS(12),
          color: colors.textMuted,
        },
        controls: {
          flexShrink: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: rS(14),
        },
        errorRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(7),
          paddingHorizontal: rS(12),
          paddingVertical: rV(9),
          borderRadius: rMS(11),
          backgroundColor: colors.dangerSoft,
        },
        errorText: {
          flex: 1,
          fontFamily: Fonts.title,
          fontSize: rMS(12),
          color: colors.dangerText,
        },
        control: { flexShrink: 1, flexDirection: "row", alignItems: "center", gap: rS(3) },
        controlLabel: { fontFamily: Fonts.titleBold, fontSize: rMS(12) },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <VendorListSearch
        value={searchValue}
        onChangeText={onSearchChange}
        placeholder={searchPlaceholder}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        keyboardShouldPersistTaps="handled"
      >
        {chips.map((chip) => {
          const selected = activeChip === chip.key;
          const urgent = Boolean(chip.urgent && (chip.count ?? 0) > 0);
          return (
            <TouchableOpacity
              key={chip.key}
              activeOpacity={0.85}
              onPress={() => onChipChange(chip.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected
                    ? colors.inverseSurface
                    : urgent
                      ? colors.dangerSoft
                      : isDark
                        ? colors.surfaceSubtle
                        : colors.card,
                  borderColor: selected
                    ? colors.inverseSurface
                    : urgent
                      ? colors.dangerText
                      : colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  {
                    color: selected
                      ? colors.onInverseSurface
                      : urgent
                        ? colors.dangerText
                        : colors.text,
                  },
                ]}
              >
                {chip.label}
              </Text>
              {typeof chip.count === "number" ? (
                <Text
                  style={[
                    styles.chipCount,
                    {
                      color: selected
                        ? colors.onInverseSurface
                        : urgent
                          ? colors.dangerText
                          : colors.textMuted,
                    },
                  ]}
                >
                  {chip.count}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={rMS(14)} color={colors.dangerText} />
          <Text style={styles.errorText} numberOfLines={2}>
            {error}
          </Text>
        </View>
      ) : null}

      <View style={styles.contextRow}>
        <Text style={styles.summary} numberOfLines={1}>
          {summary}
        </Text>
        {controls?.length ? (
          <View style={styles.controls}>
            {controls.map((control) => (
              <TouchableOpacity
                key={control.label}
                style={styles.control}
                activeOpacity={0.75}
                onPress={control.onPress}
              >
                <Text
                  style={[
                    styles.controlLabel,
                    { color: control.active ? colors.text : colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {control.label}
                </Text>
                <Ionicons
                  name={control.icon ?? "chevron-down"}
                  size={rMS(12)}
                  color={control.active ? colors.text : colors.iconMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
