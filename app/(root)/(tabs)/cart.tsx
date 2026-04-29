import CartItemCard from "@/components/cards/CartItemCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { CartItem, useCart } from "@/context/CartContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const MyCart = () => {
  const { cart, increaseQty, decreaseQty, removeItem } = useCart();
  const { requireAuth } = useRequireAuth();
  const [promoCode, setPromoCode] = useState("");

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

  return (
    <View style={styles.container}>
      <ProfileHeader title="My Cart" showBackButton={false} />

      {isEmpty ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.emptyContent}
        >
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="bag-handle-outline" size={34} color={AppColors.text} />
            </View>

            <Text style={styles.emptyTitle}>Your cart is empty</Text>

            <Text style={styles.emptyDescription}>
              Add the items you love and they’ll be ready here when it’s time
              to check out.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/")}
              style={styles.emptyButton}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cart Items</Text>
            <Text style={styles.sectionMeta}>
              {itemCount} piece{itemCount === 1 ? "" : "s"}
            </Text>
          </View>

          <View style={styles.itemsSection}>
            {cart.map((item) => (
              <CartItemCard
                key={item.id}
                {...item}
                onIncrease={() => increaseQty(item.id)}
                onDecrease={() => decreaseQty(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.promoRow}>
              <View style={styles.promoInputWrap}>
                <Ionicons
                  name="pricetag-outline"
                  size={16}
                  color={AppColors.secondary}
                />
                <TextInput
                  placeholder="Enter promo code"
                  placeholderTextColor="#9CA3AF"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  style={styles.promoInput}
                />
              </View>

              <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
                <Text style={styles.addButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.shippingFree}>FREE</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>

            <Text style={styles.summaryHint}>
              Taxes and delivery details will be confirmed at checkout.
            </Text>
          </View>

          <TouchableOpacity
            onPress={openCheckout}
            style={styles.checkoutButton}
            activeOpacity={0.88}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
    paddingBottom: rV(120),
  },
  emptyContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(32),
    paddingBottom: rV(120),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rV(10),
  },
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
    color: AppColors.text,
  },
  sectionMeta: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
    color: AppColors.subtext[100],
  },
  itemsSection: {
    marginBottom: rV(12),
  },
  summaryCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(20),
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
    borderWidth: 1,
    borderColor: "#E8ECEF",
    marginBottom: rV(18),
  },
  summaryTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
    color: AppColors.text,
    marginBottom: rV(12),
  },
  promoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rV(16),
  },
  promoInputWrap: {
    flex: 1,
    minHeight: rV(48),
    backgroundColor: "#F3F5F6",
    borderRadius: rMS(14),
    paddingHorizontal: rS(12),
    marginRight: rS(10),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
  },
  promoInput: {
    flex: 1,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
    color: AppColors.text,
    paddingVertical: 0,
  },
  addButton: {
    minHeight: rV(48),
    paddingHorizontal: rS(16),
    borderRadius: rMS(14),
    backgroundColor: AppColors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rV(12),
  },
  summaryLabel: {
    color: "#6B7280",
    fontFamily: Fonts.title,
    fontSize: rMS(14),
  },
  summaryValue: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  shippingFree: {
    color: "#16A34A",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  divider: {
    height: 1,
    backgroundColor: "#E8ECEF",
    marginBottom: rV(12),
  },
  totalLabel: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
  },
  totalValue: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
  },
  summaryHint: {
    marginTop: rV(2),
    color: AppColors.subtext[100],
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
    lineHeight: rMS(16),
  },
  checkoutButton: {
    minHeight: rV(52),
    borderRadius: rMS(16),
    backgroundColor: AppColors.text,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rV(6),
  },
  checkoutButtonText: {
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  emptyState: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(28),
    paddingHorizontal: rS(24),
    paddingVertical: rV(34),
    alignItems: "center",
    marginTop: rV(36),
  },
  emptyIconWrap: {
    width: rMS(74),
    height: rMS(74),
    borderRadius: rMS(37),
    backgroundColor: "#EEF2F4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rV(18),
  },
  emptyTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(22),
    color: AppColors.text,
    marginBottom: rV(8),
  },
  emptyDescription: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
    lineHeight: rMS(20),
    color: AppColors.subtext[100],
    textAlign: "center",
    marginBottom: rV(22),
  },
  emptyButton: {
    backgroundColor: AppColors.text,
    borderRadius: rMS(18),
    paddingHorizontal: rS(24),
    paddingVertical: rV(14),
  },
  emptyButtonText: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(14),
  },
});

export default MyCart;
