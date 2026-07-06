import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { VendorReturnQueueTab } from "@/types/store";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type VendorReturnQueueTabsProps = {
  activeTab: VendorReturnQueueTab;
  openCount: number;
  resolvedCount: number;
  onChange: (tab: VendorReturnQueueTab) => void;
};

const TABS: Array<{ key: VendorReturnQueueTab; label: string }> = [
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
];

export default function VendorReturnQueueTabs({
  activeTab,
  openCount,
  resolvedCount,
  onChange,
}: VendorReturnQueueTabsProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.shell, { backgroundColor: isDark ? colors.pill : "#F3F4F6" }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const count = tab.key === "open" ? openCount : resolvedCount;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.88}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tab,
              isActive && {
                backgroundColor: isDark ? colors.card : "#FFFFFF",
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? colors.text : colors.textMuted },
                isActive && { fontFamily: Fonts.titleBold },
              ]}
            >
              {tab.label}
            </Text>
            <Text style={[styles.count, { color: isActive ? colors.primary : colors.textMuted }]}>
              {count}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    padding: rS(4),
    borderRadius: rMS(14),
    gap: rS(4),
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(6),
    paddingVertical: rV(10),
    borderRadius: rMS(11),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  label: {
    fontFamily: Fonts.title,
    fontSize: rMS(13),
  },
  count: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
  },
});
