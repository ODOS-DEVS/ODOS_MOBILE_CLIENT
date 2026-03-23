import { AppColors } from "@/constants/Colors";
import {
  flashSales,
  PopularProducts,
  recommendations,
} from "@/constants/Data";
import Fonts from "@/constants/Fonts";
import { useProfile } from "@/context/ProfileContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const getParam = (p: string | string[] | undefined) =>
  Array.isArray(p) ? p[0] : p;

function findProductImage(id: string): ImageSourcePropType | null {
  const all = [...flashSales, ...recommendations, ...PopularProducts];
  const found = all.find((item) => item.id === id);
  return found?.image ?? null;
}

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const id = String(getParam(params.id) ?? "");
  const title = String(getParam(params.title) ?? "Product");
  const price = Number(getParam(params.price) ?? 0);
  const oldPrice = Number(getParam(params.oldPrice) ?? 0);
  const category = getParam(params.category);
  const selectedColor = getParam(params.selectedColor);
  const selectedSize = getParam(params.selectedSize);

  const {
    selectedAddress,
    selectedPayment,
    clearCheckoutSelection,
  } = useProfile();

  const [quantity, setQuantity] = useState(1);

  const productImage = useMemo(() => findProductImage(id), [id]);
  const subtotal = price * quantity;
  const shipping = 0;
  const total = subtotal + shipping;

  const canPlaceOrder = !!selectedAddress && !!selectedPayment;

  const openAddressScreen = () => {
    router.push({
      pathname: "/(root)/screens/profileScreens/Account/Addresses" as any,
      params: { fromCheckout: "1" },
    });
  };

  const openPaymentScreen = () => {
    router.push({
       pathname: "/(root)/screens/profileScreens/Account/Wallet" as any,
      params: { fromCheckout: "1" },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product summary */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Order summary</Text>
          <View style={styles.row}>
            <View style={styles.imageWrap}>
              {productImage ? (
                <Image
                  source={productImage}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.productImage, styles.placeholderImage]}>
                  <Ionicons name="image-outline" size={rMS(28)} color={AppColors.subtext[100]} />
                </View>
              )}
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {title}
              </Text>
              {category ? (
                <Text style={styles.category} numberOfLines={1}>
                  {category}
                </Text>
              ) : null}
              {(selectedColor || selectedSize) && (
                <View style={styles.variantRow}>
                  {selectedColor ? (
                    <View style={styles.variantPill}>
                      <Text style={styles.variantPillText}>Color: {selectedColor}</Text>
                    </View>
                  ) : null}
                  {selectedSize ? (
                    <View style={styles.variantPill}>
                      <Text style={styles.variantPillText}>Size: {selectedSize}</Text>
                    </View>
                  ) : null}
                </View>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.price}>₵{price.toFixed(2)}</Text>
                {oldPrice > 0 && (
                  <Text style={styles.oldPrice}>₵{oldPrice.toFixed(2)}</Text>
                )}
              </View>
              <View style={styles.quantityRow}>
                <Text style={styles.quantityLabel}>Qty</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={18} color={AppColors.text} />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={() => setQuantity((q) => q + 1)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={18} color={AppColors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Delivery</Text>
          <TouchableOpacity
            style={styles.deliveryRow}
            activeOpacity={0.7}
            onPress={openAddressScreen}
          >
            <View style={styles.deliveryIcon}>
              <Ionicons name="location-outline" size={20} color={AppColors.primary} />
            </View>
            <View style={styles.deliveryText}>
              {selectedAddress ? (
                <>
                  <Text style={styles.deliveryTitle}>{selectedAddress.fullName}</Text>
                  <Text style={styles.deliverySub} numberOfLines={2}>
                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.region} · {selectedAddress.phone}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.deliveryTitle}>Add delivery address</Text>
                  <Text style={styles.deliverySub}>Select or add an address</Text>
                </>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={AppColors.subtext[100]} />
          </TouchableOpacity>
        </View>

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Payment</Text>
          <TouchableOpacity
            style={styles.paymentRow}
            activeOpacity={0.7}
            onPress={openPaymentScreen}
          >
            <View style={styles.paymentIcon}>
              <Ionicons name="card-outline" size={20} color={AppColors.primary} />
            </View>
            <View style={styles.paymentText}>
              {selectedPayment ? (
                <>
                  <Text style={styles.paymentTitle}>{selectedPayment.label}</Text>
                  <Text style={styles.paymentSub}>
                    {selectedPayment.type === "card"
                      ? "Debit / Credit Card"
                      : selectedPayment.network ?? "MoMo"}
                  </Text>
                </>
              ) : (
                <Text style={styles.paymentTitle}>Add payment method</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={AppColors.subtext[100]} />
          </TouchableOpacity>
        </View>

        {/* Totals */}
        <View style={styles.card}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₵{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={[styles.totalValue, styles.shippingFree]}>
              {shipping === 0 ? "FREE" : `₵${(shipping as number).toFixed(2)}`}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowLast]}>
            <Text style={styles.totalLabelBold}>Total</Text>
            <Text style={styles.totalValueBold}>₵{total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Place order */}
      <View style={styles.footer}>
        {!canPlaceOrder && (
          <Text style={styles.footerHint}>
            {!selectedAddress && !selectedPayment
              ? "Add address and payment to continue"
              : !selectedAddress
                ? "Add delivery address to continue"
                : "Add payment method to continue"}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.placeOrderBtn, !canPlaceOrder && styles.placeOrderBtnDisabled]}
          onPress={() => {
            if (!canPlaceOrder) return;
            clearCheckoutSelection();
            // TODO: submit order then navigate to confirmation
            router.back();
          }}
          activeOpacity={0.85}
          disabled={!canPlaceOrder}
        >
          <Text style={styles.placeOrderText}>
            Place order · ₵{total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rS(16),
    paddingTop: rV(36),
    paddingBottom: rV(12),
    backgroundColor: AppColors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEE",
  },
  backButton: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: rMS(18),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  headerSpacer: {
    width: rMS(40),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    padding: rS(16),
    marginBottom: rV(12),
  },
  sectionLabel: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.subtext[100],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: rV(12),
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  imageWrap: {
    borderRadius: rMS(12),
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
  },
  productImage: {
    width: rMS(88),
    height: rMS(88),
    borderRadius: rMS(12),
  },
  placeholderImage: {
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    flex: 1,
    marginLeft: rS(12),
  },
  productTitle: {
    fontSize: rMS(15),
    fontFamily: Fonts.title,
    color: AppColors.text,
    marginBottom: rV(4),
  },
  category: {
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    marginBottom: rV(6),
  },
  variantRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(6),
    marginBottom: rV(8),
  },
  variantPill: {
    paddingHorizontal: rS(8),
    paddingVertical: rV(4),
    borderRadius: rMS(8),
    backgroundColor: "#EEF2F5",
  },
  variantPillText: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rV(10),
  },
  price: {
    fontSize: rMS(16),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  oldPrice: {
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
    marginLeft: rS(8),
    textDecorationLine: "line-through",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityLabel: {
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: rMS(20),
    paddingVertical: rV(4),
    paddingHorizontal: rS(6),
  },
  quantityBtn: {
    width: rMS(28),
    height: rMS(28),
    alignItems: "center",
    justifyContent: "center",
  },
  quantityValue: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
    minWidth: rMS(28),
    textAlign: "center",
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryIcon: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#EEF2F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: rS(12),
  },
  deliveryText: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  deliverySub: {
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
    marginTop: rV(2),
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentText: {
    flex: 1,
  },
  paymentSub: {
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
    marginTop: rV(2),
  },
  paymentIcon: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#EEF2F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: rS(12),
  },
  paymentTitle: {
    flex: 1,
    fontSize: rMS(14),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: rV(8),
  },
  totalRowLast: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EEE",
    marginTop: rV(4),
    paddingTop: rV(12),
  },
  totalLabel: {
    fontSize: rMS(14),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  totalValue: {
    fontSize: rMS(14),
    fontFamily: Fonts.text,
    color: AppColors.text,
  },
  shippingFree: {
    color: "#16a34a",
    fontFamily: Fonts.textBold,
  },
  totalLabelBold: {
    fontSize: rMS(16),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  totalValueBold: {
    fontSize: rMS(16),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  bottomSpacer: {
    height: rV(100),
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: rS(16),
    paddingTop: rV(12),
    paddingBottom: rV(24),
    backgroundColor: AppColors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EEE",
  },
  footerHint: {
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
    marginBottom: rV(8),
    textAlign: "center",
  },
  placeOrderBtn: {
    backgroundColor: AppColors.primary,
    borderRadius: rMS(50),
    paddingVertical: rV(16),
    alignItems: "center",
    justifyContent: "center",
  },
  placeOrderBtnDisabled: {
    opacity: 0.5,
  },
  placeOrderText: {
    fontSize: rMS(16),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
});
