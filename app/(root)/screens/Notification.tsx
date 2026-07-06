import {
  ActivityCard,
  ActivityEmptyState,
  ActivityFilter,
  ActivityFilterChips,
  ActivityHero,
  ActivityMarkAllRead,
  ActivitySectionHeader,
  ActivitySignedOutState,
  filterActivitySections,
} from "@/components/activity/ActivityUi";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ActivityItem, useActivityFeed } from "@/hooks/useActivityFeed";
import { rS, rV } from "@/styles/responsive";
import { openActivityRoute } from "@/utils/activityNavigation";
import { openSignInFromApp } from "@/utils/authNavigation";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, SectionList, StyleSheet, View } from "react-native";

export default function NotificationScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const {
    sections,
    items,
    unreadCount,
    hasLoadedOnce,
    isInitialLoading,
    isPullRefreshing,
    markAsRead,
    pullToRefresh,
    refreshActivity,
  } = useActivityFeed();

  const screenStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.screen,
        },
        listContent: {
          paddingHorizontal: rS(16),
          paddingTop: rV(8),
          paddingBottom: rV(36),
          gap: rV(10),
        },
        headerBlock: {
          gap: rV(12),
          marginBottom: rV(4),
        },
        sectionGap: {
          gap: rV(10),
        },
      }),
    [colors.screen],
  );

  useFocusEffect(
    useCallback(() => {
      void refreshActivity({ silent: true });
    }, [refreshActivity]),
  );

  const filteredSections = useMemo(
    () => filterActivitySections(sections, filter),
    [filter, sections],
  );

  const openItem = useCallback(
    async (item: ActivityItem) => {
      if (!item.isRead) {
        await markAsRead([item.id]);
      }

      if (!item.route) {
        return;
      }

      await openActivityRoute(item.route);
    },
    [markAsRead],
  );

  const markItemRead = useCallback(
    (id: string) => {
      void markAsRead([id]);
    },
    [markAsRead],
  );

  const markAllRead = useCallback(() => {
    const ids = items.filter((item) => !item.isRead).map((item) => item.id);
    void markAsRead(ids);
  }, [items, markAsRead]);

  if (!user) {
    return (
      <View style={screenStyles.container}>
        <ProfileHeader title="Activity" />
        <ActivitySignedOutState onSignIn={() => openSignInFromApp(router)} />
      </View>
    );
  }

  const showInitialLoader = isInitialLoading && !hasLoadedOnce;
  const showEmpty = hasLoadedOnce && filteredSections.length === 0;

  return (
    <View style={screenStyles.container}>
      <ProfileHeader title="Activity" />

      {showInitialLoader ? (
        <ScreenLoader label="Loading activity…" />
      ) : showEmpty ? (
        <ActivityEmptyState
          filter={filter}
          onShowAll={filter === "unread" ? () => setFilter("all") : undefined}
        />
      ) : (
        <SectionList
          sections={filteredSections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <ActivitySectionHeader title={section.title} count={section.data.length} />
          )}
          renderItem={({ item, index }) => (
            <ActivityCard
              item={item}
              index={index}
              onOpen={openItem}
              onMarkRead={markItemRead}
            />
          )}
          ListHeaderComponent={
            <View style={screenStyles.headerBlock}>
              <ActivityHero totalCount={items.length} unreadCount={unreadCount} />
              <ActivityMarkAllRead unreadCount={unreadCount} onPress={markAllRead} />
              <ActivityFilterChips
                active={filter}
                onChange={setFilter}
                unreadCount={unreadCount}
                totalCount={items.length}
              />
            </View>
          }
          contentContainerStyle={screenStyles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          removeClippedSubviews={false}
          ItemSeparatorComponent={() => <View style={{ height: rV(10) }} />}
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
