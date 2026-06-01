import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { ActivityItem, useActivityFeed } from "@/hooks/useActivityFeed";
import { activityKindUsesProductImage } from "@/utils/activityImages";
import { rMS, rS, rV } from "@/styles/responsive";
import { useNotificationStyles, AppColors } from "@/styles/themedNotificationStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function activityAccentStyles(accent: ActivityItem["accent"]) {
  if (accent === "success") {
    return {
      iconBg: "#ECFDF3",
      iconColor: "#15803D",
    };
  }
  if (accent === "warning") {
    return {
      iconBg: "#FFF7ED",
      iconColor: "#B45309",
    };
  }
  return {
    iconBg: "#F3F4F6",
    iconColor: AppColors.primary,
  };
}

function NotificationRowItem({
  item,
  onOpen,
  styles,
}: {
  item: ActivityItem;
  onOpen: (item: ActivityItem) => void;
  styles: ReturnType<typeof useNotificationStyles>;
}) {
  const accent = activityAccentStyles(item.accent);
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
          <Ionicons name={item.icon} size={rMS(20)} color={accent.iconColor} />
        </View>
      )}

      <View style={styles.middle}>
        <View style={styles.titleRow}>
          <Text style={[styles.itemTitle, !item.isRead ? styles.itemTitleUnread : null]}>
            {item.title}
          </Text>
          {!item.isRead ? <View style={styles.unreadPill} /> : null}
        </View>
        <Text style={styles.itemBody} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.time}>{item.relativeTime}</Text>
      </View>

      {item.actionLabel ? (
        <View style={styles.actionPill}>
          <Text style={styles.actionText}>{item.actionLabel}</Text>
          <Ionicons name="chevron-forward" size={rMS(14)} color={AppColors.text} />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={rMS(16)} color="#CBD5E1" />
      )}
    </TouchableOpacity>
  );
}

export default function NotificationScreen() {
  const styles = useNotificationStyles();
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

    if (item.route.type === "vendor_wallet") {
      router.push("/vendor/wallet" as any);
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
        <View style={styles.bannerHeader}>
          <View style={styles.bannerIcon}>
            <Ionicons name="sparkles-outline" size={rMS(18)} color={AppColors.primary} />
          </View>
          <View style={styles.bannerCopy}>
            <Text style={styles.bannerTitle}>Your ODOS timeline</Text>
            <Text style={styles.bannerText}>
              {unreadCount > 0
                ? `${unreadCount} new update${unreadCount === 1 ? "" : "s"} waiting for you.`
                : "Orders, account moments, and shopping updates land here."}
            </Text>
          </View>
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markAllButton}
            activeOpacity={0.85}
            onPress={() => {
              void markAsRead(sections.flatMap((section) => section.data.map((item) => item.id)));
            }}
          >
            <Text style={styles.markAllButtonText}>Mark all read</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isLoadingActivity ? (
        <ScreenLoader label="Loading your activity..." />
      ) : sections.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="notifications-outline" size={rMS(28)} color={AppColors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyText}>
            Place an order, verify your email, or update your profile — the important moments will
            show up here.
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
            <NotificationRowItem item={item} onOpen={openItem} styles={styles} />
          )}
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
