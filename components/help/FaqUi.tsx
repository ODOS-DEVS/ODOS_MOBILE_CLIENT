import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Reanimated from "react-native-reanimated";

export type FaqItem = {
  id: string;
  category: FaqCategory;
  title: string;
  description: string[];
};

export type FaqCategory =
  | "All"
  | "Get Started"
  | "Orders"
  | "Delivery"
  | "Payment"
  | "Vouchers"
  | "Returns"
  | "Markets";

export const FAQ_CATEGORIES: { key: FaqCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "All", label: "All", icon: "grid-outline" },
  { key: "Get Started", label: "Account", icon: "person-outline" },
  { key: "Orders", label: "Orders", icon: "cube-outline" },
  { key: "Delivery", label: "Delivery", icon: "bicycle-outline" },
  { key: "Payment", label: "Payment", icon: "card-outline" },
  { key: "Vouchers", label: "Vouchers", icon: "pricetag-outline" },
  { key: "Returns", label: "Returns", icon: "return-down-back-outline" },
  { key: "Markets", label: "Markets", icon: "storefront-outline" },
];

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "Get Started": "person-outline",
  Orders: "cube-outline",
  Delivery: "bicycle-outline",
  Payment: "card-outline",
  Vouchers: "pricetag-outline",
  Returns: "return-down-back-outline",
  Markets: "storefront-outline",
};

type FaqHeroProps = {
  totalCount: number;
  categoryCount: number;
};

export function FaqHero({ totalCount, categoryCount }: FaqHeroProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: rMS(22),
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        inner: {
          paddingHorizontal: rS(18),
          paddingVertical: rV(18),
          gap: rV(10),
        },
        topRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
        },
        iconWrap: {
          width: rMS(48),
          height: rMS(48),
          borderRadius: rMS(16),
          backgroundColor: "rgba(255,255,255,0.85)",
          alignItems: "center",
          justifyContent: "center",
        },
        title: {
          flex: 1,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(18),
          color: colors.text,
        },
        subtitle: {
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(20),
          color: colors.textMuted,
        },
        statsRow: {
          flexDirection: "row",
          gap: rS(10),
          marginTop: rV(4),
        },
        stat: {
          flex: 1,
          backgroundColor: "rgba(255,255,255,0.78)",
          borderRadius: rMS(14),
          paddingVertical: rV(10),
          paddingHorizontal: rS(12),
          alignItems: "center",
        },
        statValue: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(16),
          color: colors.text,
        },
        statLabel: {
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.textMuted,
          marginTop: rV(2),
        },
      }),
    [colors],
  );

  return (
    <Reanimated.View style={styles.wrap}>
      <LinearGradient
        colors={[colors.accentSoft, "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inner}
      >
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="help-buoy-outline" size={rMS(24)} color={colors.primary} />
          </View>
          <Text style={styles.title}>Help center</Text>
        </View>
        <Text style={styles.subtitle}>
          Quick answers for shopping, checkout, delivery, vouchers, and your ODOS account.
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Topics</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{categoryCount}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>AI help</Text>
          </View>
        </View>
      </LinearGradient>
    </Reanimated.View>
  );
}

type FaqSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function FaqSearchBar({ value, onChangeText }: FaqSearchBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(10),
          backgroundColor: colors.card,
          borderRadius: rMS(18),
          paddingHorizontal: rS(14),
          paddingVertical: rV(13),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        },
        input: {
          flex: 1,
          fontFamily: Fonts.text,
          fontSize: rMS(14),
          color: colors.text,
          padding: 0,
        },
      }),
    [colors],
  );

  return (
    <Reanimated.View style={styles.wrap}>
      <Ionicons name="search-outline" size={rMS(18)} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search questions, e.g. delivery, voucher…"
        placeholderTextColor={colors.placeholder}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value.length > 0 && Platform.OS === "android" ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <Ionicons name="close-circle" size={rMS(18)} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </Reanimated.View>
  );
}

type FaqCategoryChipsProps = {
  activeKey: FaqCategory;
  onChange: (key: FaqCategory) => void;
  counts: Record<string, number>;
};

export function FaqCategoryChips({ activeKey, onChange, counts }: FaqCategoryChipsProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          marginHorizontal: -rS(4),
        },
        content: {
          paddingHorizontal: rS(4),
          gap: rS(8),
          paddingVertical: rV(2),
        },
        chip: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          paddingHorizontal: rS(12),
          paddingVertical: rV(9),
          borderRadius: 999,
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        chipActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        chipText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.textSecondary,
        },
        chipTextActive: {
          color: "#FFFFFF",
        },
        badge: {
          minWidth: rMS(18),
          height: rMS(18),
          borderRadius: 999,
          backgroundColor: colors.surfaceMuted,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: rS(5),
        },
        badgeActive: {
          backgroundColor: "rgba(255,255,255,0.22)",
        },
        badgeText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10),
          color: colors.textMuted,
        },
        badgeTextActive: {
          color: "#FFFFFF",
        },
      }),
    [colors],
  );

  return (
    <Reanimated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {FAQ_CATEGORIES.map((item, index) => {
        const active = activeKey === item.key;
        const count = counts[item.key] ?? 0;
        return (
          <Reanimated.View key={item.key}>
            <Pressable
              style={[styles.chip, active ? styles.chipActive : null]}
              onPress={() => onChange(item.key)}
            >
              <Ionicons
                name={item.icon}
                size={rMS(14)}
                color={active ? "#FFFFFF" : colors.textMuted}
              />
              <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
                {item.label}
              </Text>
              <View style={[styles.badge, active ? styles.badgeActive : null]}>
                <Text style={[styles.badgeText, active ? styles.badgeTextActive : null]}>
                  {count}
                </Text>
              </View>
            </Pressable>
          </Reanimated.View>
        );
      })}
    </Reanimated.ScrollView>
  );
}

type FaqAccordionItemProps = {
  item: FaqItem;
  expanded: boolean;
  onToggle: () => void;
  index: number;
};

export function FaqAccordionItem({ item, expanded, onToggle, index }: FaqAccordionItemProps) {
  const { colors } = useTheme();
  const icon = CATEGORY_ICONS[item.category] ?? "help-circle-outline";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: rMS(18),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: expanded ? colors.primary : colors.border,
          overflow: "hidden",
          shadowColor: colors.shadow,
          shadowOpacity: expanded ? 0.08 : 0.04,
          shadowRadius: expanded ? 12 : 6,
          shadowOffset: { width: 0, height: expanded ? 4 : 2 },
          elevation: expanded ? 4 : 2,
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
          paddingHorizontal: rS(14),
          paddingVertical: rV(14),
        },
        iconShell: {
          width: rMS(36),
          height: rMS(36),
          borderRadius: rMS(12),
          backgroundColor: expanded ? colors.accentSoft : colors.surfaceMuted,
          alignItems: "center",
          justifyContent: "center",
        },
        copy: {
          flex: 1,
          gap: rV(3),
        },
        category: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10),
          color: colors.primary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14),
          lineHeight: rMS(20),
          color: colors.text,
        },
        body: {
          paddingHorizontal: rS(14),
          paddingBottom: rV(14),
          paddingTop: rV(2),
          gap: rV(8),
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          marginHorizontal: rS(14),
          paddingLeft: rS(48),
        },
        bulletRow: {
          flexDirection: "row",
          gap: rS(8),
        },
        bullet: {
          width: rMS(5),
          height: rMS(5),
          borderRadius: 999,
          backgroundColor: colors.primary,
          marginTop: rV(7),
        },
        bodyText: {
          flex: 1,
          fontFamily: Fonts.text,
          fontSize: rMS(13.5),
          lineHeight: rMS(20),
          color: colors.textMuted,
        },
      }),
    [colors, expanded],
  );

  const handleToggle = () => {
    onToggle();
  };

  return (
    <Reanimated.View>
      <Pressable style={styles.wrap} onPress={handleToggle}>
        <View style={styles.header}>
          <View style={styles.iconShell}>
            <Ionicons
              name={icon}
              size={rMS(18)}
              color={expanded ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={styles.copy}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.title}>{item.title}</Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={rMS(18)}
            color={colors.textMuted}
          />
        </View>
        {expanded ? (
          <View style={styles.body}>
            {item.description.map((line) => (
              <View key={line} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bodyText}>{line}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Pressable>
    </Reanimated.View>
  );
}

type FaqSectionHeaderProps = {
  title: string;
};

export function FaqSectionHeader({ title }: FaqSectionHeaderProps) {
  const { colors } = useTheme();
  const icon = CATEGORY_ICONS[title] ?? "folder-outline";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: rS(8),
        marginTop: rV(14),
        marginBottom: rV(8),
      }}
    >
      <Ionicons name={icon} size={rMS(16)} color={colors.primary} />
      <Text
        style={{
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.text,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

export function FaqStillNeedHelp() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginTop: rV(20),
          borderRadius: rMS(20),
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        inner: {
          padding: rS(16),
          gap: rV(12),
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(16),
          color: colors.text,
        },
        subtitle: {
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(19),
          color: colors.textMuted,
        },
        actions: {
          flexDirection: "row",
          gap: rS(10),
        },
        primaryBtn: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(6),
          backgroundColor: colors.primary,
          borderRadius: rMS(14),
          paddingVertical: rV(12),
        },
        primaryText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: "#FFFFFF",
        },
        secondaryBtn: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(6),
          backgroundColor: colors.card,
          borderRadius: rMS(14),
          paddingVertical: rV(12),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        secondaryText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.text,
        },
      }),
    [colors],
  );

  return (
    <Reanimated.View style={styles.wrap}>
      <LinearGradient
        colors={["#FFFFFF", colors.accentSoft]}
        style={styles.inner}
      >
        <Text style={styles.title}>Still need help?</Text>
        <Text style={styles.subtitle}>
          Ask the ODOS Assistant for personal answers, or chat with our support team.
        </Text>
        <View style={styles.actions}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push("/screens/assistant" as any)}
          >
            <Ionicons name="sparkles" size={rMS(16)} color="#FFFFFF" />
            <Text style={styles.primaryText}>AI Assistant</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() =>
              router.push("/screens/profileScreens/helpAndSupport/GetHelp" as any)
            }
          >
            <Ionicons name="headset-outline" size={rMS(16)} color={colors.text} />
            <Text style={styles.secondaryText}>Get Help</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </Reanimated.View>
  );
}

export function FaqEmptyState({ onClear }: { onClear: () => void }) {
  const { colors } = useTheme();

  return (
    <Reanimated.View
      style={{
        alignItems: "center",
        paddingVertical: rV(36),
        paddingHorizontal: rS(24),
        gap: rV(10),
      }}
    >
      <View
        style={{
          width: rMS(56),
          height: rMS(56),
          borderRadius: rMS(18),
          backgroundColor: colors.surfaceMuted,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="search-outline" size={rMS(26)} color={colors.textMuted} />
      </View>
      <Text
        style={{
          fontFamily: Fonts.titleBold,
          fontSize: rMS(16),
          color: colors.text,
          textAlign: "center",
        }}
      >
        No answers found
      </Text>
      <Text
        style={{
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(20),
          color: colors.textMuted,
          textAlign: "center",
        }}
      >
        Try a different keyword or browse another category.
      </Text>
      <Pressable
        onPress={onClear}
        style={{
          marginTop: rV(6),
          paddingHorizontal: rS(16),
          paddingVertical: rV(10),
          borderRadius: 999,
          backgroundColor: colors.primary,
        }}
      >
        <Text style={{ fontFamily: Fonts.titleBold, fontSize: rMS(13), color: "#FFFFFF" }}>
          Clear filters
        </Text>
      </Pressable>
    </Reanimated.View>
  );
}

type UseFaqAccordionResult = {
  expandedId: string | null;
  toggle: (id: string) => void;
  collapseAll: () => void;
};

export function useFaqAccordion(): UseFaqAccordionResult {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedId(null);
  }, []);

  return { expandedId, toggle, collapseAll };
}

export function groupFaqByCategory(items: FaqItem[]): { category: string; items: FaqItem[] }[] {
  const map = new Map<string, FaqItem[]>();
  for (const item of items) {
    const list = map.get(item.category) ?? [];
    list.push(item);
    map.set(item.category, list);
  }
  return Array.from(map.entries()).map(([category, grouped]) => ({
    category,
    items: grouped,
  }));
}

export function buildFaqCounts(items: FaqItem[]): Record<string, number> {
  const counts: Record<string, number> = { All: items.length };
  for (const item of items) {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }
  return counts;
}

export function filterFaqItems(
  items: FaqItem[],
  selectedFilter: FaqCategory,
  query: string,
): FaqItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesFilter =
      selectedFilter === "All" ||
      item.category.toLowerCase() === selectedFilter.toLowerCase();
    const matchesQuery =
      !normalizedQuery ||
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery) ||
      item.description.some((line) => line.toLowerCase().includes(normalizedQuery));
    return matchesFilter && matchesQuery;
  });
}

/** Reset expanded accordion when filters change */
export function useResetOnFilterChange(
  reset: () => void,
  selectedFilter: FaqCategory,
  query: string,
) {
  useEffect(() => {
    reset();
  }, [query, reset, selectedFilter]);
}
