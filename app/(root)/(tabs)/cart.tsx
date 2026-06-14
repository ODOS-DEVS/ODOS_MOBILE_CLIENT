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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MyCart = () => {
  const { colors } = useTheme();
  const tabBarInset = useTabBarContentInsetFromContext();
  const insets = useSafeAreaInsets();
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

  const shipping = 0;
  const total = subtotal + shipping;
  const stickyBarHeight = rV(76) + insets.bottom;

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
          marginBottom: rV(12),
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
        bagCount: {
          minWidth: rS(22),
          textAlign: "center",
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11),
          color: AppColors.primary,
          backgroundColor: colors.pill,
          paddingHorizontal: rS(8),
          paddingVertical: rV(3),
          borderRadius: rS(999),
          overflow: "hidden",
        },
        summaryCard: {
          backgroundColor: colors.card,
          borderRadius: rMS(18),
          paddingHorizontal: rS(14),
          marginBottom: rV(62),
          paddingVertical: rV(12),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
        },
        summaryTitle: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14),
          color: colors.text,
          marginBottom: rV(8),
        },
        voucherNote: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
          borderRadius: rMS(12),
          backgroundColor: colors.accentSoft,
          paddingHorizontal: rS(10),
          paddingVertical: rV(8),
          marginBottom: rV(10),
        },
        voucherNoteText: {
          flex: 1,
          color: colors.textSecondary,
          fontFamily: Fonts.text,
          fontSize: rMS(12.5),
          lineHeight: rMS(18),
        },
        summaryRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: rV(10),
        },
        summaryLabel: {
          color: colors.textMuted,
          fontFamily: Fonts.text,
          fontSize: rMS(13.5),
        },
        summaryValue: {
          color: colors.text,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14),
        },
        shippingFree: {
          color: colors.successText,
          fontFamily: Fonts.title,
          fontSize: rMS(12.5),
        },
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
          marginVertical: rV(10),
        },
        totalLabel: {
          color: colors.text,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(15),
        },
        totalValue: {
          color: colors.text,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(20),
        },
        summaryHint: {
          color: colors.textMuted,
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
          lineHeight: rMS(16),
        },
        stickyBar: {
          position: "absolute",
          left: rS(12),
          right: rS(12),
          bottom: rV(78),
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
        stickyMeta: {
          color: colors.textMuted,
          fontFamily: Fonts.text,
          fontSize: rMS(10.5),
          marginTop: rV(2),
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
    [colors],
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
              { paddingBottom: stickyBarHeight + rV(16) },
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
                <Text style={styles.bagCount}>{itemCount}</Text>
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

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Summary</Text>

              <View style={styles.voucherNote}>
                <Ionicons name="ticket-outline" size={rS(15)} color={AppColors.primary} />
                <Text style={styles.voucherNoteText}>
                  Voucher codes apply at checkout.
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.shippingFree}>Calculated at checkout</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Estimated total</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </View>

              <Text style={styles.summaryHint}>
                Final tax, discounts, and delivery fees are confirmed at checkout.
              </Text>
            </View>
          </ScrollView>

          <View
            style={[
              styles.stickyBar,
              { paddingBottom: insets.bottom + rV(12) },
            ]}
          >
            <View style={styles.stickyCopy}>
              <Text style={styles.stickyLabel}>Total</Text>
              <Text style={styles.stickyValue}>{formatCurrency(total)}</Text>
              <Text style={styles.stickyMeta}>
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </Text>
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
