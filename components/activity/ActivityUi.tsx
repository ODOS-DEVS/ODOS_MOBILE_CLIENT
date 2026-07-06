import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { ActivityItem } from "@/hooks/useActivityFeed";
import { rMS, rS, rV } from "@/styles/responsive";
import { activityKindUsesProductImage } from "@/utils/activityImages";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Reanimated, {
  FadeInDown,
  FadeInRight,
  ZoomIn,
} from "react-native-reanimated";

export type ActivityFilter = "all" | "unread";

function activityAccentStyles(
  accent: ActivityItem["accent"],
  isDark: boolean,
) {
  if (accent === "success") {
    return {
      iconBg: isDark ? "#14532D" : "#ECFDF3",
      iconColor: isDark ? "#86EFAC" : "#15803D",
      stripe: isDark ? "#22C55E" : "#86EFAC",
    };
  }
  if (accent === "warning") {
    return {
      iconBg: isDark ? "#422006" : "#FFF7ED",
      iconColor: isDark ? "#FCD34D" : "#B45309",
      stripe: isDark ? "#F59E0B" : "#FCD34D",
    };
  }
  return {
    iconBg: isDark ? "#1E293B" : "#EEF2FF",
    iconColor: isDark ? "#93C5FD" : "#4F46E5",
    stripe: isDark ? "#60A5FA" : "#93C5FD",
  };
}

type ActivityHeroProps = {
  totalCount: number;
  unreadCount: number;
};

export function ActivityHero({ totalCount, unreadCount }: ActivityHeroProps) {
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
          backgroundColor: "rgba(255,255,255,0.88)",
          alignItems: "center",
          justifyContent: "center",
        },
        copy: {
          flex: 1,
          gap: rV(2),
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(18),
          color: colors.text,
        },
        subtitle: {
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(19),
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
          paddingHorizontal: rS(10),
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
    <Reanimated.View entering={FadeInDown.duration(300)} style={styles.wrap}>
      <LinearGradient
        colors={[colors.accentSoft, "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inner}
      >
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="notifications" size={rMS(24)} color={colors.primary} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>Your activity</Text>
            <Text style={styles.subtitle}>
              {unreadCount > 0
                ? `${unreadCount} fresh update${unreadCount === 1 ? "" : "s"} waiting for you`
                : "You're all caught up — nice work!"}
            </Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Math.max(0, totalCount - unreadCount)}</Text>
            <Text style={styles.statLabel}>Read</Text>
          </View>
        </View>
      </LinearGradient>
    </Reanimated.View>
  );
}

type ActivityMarkAllReadProps = {
  unreadCount: number;
  onPress: () => void;
  disabled?: boolean;
};

export function ActivityMarkAllRead({
  unreadCount,
  onPress,
  disabled = false,
}: ActivityMarkAllReadProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: rS(10),
          backgroundColor: colors.card,
          borderRadius: rMS(18),
          paddingHorizontal: rS(14),
          paddingVertical: rV(12),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        },
        left: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: rS(10),
        },
        emojiBubble: {
          width: rMS(36),
          height: rMS(36),
          borderRadius: rMS(12),
          backgroundColor: colors.accentSoft,
          alignItems: "center",
          justifyContent: "center",
        },
        emoji: {
          fontSize: rMS(18),
        },
        copy: {
          flex: 1,
          gap: rV(2),
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.text,
        },
        subtitle: {
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          color: colors.textMuted,
        },
        btn: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(5),
          paddingHorizontal: rS(12),
          paddingVertical: rV(9),
          borderRadius: 999,
          backgroundColor: colors.primary,
        },
        btnDisabled: {
          opacity: 0.55,
        },
        btnText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: "#FFFFFF",
        },
        caughtUp: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          paddingHorizontal: rS(12),
          paddingVertical: rV(9),
          borderRadius: 999,
          backgroundColor: colors.successSoft,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.successBorder,
        },
        caughtUpText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.successText,
        },
      }),
    [colors],
  );

  const handlePress = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPress();
  };

  if (unreadCount === 0) {
    return (
      <Reanimated.View entering={FadeInDown.delay(80).duration(280)} style={styles.wrap}>
        <View style={styles.left}>
          <View style={styles.emojiBubble}>
            <Text style={styles.emoji}>✨</Text>
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>Inbox zero</Text>
            <Text style={styles.subtitle}>Every update has been read</Text>
          </View>
        </View>
        <View style={styles.caughtUp}>
          <Ionicons name="checkmark-done" size={rMS(14)} color={colors.successText} />
          <Text style={styles.caughtUpText}>All read</Text>
        </View>
      </Reanimated.View>
    );
  }

  return (
    <Reanimated.View entering={FadeInDown.delay(80).duration(280)} style={styles.wrap}>
      <View style={styles.left}>
        <View style={styles.emojiBubble}>
          <Text style={styles.emoji}>📬</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>
            {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
          </Text>
          <Text style={styles.subtitle}>Tap to clear your notification badge</Text>
        </View>
      </View>
      <Pressable
        style={[styles.btn, disabled ? styles.btnDisabled : null]}
        onPress={handlePress}
        disabled={disabled}
        hitSlop={6}
      >
        <Ionicons name="checkmark-done-outline" size={rMS(14)} color="#FFFFFF" />
        <Text style={styles.btnText}>Mark all read</Text>
      </Pressable>
    </Reanimated.View>
  );
}

type ActivityFilterChipsProps = {
  active: ActivityFilter;
  onChange: (filter: ActivityFilter) => void;
  unreadCount: number;
  totalCount: number;
};

export function ActivityFilterChips({
  active,
  onChange,
  unreadCount,
  totalCount,
}: ActivityFilterChipsProps) {
  const { colors } = useTheme();
  const chips: { key: ActivityFilter; label: string; count: number; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "all", label: "All", count: totalCount, icon: "layers-outline" },
    { key: "unread", label: "Unread", count: unreadCount, icon: "mail-unread-outline" },
  ];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          gap: rS(8),
        },
        chip: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(6),
          paddingVertical: rV(10),
          borderRadius: rMS(14),
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
          fontSize: rMS(13),
          color: colors.textSecondary,
        },
        chipTextActive: {
          color: "#FFFFFF",
        },
        badge: {
          minWidth: rMS(20),
          height: rMS(20),
          borderRadius: 999,
          paddingHorizontal: rS(6),
          backgroundColor: colors.surfaceMuted,
          alignItems: "center",
          justifyContent: "center",
        },
        badgeActive: {
          backgroundColor: "rgba(255,255,255,0.22)",
        },
        badgeText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11),
          color: colors.textMuted,
        },
        badgeTextActive: {
          color: "#FFFFFF",
        },
      }),
    [colors],
  );

  return (
    <Reanimated.View entering={FadeInDown.delay(120).duration(260)} style={styles.row}>
      {chips.map((chip, index) => {
        const isActive = active === chip.key;
        return (
          <Reanimated.View
            key={chip.key}
            entering={FadeInRight.delay(index * 50).duration(220)}
            style={{ flex: 1 }}
          >
            <Pressable
              style={[styles.chip, isActive ? styles.chipActive : null]}
              onPress={() => onChange(chip.key)}
            >
              <Ionicons
                name={chip.icon}
                size={rMS(15)}
                color={isActive ? "#FFFFFF" : colors.textMuted}
              />
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                {chip.label}
              </Text>
              <View style={[styles.badge, isActive ? styles.badgeActive : null]}>
                <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : null]}>
                  {chip.count}
                </Text>
              </View>
            </Pressable>
          </Reanimated.View>
        );
      })}
    </Reanimated.View>
  );
}

export function ActivitySectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  const { colors } = useTheme();
  const icon =
    title === "Today"
      ? ("sunny-outline" as const)
      : title === "This week"
        ? ("calendar-outline" as const)
        : ("time-outline" as const);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: rV(16),
        marginBottom: rV(8),
        paddingHorizontal: rS(2),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: rS(8) }}>
        <Ionicons name={icon} size={rMS(15)} color={colors.primary} />
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
      <View
        style={{
          paddingHorizontal: rS(8),
          paddingVertical: rV(3),
          borderRadius: 999,
          backgroundColor: colors.surfaceMuted,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.titleBold,
            fontSize: rMS(11),
            color: colors.textMuted,
          }}
        >
          {count}
        </Text>
      </View>
    </View>
  );
}

type ActivityMarkReadChipProps = {
  onPress: () => void;
};

function ActivityMarkReadChip({ onPress }: ActivityMarkReadChipProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    void Haptics.selectionAsync();
    onPress();
  };

  return (
    <Reanimated.View entering={ZoomIn.duration(220)}>
      <Pressable
        onPress={handlePress}
        hitSlop={8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: rS(4),
          paddingHorizontal: rS(10),
          paddingVertical: rV(6),
          borderRadius: 999,
          backgroundColor: colors.accentSoft,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.infoBorder,
        }}
      >
        <Ionicons name="checkmark-circle" size={rMS(14)} color={colors.primary} />
        <Text
          style={{
            fontFamily: Fonts.titleBold,
            fontSize: rMS(11),
            color: colors.primary,
          }}
        >
          Mark read
        </Text>
      </Pressable>
    </Reanimated.View>
  );
}

type ActivityCardProps = {
  item: ActivityItem;
  index: number;
  onOpen: (item: ActivityItem) => void;
  onMarkRead: (id: string) => void;
};

export const ActivityCard = React.memo(function ActivityCard({
  item,
  index,
  onOpen,
  onMarkRead,
}: ActivityCardProps) {
  const { colors, isDark } = useTheme();
  const accent = activityAccentStyles(item.accent, isDark);
  const showProductThumb =
    Boolean(item.productImage) && activityKindUsesProductImage(item.kind);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: rMS(18),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: item.isRead ? colors.border : colors.infoBorder,
          overflow: "hidden",
          shadowColor: colors.shadow,
          shadowOpacity: item.isRead ? 0.04 : 0.08,
          shadowRadius: item.isRead ? 6 : 12,
          shadowOffset: { width: 0, height: item.isRead ? 2 : 4 },
          elevation: item.isRead ? 2 : 4,
        },
        unreadStripe: {
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: rS(3),
          backgroundColor: accent.stripe,
        },
        inner: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: rS(12),
          paddingHorizontal: rS(14),
          paddingTop: rV(14),
          paddingBottom: rV(8),
          paddingLeft: rS(16),
        },
        thumbWrap: {
          width: rMS(46),
          height: rMS(46),
          borderRadius: rMS(14),
          overflow: "hidden",
          backgroundColor: colors.imagePlaceholder,
        },
        thumb: {
          width: "100%",
          height: "100%",
        },
        iconShell: {
          width: rMS(46),
          height: rMS(46),
          borderRadius: rMS(14),
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: accent.iconBg,
        },
        copy: {
          flex: 1,
          minWidth: 0,
          gap: rV(4),
        },
        titleRow: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: rS(6),
        },
        title: {
          flex: 1,
          fontFamily: item.isRead ? Fonts.title : Fonts.titleBold,
          fontSize: rMS(14),
          lineHeight: rMS(20),
          color: colors.text,
        },
        body: {
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(19),
          color: colors.textMuted,
        },
        metaRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: rS(8),
          marginTop: rV(2),
        },
        time: {
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.placeholder,
          marginTop: rV(2),
        },
        actionPill: {
          alignSelf: "flex-start",
          paddingHorizontal: rS(8),
          paddingVertical: rV(3),
          borderRadius: 999,
          backgroundColor: colors.surfaceMuted,
        },
        actionText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10),
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        },
        chevronWrap: {
          width: rMS(28),
          height: rMS(28),
          borderRadius: rMS(10),
          backgroundColor: colors.surfaceMuted,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
        },
      }),
    [accent.iconBg, accent.stripe, colors, item.isRead],
  );

  return (
    <Reanimated.View entering={FadeInDown.delay(Math.min(index * 40, 240)).duration(260)}>
      <View style={styles.wrap}>
        {!item.isRead ? <View style={styles.unreadStripe} /> : null}
        <Pressable style={styles.inner} onPress={() => onOpen(item)}>
          {showProductThumb ? (
            <View style={styles.thumbWrap}>
              <Image source={item.productImage} style={styles.thumb} resizeMode="cover" />
            </View>
          ) : (
            <View style={styles.iconShell}>
              <Ionicons name={item.icon} size={rMS(20)} color={accent.iconColor} />
            </View>
          )}

          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
            <Text style={styles.body} numberOfLines={2}>
              {item.body}
            </Text>
            {item.actionLabel ? (
              <View style={styles.actionPill}>
                <Text style={styles.actionText}>{item.actionLabel}</Text>
              </View>
            ) : null}
            <Text style={styles.time}>{item.relativeTime}</Text>
          </View>

          <View style={styles.chevronWrap}>
            <Ionicons name="chevron-forward" size={rMS(14)} color={colors.iconMuted} />
          </View>
        </Pressable>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: rS(16),
            paddingBottom: rV(12),
            paddingLeft: rS(72),
          }}
        >
          {!item.isRead ? (
            <ActivityMarkReadChip onPress={() => onMarkRead(item.id)} />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: rS(4) }}>
              <Ionicons name="checkmark-done" size={rMS(12)} color={colors.successText} />
              <Text
                style={{
                  fontFamily: Fonts.text,
                  fontSize: rMS(11),
                  color: colors.textMuted,
                }}
              >
                Read
              </Text>
            </View>
          )}
        </View>
      </View>
    </Reanimated.View>
  );
});

export function ActivityEmptyState({
  filter,
  onShowAll,
}: {
  filter: ActivityFilter;
  onShowAll?: () => void;
}) {
  const { colors } = useTheme();

  const isUnreadFilter = filter === "unread";

  return (
    <Reanimated.View
      entering={FadeInDown.duration(300)}
      style={{
        alignItems: "center",
        paddingVertical: rV(40),
        paddingHorizontal: rS(28),
        gap: rV(10),
      }}
    >
      <View
        style={{
          width: rMS(64),
          height: rMS(64),
          borderRadius: rMS(22),
          backgroundColor: colors.accentSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: rMS(28) }}>{isUnreadFilter ? "🎉" : "🔔"}</Text>
      </View>
      <Text
        style={{
          fontFamily: Fonts.titleBold,
          fontSize: rMS(17),
          color: colors.text,
          textAlign: "center",
        }}
      >
        {isUnreadFilter ? "No unread updates" : "No activity yet"}
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
        {isUnreadFilter
          ? "You've read everything — your inbox is sparkling clean."
          : "When you place orders or update your account, updates will show up here."}
      </Text>
      {isUnreadFilter && onShowAll ? (
        <Pressable
          onPress={onShowAll}
          style={{
            marginTop: rV(8),
            paddingHorizontal: rS(16),
            paddingVertical: rV(10),
            borderRadius: 999,
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ fontFamily: Fonts.titleBold, fontSize: rMS(13), color: "#FFFFFF" }}>
            View all activity
          </Text>
        </Pressable>
      ) : null}
    </Reanimated.View>
  );
}

export function ActivitySignedOutState({
  onSignIn,
}: {
  onSignIn: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Reanimated.View
      entering={FadeInDown.duration(320)}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: rS(32),
        gap: rV(12),
      }}
    >
      <LinearGradient
        colors={[colors.accentSoft, colors.card]}
        style={{
          width: rMS(72),
          height: rMS(72),
          borderRadius: rMS(24),
          alignItems: "center",
          justifyContent: "center",
          marginBottom: rV(4),
        }}
      >
        <Ionicons name="notifications-outline" size={rMS(32)} color={colors.primary} />
      </LinearGradient>
      <Text
        style={{
          fontFamily: Fonts.titleBold,
          fontSize: rMS(18),
          color: colors.text,
          textAlign: "center",
        }}
      >
        Sign in to see activity
      </Text>
      <Text
        style={{
          fontFamily: Fonts.text,
          fontSize: rMS(14),
          lineHeight: rMS(21),
          color: colors.textMuted,
          textAlign: "center",
        }}
      >
        Orders, delivery updates, vouchers, and account moments appear here once you're logged in.
      </Text>
      <Pressable
        onPress={onSignIn}
        style={{
          marginTop: rV(8),
          minHeight: rV(48),
          borderRadius: rMS(16),
          paddingHorizontal: rS(24),
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: rS(8),
        }}
      >
        <Ionicons name="log-in-outline" size={rMS(18)} color="#FFFFFF" />
        <Text style={{ fontFamily: Fonts.titleBold, fontSize: rMS(14), color: "#FFFFFF" }}>
          Sign in
        </Text>
      </Pressable>
    </Reanimated.View>
  );
}

export function filterActivitySections(
  sections: { title: string; data: ActivityItem[] }[],
  filter: ActivityFilter,
): { title: string; data: ActivityItem[] }[] {
  if (filter === "all") {
    return sections;
  }
  return sections
    .map((section) => ({
      ...section,
      data: section.data.filter((item) => !item.isRead),
    }))
    .filter((section) => section.data.length > 0);
}
