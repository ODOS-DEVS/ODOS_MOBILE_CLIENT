import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { VendorProductCatalogTab } from "@/types/store";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type VendorProductQueueTabsProps = {
  activeTab: VendorProductCatalogTab;
  counts: Record<VendorProductCatalogTab, number>;
  onChange: (tab: VendorProductCatalogTab) => void;
  sortLabel?: string;
  onSortPress?: () => void;
};

const TABS: Array<{ key: VendorProductCatalogTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "pending", label: "Pending" },
  { key: "hidden", label: "Hidden" },
];

export default function VendorProductQueueTabs({
  activeTab,
  counts,
  onChange,
  sortLabel,
  onSortPress,
}: VendorProductQueueTabsProps) {
  const { colors, isDark } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {TABS.map((tab) => {
        const selected = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.88}
            onPress={() => onChange(tab.key)}
            style={[
              styles.chip,
              {
                backgroundColor: selected
                  ? colors.primary
                  : isDark
                    ? colors.surfaceSubtle
                    : colors.card,
                borderColor: selected ? colors.primary : colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.chipLabel, { color: selected ? "#FFFFFF" : colors.text }]}>
              {tab.label}
            </Text>
            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor: selected
                    ? "rgba(255,255,255,0.18)"
                    : isDark
                      ? colors.pill
                      : "#EEF2FF",
                },
              ]}
            >
              <Text
                style={[styles.countText, { color: selected ? "#FFFFFF" : colors.primary }]}
              >
                {counts[tab.key]}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
      {sortLabel && onSortPress ? (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={onSortPress}
          style={[
            styles.chip,
            {
              backgroundColor: isDark ? colors.surfaceSubtle : colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.chipLabel, { color: colors.text }]}>Sort · {sortLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: rS(8),
    paddingVertical: rV(2),
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    paddingHorizontal: rS(14),
    paddingVertical: rV(10),
    borderRadius: rMS(999),
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
  },
  countBadge: {
    minWidth: rS(22),
    height: rS(22),
    borderRadius: rS(11),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(6),
  },
  countText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
  },
});
