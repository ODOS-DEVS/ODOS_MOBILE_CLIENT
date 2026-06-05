import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ActivityItem, useActivityFeed } from "@/hooks/useActivityFeed";
import { activityKindUsesProductImage } from "@/utils/activityImages";
import { openSignInFromApp } from "@/utils/authNavigation";
import { rMS, rS, rV } from "@/styles/responsive";
import { useNotificationStyles } from "@/styles/themedNotificationStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  Image,
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function activityAccentStyles(
  accent: ActivityItem["accent"],
  isDark: boolean,
) {
  if (accent === "success") {
    return {
      iconBg: isDark ? "#14532D" : "#ECFDF3",
      iconColor: isDark ? "#86EFAC" : "#15803D",
    };
  }
  if (accent === "warning") {
    return {
      iconBg: isDark ? "#422006" : "#FFF7ED",
      iconColor: isDark ? "#FCD34D" : "#B45309",
    };
  }
  return {
    iconBg: isDark ? "#1E293B" : "#F3F4F6",
    iconColor: isDark ? "#93C5FD" : "#4F46E5",
  };
}

const ActivityRow = React.memo(function ActivityRow({
  item,
  onOpen,
  styles,
  isDark,
}: {
  item: ActivityItem;
  onOpen: (item: ActivityItem) => void;
  styles: ReturnType<typeof useNotificationStyles>;
  isDark: boolean;
}) {
  const accent = activityAccentStyles(item.accent, isDark);
  const showProductThumb =
    Boolean(item.productImage) && activityKindUsesProductImage(item.kind);

  return (
    <TouchableOpacity
      style={[styles.itemRow, !item.isRead ? styles.itemRowUnread : null]}
      activeOpacity={0.86}
      onPress={() => onOpen(item)}
    >
      {showProductThumb ? (
        <View style={styles.productThumbWrap}>
          <Image source={item.productImage} style={styles.productThumb} resizeMode="cover" />
        </View>
      ) : (
        <View style={[styles.iconCircle, { backgroundColor: accent.iconBg }]}>
          <Ionicons name={item.icon} size={rMS(18)} color={accent.iconColor} />
        </View>
      )}

      <View style={styles.middle}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.itemTitle, !item.isRead ? styles.itemTitleUnread : null]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.isRead ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text style={styles.itemBody} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.time}>{item.relativeTime}</Text>
      </View>

      <Ionicons name="chevron-forward" size={rMS(16)} color={styles.chevronColor} />
    </TouchableOpacity>
  );
});

export default function NotificationScreen() {
  const styles = useNotificationStyles();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const {
    sections,
    unreadCount,
    hasLoadedOnce,
    isInitialLoading,
    isPullRefreshing,
    markAsRead,
    pullToRefresh,
  } = useActivityFeed();

  const openItem = useCallback(
    async (item: ActivityItem) => {
      if (!item.isRead) {
        await markAsRead([item.id]);
      }

      if (!item.route) {
        return;
      }

      if (item.route.type === "order") {
        router.push({
          pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
          params: { orderId: item.route.orderId },
        });
        return;
      }

      if (item.route.type === "profile") {
        router.push("/(root)/screens/profileScreens/CustomerProfile" as any);
        return;
      }

      if (item.route.type === "vendor_wallet") {
        router.push("/vendor/wallet" as any);
        return;
      }

      router.push("/(root)/screens/profileScreens/orders" as any);
    },
    [markAsRead],
  );

  const markAllRead = useCallback(() => {
    const ids = sections.flatMap((section) => section.data.map((item) => item.id));
    void markAsRead(ids);
  }, [markAsRead, sections]);

  const headerRight =
    unreadCount > 0 ? (
      <TouchableOpacity onPress={markAllRead} activeOpacity={0.85} hitSlop={8}>
        <Text style={[styles.headerAction, { color: colors.primary }]}>Mark all read</Text>
      </TouchableOpacity>
    ) : null;

  if (!user) {
    return (
      <View style={styles.container}>
        <ProfileHeader title="Activity" />
        <View style={styles.emptyState}>
          <UserAvatar size={rS(56)} />
          <Text style={styles.emptyTitle}>Sign in to see activity</Text>
          <Text style={styles.emptyText}>
            Orders, account updates, and shopping moments appear here once you are logged in.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={() => openSignInFromApp(router)}
          >
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const showInitialLoader = isInitialLoading && !hasLoadedOnce;
  const showEmpty = hasLoadedOnce && sections.length === 0;

  return (
    <View style={styles.container}>
      <ProfileHeader title="Activity" rightNode={headerRight} />

      {showInitialLoader ? (
        <ScreenLoader label="Loading activity…" />
      ) : showEmpty ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="notifications-outline" size={rMS(26)} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No activity yet</Text>
          <Text style={styles.emptyText}>
            When you place orders or update your account, updates will show up here.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <ActivityRow item={item} onOpen={openItem} styles={styles} isDark={isDark} />
          )}
          ListHeaderComponent={
            unreadCount > 0 ? (
              <Text style={styles.listIntro}>
                {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
              </Text>
            ) : (
              <Text style={styles.listIntro}>Orders and account updates</Text>
            )
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          removeClippedSubviews={false}
          refreshControl={
            <RefreshControl
              refreshing={isPullRefreshing}
              onRefresh={pullToRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}
