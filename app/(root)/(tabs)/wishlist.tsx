import WishlistTileCard from "@/components/cards/WishlistTileCard";
import CommerceEmptyState from "@/components/empty/CommerceEmptyState";
import { WishlistGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WishlistScreen = () => {
  const { colors } = useTheme();
  const tabBarInset = useTabBarContentInsetFromContext();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { wishlist, isSyncingWishlist, refreshWishlist, removeFromWishlist } = useWishlist();
  const { width, horizontalPadding, gridCardWidth } = useResponsive();

  const columns = width >= 700 ? 3 : 2;
  const gap = rS(10);
  const cardWidth = gridCardWidth(columns, gap);
  const isEmpty = wishlist.length === 0;
  const showInitialLoader = isSyncingWishlist && isEmpty;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.screen,
        },
        emptyWrap: {
          paddingHorizontal: rS(16),
          paddingTop: rV(8),
        },
        listContent: {
          paddingTop: rV(10),
        },
        headerBlock: {
          marginBottom: rV(12),
          gap: rV(10),
        },
        heroPill: {
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          paddingHorizontal: rS(12),
          paddingVertical: rV(7),
          borderRadius: rS(999),
          backgroundColor: colors.dangerSoft,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
        },
        heroPillText: {
          color: colors.dangerText,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11.5),
        },
        toolbar: {
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: rS(10),
        },
        toolbarCopy: {
          flex: 1,
          gap: rV(3),
        },
        toolbarTitle: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(15),
          color: colors.text,
        },
        toolbarMeta: {
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
          lineHeight: rMS(16),
          color: colors.textMuted,
        },
        clearButton: {
          borderRadius: rS(999),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
          backgroundColor: colors.dangerSoft,
          paddingHorizontal: rS(12),
          paddingVertical: rV(7),
        },
        clearButtonText: {
          color: colors.dangerText,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11),
        },
      }),
    [colors],
  );

  useFocusEffect(
    useCallback(() => {
      if (user) {
        void refreshWishlist();
      }
    }, [refreshWishlist, user]),
  );

  const listHeader = useMemo(() => {
    if (isEmpty) {
      return null;
    }

    return (
      <View style={styles.headerBlock}>
        <View style={styles.heroPill}>
          <Ionicons name="heart" size={rS(14)} color="#F43F5E" />
          <Text style={styles.heroPillText}>Your saved favorites</Text>
        </View>

        <View style={styles.toolbar}>
          <View style={styles.toolbarCopy}>
            <Text style={styles.toolbarTitle}>
              {wishlist.length} lovely pick{wishlist.length === 1 ? "" : "s"}
            </Text>
            <Text style={styles.toolbarMeta}>
              Tap a tile to view · use the heart button to remove
            </Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            activeOpacity={0.82}
            onPress={() => {
              Alert.alert("Clear wishlist?", "Remove every saved item?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear",
                  style: "destructive",
                  onPress: () => {
                    void Promise.all(wishlist.map((item) => removeFromWishlist(item.id)));
                  },
                },
              ]);
            }}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [isEmpty, removeFromWishlist, styles, wishlist.length]);

  const openWishlistGate = () => {
    requireAuth({
      title: "Sign in to save favorites",
      message: "Log in to keep your wishlist on every device.",
    });
  };

  return (
    <View style={styles.container}>
      <ProfileHeader title="Wishlist" showBackButton={false} />

      {showInitialLoader ? (
        <WishlistGridSkeleton columns={columns} count={columns} />
      ) : isEmpty ? (
        <View style={[styles.emptyWrap, { paddingBottom: tabBarInset }]}>
          <CommerceEmptyState
            icon="heart-outline"
            title="Nothing saved yet"
            message="Tap the heart on any product to save it here for later."
            primaryLabel="Discover products"
            onPrimaryPress={() => router.push("/(root)/(tabs)/" as any)}
            secondaryLabel={user ? "Browse categories" : "Sign in to sync"}
            onSecondaryPress={() =>
              user
                ? router.push("/(root)/(tabs)/category" as any)
                : openWishlistGate()
            }
          />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={wishlist}
          key={`wishlist-${columns}`}
          numColumns={columns}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: tabBarInset,
            },
          ]}
          columnWrapperStyle={columns > 1 ? { gap } : undefined}
          refreshControl={
            <RefreshControl
              refreshing={isSyncingWishlist}
              onRefresh={() => void refreshWishlist()}
              tintColor="#F43F5E"
            />
          }
          renderItem={({ item }) => (
            <WishlistTileCard
              id={item.id}
              image={item.image}
              title={item.title}
              category={item.category}
              oldPrice={item.oldPrice}
              price={item.price}
              rating={item.rating}
              reviews={item.reviews}
              cardWidth={cardWidth}
              onRemove={() => void removeFromWishlist(item.id)}
            />
          )}
        />
      )}
    </View>
  );
};

export default WishlistScreen;
