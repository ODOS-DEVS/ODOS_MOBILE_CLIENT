import { SearchBar } from "@/components/SearchBar";
import { AppColors } from "@/constants/Colors";
import { useCommerceSeeAllUiStyles } from "@/styles/themedBrowseStyles";
import { rMS } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
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
  const styles = useCommerceSeeAllUiStyles();
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
  const styles = useCommerceSeeAllUiStyles();
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
  const styles = useCommerceSeeAllUiStyles();

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
  const styles = useCommerceSeeAllUiStyles();

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
  const styles = useCommerceSeeAllUiStyles();

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

export { useCommerceSeeAllScreenStyles } from "@/styles/themedBrowseStyles";
