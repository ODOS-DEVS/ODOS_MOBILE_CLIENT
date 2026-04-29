import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import UserAvatar from "@/components/UserAvatar";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { ActivityItem, useActivityFeed } from "@/hooks/useActivityFeed";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function NotificationRowItem({
  item,
  onOpen,
}: {
  item: ActivityItem;
  onOpen: (item: ActivityItem) => void;
}) {
  const openItem = () => {
    onOpen(item);
  };

  const accentColor =
    item.accent === "success"
      ? "#15803D"
      : item.accent === "warning"
        ? "#B45309"
        : AppColors.primary;
  const iconBg =
    item.accent === "success"
      ? "#ECFDF3"
      : item.accent === "warning"
        ? "#FFF7ED"
        : "#F2F4F7";

  return (
    <TouchableOpacity style={styles.itemRow} activeOpacity={0.86} onPress={openItem}>
      {!item.isRead ? <View style={styles.unreadDot} /> : null}
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        {item.productImage ? (
          <Image source={item.productImage} style={styles.productImage} resizeMode="cover" />
        ) : (
          <Ionicons name={item.icon} size={18} color={accentColor} />
        )}
      </View>

      <View style={styles.middle}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemBody}>{item.body}</Text>
        <Text style={styles.time}>{item.relativeTime}</Text>
      </View>

      {item.actionLabel ? (
        <View style={styles.actionPill}>
          <Text style={styles.actionText}>{item.actionLabel}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function NotificationScreen() {
  const { user } = useAuth();
  const {
    sections,
    unreadCount,
    isLoadingActivity,
    markAsRead,
    refreshActivity,
  } = useActivityFeed();

  const openItem = async (item: ActivityItem) => {
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

    router.push("/(root)/screens/profileScreens/orders" as any);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ProfileHeader title="Activity" />
        <View style={styles.emptyState}>
          <UserAvatar size={rS(56)} />
          <Text style={styles.emptyTitle}>Your activity will show up here</Text>
          <Text style={styles.emptyText}>
            Sign in to keep track of orders, account updates, and important shopping moments.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={() => router.replace("/(root)/(auth)/onboarding" as any)}
          >
            <Text style={styles.primaryButtonText}>Create Account or Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileHeader title="Activity" />

      <View style={styles.topBanner}>
        <Text style={styles.bannerTitle}>Recent activity</Text>
        <Text style={styles.bannerText}>
          {unreadCount > 0
            ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"} across your account and orders.`
            : "Your latest account and order updates will appear here. Pull down to refresh any time."}
        </Text>
        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markAllButton}
            activeOpacity={0.85}
            onPress={() => {
              void markAsRead(sections.flatMap((section) => section.data.map((item) => item.id)));
            }}
          >
            <Text style={styles.markAllButtonText}>Mark all as read</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isLoadingActivity ? (
        <ScreenLoader label="Loading your activity..." />
      ) : sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={rMS(30)} color={AppColors.secondary} />
          <Text style={styles.emptyTitle}>Nothing to show just yet</Text>
          <Text style={styles.emptyText}>
            Once you place orders or update your account, the important moments will show up here.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          renderItem={({ item }) => <NotificationRowItem item={item} onOpen={openItem} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingActivity}
              onRefresh={() => {
                void refreshActivity();
              }}
              tintColor={AppColors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  topBanner: {
    marginHorizontal: rS(16),
    marginTop: rV(14),
    marginBottom: rV(6),
    backgroundColor: "#EEF4FF",
    borderRadius: rMS(18),
    paddingHorizontal: rS(16),
    paddingVertical: rV(14),
  },
  markAllButton: {
    alignSelf: "flex-start",
    marginTop: rV(10),
    borderRadius: rMS(999),
    backgroundColor: AppColors.white,
    paddingHorizontal: rS(12),
    paddingVertical: rV(7),
  },
  markAllButtonText: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: AppColors.primary,
  },
  bannerTitle: {
    fontSize: rMS(15),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  bannerText: {
    marginTop: rV(4),
    fontSize: rMS(12),
    lineHeight: rMS(18),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  listContent: {
    paddingHorizontal: rS(16),
    paddingBottom: rV(28),
  },
  sectionTitle: {
    marginTop: rV(16),
    marginBottom: rV(10),
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: AppColors.subtext[100],
    textTransform: "uppercase",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    backgroundColor: AppColors.white,
    borderRadius: rMS(18),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    marginBottom: rV(10),
  },
  unreadDot: {
    position: "absolute",
    top: rV(18),
    left: rS(10),
    width: rMS(8),
    height: rMS(8),
    borderRadius: rMS(4),
    backgroundColor: "#2563EB",
  },
  iconCircle: {
    width: rMS(46),
    height: rMS(46),
    borderRadius: rMS(23),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  middle: {
    flex: 1,
  },
  itemTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  itemBody: {
    marginTop: rV(3),
    fontSize: rMS(12),
    lineHeight: rMS(18),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  time: {
    marginTop: rV(6),
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: AppColors.subtext[100],
  },
  actionPill: {
    borderRadius: rMS(999),
    backgroundColor: "#F2F4F7",
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
  },
  actionText: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: rS(28),
    gap: rV(10),
  },
  emptyTitle: {
    fontSize: rMS(17),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
    textAlign: "center",
  },
  emptyText: {
    fontSize: rMS(13),
    lineHeight: rMS(20),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    textAlign: "center",
  },
  primaryButton: {
    marginTop: rV(8),
    minHeight: rV(48),
    borderRadius: rMS(16),
    paddingHorizontal: rS(18),
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
});
