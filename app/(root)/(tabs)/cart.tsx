import CartItemCard from "@/components/cards/CartItemCard";
import CommerceEmptyState from "@/components/empty/CommerceEmptyState";
import { CartPageSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { CartItem, useCart } from "@/context/CartContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MyCart = () => {
  const { colors } = useTheme();
  const tabBarInset = useTabBarContentInsetFromContext();
  const { cart, increaseQty, decreaseQty, removeItem, clearCart, isSyncingCart, refreshCart } =
    useCart();
  const { requireAuth } = useRequireAuth();

  const isEmpty = cart.length === 0;
  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );
  const subtotal = useMemo<number>(() => {
    return cart.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0,
    );
  }, [cart]);

  const stickyBarHeight = rV(76);

  useFocusEffect(
    useCallback(() => {
      void refreshCart();
    }, [refreshCart]),
  );

  const openCheckout = () => {
    if (
      !requireAuth({
        title: "Sign in to check out",
        message:
          "Log in or create an account to place orders and keep track of deliveries.",
      })
    ) {
      return;
    }

    router.push({
      pathname: "/screens/Checkout" as any,
      params: { mode: "cart" },
    });
  };

  const confirmClearCart = () => {
    Alert.alert("Clear cart?", "Remove every item from your cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear cart",
        style: "destructive",
        onPress: () => {
          void clearCart();
        },
      },
    ]);
  };

  const showInitialLoader = isSyncingCart && isEmpty;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.screen,
        },
        content: {
          paddingHorizontal: rS(16),
          paddingTop: rV(14),
        },
        emptyContent: {
          paddingHorizontal: rS(16),
          paddingTop: rV(8),
        },
        toolbar: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: rV(14),
          gap: rS(12),
        },
        toolbarCopy: {
          flex: 1,
          gap: rV(2),
        },
        toolbarTitle: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(17),
          color: colors.text,
        },
        toolbarMeta: {
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
          color: colors.textMuted,
        },
        clearButton: {
          borderRadius: rS(999),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.dangerText,
          backgroundColor: colors.dangerSoft,
          paddingHorizontal: rS(14),
          paddingVertical: rV(8),
        },
        clearButtonText: {
          color: colors.dangerText,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
        },
        bagCard: {
          backgroundColor: colors.card,
          borderRadius: rMS(20),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
          marginBottom: rV(16),
          overflow: "hidden",
        },
        bagHeader: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
          paddingHorizontal: rS(12),
          paddingTop: rV(12),
          paddingBottom: rV(8),
          backgroundColor: colors.cardElevated,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        bagIcon: {
          width: rS(28),
          height: rS(28),
          borderRadius: rS(10),
          backgroundColor: colors.card,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        bagTitle: {
          flex: 1,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.text,
        },
        stickyBar: {
          position: "absolute",
          left: rS(12),
          right: rS(12),
          bottom: tabBarInset,
          flexDirection: "row",
          alignItems: "center",
          gap: rS(10),
          paddingTop: rV(10),
          paddingHorizontal: rS(14),
          borderRadius: rMS(20),
          backgroundColor: colors.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
        },
        stickyCopy: {
          flex: 1,
          gap: rV(1),
        },
        stickyLabel: {
          color: colors.textMuted,
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
        },
        stickyValue: {
          color: colors.text,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(20),
        },
        checkoutButton: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(6),
          minHeight: rV(44),
          minWidth: rS(118),
          borderRadius: rMS(14),
          backgroundColor: colors.text,
          paddingHorizontal: rS(18),
        },
        checkoutButtonText: {
          color: colors.onPrimary,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14),
        },
      }),
    [colors, tabBarInset],
  );

  return (
    <View style={styles.container}>
      <ProfileHeader title="My Cart" showBackButton={false} />

      {showInitialLoader ? (
        <CartPageSkeleton />
      ) : isEmpty ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.emptyContent,
            { paddingBottom: tabBarInset },
          ]}
        >
          <CommerceEmptyState
            icon="bag-handle-outline"
            title="Your cart is empty"
            message="Save items you love while browsing. They'll stay here until you're ready to check out."
            primaryLabel="Start shopping"
            onPrimaryPress={() => router.push("/(root)/(tabs)/" as any)}
            secondaryLabel="Browse categories"
            onSecondaryPress={() => router.push("/(root)/(tabs)/category" as any)}
          />
        </ScrollView>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: stickyBarHeight + tabBarInset + rV(16) },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isSyncingCart}
                onRefresh={() => void refreshCart()}
                tintColor={AppColors.primary}
              />
            }
          >
            <View style={styles.toolbar}>
              <View style={styles.toolbarCopy}>
                <Text style={styles.toolbarTitle}>
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </Text>
                <Text style={styles.toolbarMeta}>Pull down to refresh</Text>
              </View>
              <TouchableOpacity
                onPress={confirmClearCart}
                style={styles.clearButton}
                activeOpacity={0.82}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bagCard}>
              <View style={styles.bagHeader}>
                <View style={styles.bagIcon}>
                  <Ionicons name="bag-handle" size={rS(16)} color={AppColors.primary} />
                </View>
                <Text style={styles.bagTitle}>Your picks</Text>
              </View>

              {cart.map((item, index) => (
                <CartItemCard
                  key={item.id}
                  {...item}
                  embedded
                  showDivider={index > 0}
                  onIncrease={() => void increaseQty(item.id)}
                  onDecrease={() => void decreaseQty(item.id)}
                  onRemove={() => void removeItem(item.id)}
                />
              ))}
            </View>
          </ScrollView>

          <View style={[styles.stickyBar, { paddingBottom: rV(12) }]}>
            <View style={styles.stickyCopy}>
              <Text style={styles.stickyLabel}>Subtotal</Text>
              <Text style={styles.stickyValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <TouchableOpacity
              onPress={openCheckout}
              style={styles.checkoutButton}
              activeOpacity={0.9}
              disabled={isSyncingCart}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
              <Ionicons name="arrow-forward" size={rS(18)} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default MyCart;
