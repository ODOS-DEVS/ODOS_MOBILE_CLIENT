import { SearchBar } from "@/components/SearchBar";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type CommerceSeeAllSearchProps = React.ComponentProps<typeof SearchBar>;

export function CommerceSeeAllSearch({
  containerStyle,
  ...props
}: CommerceSeeAllSearchProps) {
  const mergedStyle: StyleProp<ViewStyle> = containerStyle
    ? [styles.searchBar, containerStyle]
    : styles.searchBar;

  return (
    <SearchBar
      embedded
      size="large"
      containerStyle={mergedStyle as ViewStyle}
      {...props}
    />
  );
}

type HeroStat = {
  label: string;
  value: string | number;
};

type CommerceSeeAllHeroProps = {
  badgeIcon?: keyof typeof Ionicons.glyphMap;
  badgeLabel: string;
  title: string;
  subtitle: string;
  stats?: HeroStat[];
  accent?: "default" | "gold" | "teal";
};

export function CommerceSeeAllHero({
  badgeIcon = "sparkles-outline",
  badgeLabel,
  title,
  subtitle,
  stats = [],
  accent = "default",
}: CommerceSeeAllHeroProps) {
  const badgeStyle =
    accent === "gold"
      ? styles.heroBadgeGold
      : accent === "teal"
        ? styles.heroBadgeTeal
        : styles.heroBadgeDefault;
  const badgeTextStyle =
    accent === "gold"
      ? styles.heroBadgeTextGold
      : accent === "teal"
        ? styles.heroBadgeTextTeal
        : styles.heroBadgeTextDefault;

  return (
    <View style={styles.heroCard}>
      <View style={[styles.heroBadge, badgeStyle]}>
        <Ionicons
          name={badgeIcon}
          size={rMS(14)}
          color={
            accent === "gold" ? "#8A6A2E" : accent === "teal" ? "#0F766E" : AppColors.primary
          }
        />
        <Text style={[styles.heroBadgeText, badgeTextStyle]}>{badgeLabel}</Text>
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
      {stats.length > 0 ? (
        <View style={styles.heroStatsRow}>
          {stats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              {index > 0 ? <View style={styles.heroDivider} /> : null}
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{stat.value}</Text>
                <Text style={styles.heroStatLabel}>{stat.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export type CommerceFilterChip = {
  key: string;
  label: string;
  count?: number;
};

type CommerceFilterChipsProps = {
  chips: CommerceFilterChip[];
  activeKey: string;
  onChange: (key: string) => void;
  trailingAction?: { label: string; onPress: () => void };
  style?: ViewStyle;
};

export function CommerceFilterChips({
  chips,
  activeKey,
  onChange,
  trailingAction,
  style,
}: CommerceFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.filterRow, style]}
    >
      {chips.map((chip) => {
        const selected = chip.key === activeKey;
        return (
          <TouchableOpacity
            key={chip.key}
            activeOpacity={0.88}
            onPress={() => onChange(chip.key)}
            style={[styles.filterChip, selected && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterChipText,
                selected && styles.filterChipTextActive,
              ]}
            >
              {chip.label}
            </Text>
            {typeof chip.count === "number" ? (
              <View
                style={[
                  styles.filterCountPill,
                  selected && styles.filterCountPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    selected && styles.filterCountTextActive,
                  ]}
                >
                  {chip.count}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
      {trailingAction ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={trailingAction.onPress}
          style={styles.resetChip}
        >
          <Text style={styles.resetChipLabel}>{trailingAction.label}</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

type CommerceSeeAllSectionHeaderProps = {
  title: string;
  subtitle?: string;
  count?: number;
};

export function CommerceSeeAllSectionHeader({
  title,
  subtitle,
  count,
}: CommerceSeeAllSectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {typeof count === "number" ? (
        <View style={styles.sectionCountPill}>
          <Text style={styles.sectionCountText}>{count}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function CommerceSeeAllEmptyState({
  icon = "search-outline",
  title,
  subtitle,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name={icon} size={rMS(22)} color={AppColors.subtext[100]} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

export const commerceSeeAllScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    paddingTop: rV(10),
    gap: rV(14),
  },
  contentBlock: {
    gap: rV(12),
  },
});

const styles = StyleSheet.create({
  searchBar: {
    marginTop: 0,
    width: "100%",
  },
  heroCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(20),
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
    borderRadius: rS(999),
  },
  heroBadgeDefault: {
    backgroundColor: "#EEF2F6",
  },
  heroBadgeGold: {
    backgroundColor: "#F6EFE1",
  },
  heroBadgeTeal: {
    backgroundColor: "#E6F6F3",
  },
  heroBadgeText: {
    fontSize: rMS(11),
    fontFamily: Fonts.title,
    letterSpacing: 0.25,
  },
  heroBadgeTextDefault: {
    color: AppColors.primary,
  },
  heroBadgeTextGold: {
    color: "#8A6A2E",
  },
  heroBadgeTextTeal: {
    color: "#0F766E",
  },
  heroTitle: {
    marginTop: rV(12),
    fontSize: rMS(18),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
    lineHeight: rMS(24),
  },
  heroSubtitle: {
    marginTop: rV(8),
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(19),
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rV(16),
    gap: rS(8),
  },
  heroStat: {
    flex: 1,
  },
  heroStatValue: {
    fontSize: rMS(16),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  heroStatLabel: {
    marginTop: rV(4),
    fontSize: rMS(11),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  heroDivider: {
    width: 1,
    height: rV(28),
    backgroundColor: "#E2E8F0",
  },
  filterRow: {
    paddingVertical: rV(2),
    gap: rS(10),
    paddingRight: rS(4),
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    paddingHorizontal: rS(14),
    paddingVertical: rV(10),
    borderRadius: rS(999),
    backgroundColor: AppColors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D9E0E8",
  },
  filterChipActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  filterChipText: {
    fontSize: rMS(12.5),
    fontFamily: Fonts.title,
    color: AppColors.secondary,
  },
  filterChipTextActive: {
    color: AppColors.white,
  },
  filterCountPill: {
    minWidth: rS(24),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rS(999),
    paddingHorizontal: rS(8),
    paddingVertical: rV(2),
    backgroundColor: "#F3F5F8",
  },
  filterCountPillActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  filterCountText: {
    fontSize: rMS(11),
    fontFamily: Fonts.titleBold,
    color: AppColors.secondary,
  },
  filterCountTextActive: {
    color: AppColors.white,
  },
  resetChip: {
    paddingHorizontal: rS(14),
    paddingVertical: rV(10),
    borderRadius: rS(999),
    backgroundColor: "transparent",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#CBD5E1",
  },
  resetChipLabel: {
    fontSize: rMS(12.5),
    fontFamily: Fonts.title,
    color: AppColors.secondary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(12),
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: rMS(17),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  sectionSubtitle: {
    marginTop: rV(4),
    fontSize: rMS(12.5),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(18),
  },
  sectionCountPill: {
    minWidth: rS(36),
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
    borderRadius: rS(999),
    backgroundColor: "#EEF2F6",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCountText: {
    fontSize: rMS(13),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  emptyState: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(18),
    paddingVertical: rV(28),
    paddingHorizontal: rS(18),
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
  },
  emptyIconWrap: {
    width: rMS(48),
    height: rMS(48),
    borderRadius: rMS(24),
    backgroundColor: "#F3F5F8",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: rV(12),
    fontSize: rMS(15),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: rV(7),
    fontSize: rMS(12.5),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    textAlign: "center",
    lineHeight: rMS(18),
  },
});
