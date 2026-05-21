import ScreenLoader from "@/components/loaders/ScreenLoader";
import { AppColors } from "@/constants/Colors";
import { resolveCatalogImage } from "@/constants/catalogImages";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { useCatalogProduct } from "@/hooks/useCatalog";
import { createCheckoutSessionRequest } from "@/hooks/useOrders";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { type VoucherPreview, useVouchers } from "@/hooks/useVouchers";
import { rMS, rS, rV } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const getParam = (p: string | string[] | undefined) =>
  Array.isArray(p) ? p[0] : p;

const normalizeVoucherCode = (value: string) => value.trim().toUpperCase();

export default function CheckoutScreen() {
  const { requireAuth, user, isHydrating } = useRequireAuth();
  const { accessToken } = useAuth();
  const { cart } = useCart();
  const { showToast } = useToast();
  const { previewVoucher } = useVouchers();
  const params = useLocalSearchParams();
  const id = String(getParam(params.id) ?? "");
  const imageKey = getParam(params.imageKey);
  const paramTitle = String(getParam(params.title) ?? "Product");
  const paramCategory = getParam(params.category) ?? undefined;
  const paramPrice = Number(getParam(params.price) ?? 0);
  const paramOldPrice = Number(getParam(params.oldPrice) ?? 0) || undefined;
  const checkoutMode =
    getParam(params.mode) === "cart" || (!id && cart.length > 0) ? "cart" : "buy_now";
  const checkoutFallback = useMemo(
    () => ({
      id,
      title: paramTitle,
      category: paramCategory,
      price: paramPrice,
      oldPrice: paramOldPrice,
      image: imageKey ? resolveCatalogImage(imageKey) : undefined,
      imageKey: imageKey ?? undefined,
    }),
    [id, imageKey, paramCategory, paramOldPrice, paramPrice, paramTitle],
  );

  const { product, isLoading } = useCatalogProduct({
    productId: id,
    fallback: checkoutFallback,
  });
  const selectedColor = getParam(params.selectedColor);
  const selectedSize = getParam(params.selectedSize);
  const {
    selectedAddress,
    selectedPayment,
    checkoutVoucherCode,
    setCheckoutVoucherCode,
    isSyncingProfileData,
  } = useProfile();

  const [quantity, setQuantity] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherPreview | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  const productImage = useMemo<ImageSourcePropType | null>(
    () => (product.image ? (product.image as ImageSourcePropType) : null),
    [product.image],
  );

  const checkoutItems = useMemo(() => {
    if (checkoutMode === "cart") {
      return cart.map((item) => ({
        product_id: item.id,
        title: item.title,
        category: item.category ?? null,
        image_url:
          item.image &&
          typeof item.image === "object" &&
          "uri" in item.image &&
          typeof item.image.uri === "string"
            ? item.image.uri
            : null,
        image_key: item.imageKey ?? null,
        quantity: item.quantity,
        unit_price: item.price,
        selected_color: null,
        selected_size: null,
      }));
    }

    return [
      {
        product_id: id,
        title: product.title,
        category: product.category ?? null,
        image_url: null,
        image_key: product.imageKey ?? imageKey ?? null,
        quantity,
        unit_price: product.price ?? 0,
        selected_color: selectedColor ?? null,
        selected_size: selectedSize ?? null,
      },
    ];
  }, [
    cart,
    checkoutMode,
    id,
    imageKey,
    product.category,
    product.imageKey,
    product.price,
    product.title,
    quantity,
    selectedColor,
    selectedSize,
  ]);

  const shouldShowLoadingState = checkoutMode === "buy_now" && isLoading;
  const subtotal = useMemo(
    () =>
      checkoutItems.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0,
      ),
    [checkoutItems],
  );
  const shipping: number = 0;
  const discountAmount = appliedVoucher?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  const canPlaceOrder =
    !!user &&
    !!selectedAddress &&
    !!selectedPayment &&
    !!accessToken &&
    checkoutItems.length > 0 &&
    !isPlacingOrder &&
    !isApplyingVoucher;

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    requireAuth({
      title: "Sign in to continue",
      message:
        "Checkout is available once you’re signed in, so we can save your address, payment method, and order history.",
      onCancel: () => router.replace("/(root)/(tabs)"),
    });
  }, [isHydrating, requireAuth]);

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

  const openVoucherScreen = () => {
    router.push({
      pathname: "/(root)/screens/profileScreens/Account/Vouchers" as any,
      params: { fromCheckout: "1" },
    });
  };

  const applyVoucherCode = React.useCallback(
    async (code: string, options?: { silent?: boolean }) => {
      const normalizedCode = normalizeVoucherCode(code);
      if (!normalizedCode) {
        setVoucherError("Enter a voucher code first.");
        setAppliedVoucher(null);
        setCheckoutVoucherCode(null);
        return null;
      }

      setIsApplyingVoucher(true);
      try {
        const preview = await previewVoucher({
          voucherCode: normalizedCode,
          items: checkoutItems,
          shippingAmount: shipping,
        });
        setAppliedVoucher(preview);
        setVoucherCodeInput(preview.code);
        setCheckoutVoucherCode(preview.code);
        setVoucherError("");
        if (!options?.silent) {
          showToast(`${preview.code} applied successfully.`);
        }
        return preview;
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "We couldn't apply that voucher right now.";
        setAppliedVoucher(null);
        setCheckoutVoucherCode(null);
        setVoucherError(message);
        if (!options?.silent) {
          showToast(message);
        }
        return null;
      } finally {
        setIsApplyingVoucher(false);
      }
    },
    [checkoutItems, previewVoucher, setCheckoutVoucherCode, shipping, showToast],
  );

  const handleApplyVoucher = async () => {
    await applyVoucherCode(voucherCodeInput);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError("");
    setVoucherCodeInput("");
    setCheckoutVoucherCode(null);
  };

  useEffect(() => {
    const normalizedCode = normalizeVoucherCode(checkoutVoucherCode ?? "");
    if (!normalizedCode) {
      return;
    }

    setVoucherCodeInput((current) =>
      normalizeVoucherCode(current) === normalizedCode ? current : normalizedCode,
    );
    if (appliedVoucher?.code !== normalizedCode) {
      void applyVoucherCode(normalizedCode, { silent: true });
    }
  }, [applyVoucherCode, appliedVoucher?.code, checkoutVoucherCode]);

  useEffect(() => {
    if (!appliedVoucher?.code) {
      return;
    }

    void applyVoucherCode(appliedVoucher.code, { silent: true });
  }, [applyVoucherCode, appliedVoucher?.code, subtotal]);

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder || !selectedAddress || !selectedPayment || !accessToken) {
      return;
    }

    setIsPlacingOrder(true);
    try {
      const callbackUrl = Linking.createURL("/payments/return");
      const checkoutSession = await createCheckoutSessionRequest(accessToken, {
        source: checkoutMode,
        items: checkoutItems,
        subtotal_amount: subtotal,
        shipping_amount: shipping,
        discount_amount: discountAmount,
        total_amount: total,
        voucher_code: appliedVoucher?.code ?? null,
        address_full_name: selectedAddress.fullName,
        address_phone: selectedAddress.phone,
        address_street: selectedAddress.street,
        address_city: selectedAddress.city,
        address_region: selectedAddress.region,
        payment_type: selectedPayment.type,
        payment_label: selectedPayment.label,
        payment_network: selectedPayment.network ?? null,
        payment_phone: selectedPayment.phone ?? null,
        payment_last4: selectedPayment.cardLast4 ?? null,
        callback_url: callbackUrl,
        cancel_url: callbackUrl,
      });
      showToast("Opening secure payment...");
      await Linking.openURL(checkoutSession.authorization_url);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "We couldn't start your payment right now.";
      showToast(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            goBackOr(router, {
              fallback:
                checkoutMode === "cart"
                  ? ("/(root)/(tabs)/cart" as any)
                  : "/(root)/(tabs)",
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      {shouldShowLoadingState || isSyncingProfileData ? (
        <ScreenLoader label="Loading checkout..." />
      ) : checkoutItems.length === 0 ? (
        <View style={styles.emptyCheckout}>
          <Text style={styles.emptyTitle}>Nothing to check out yet</Text>
          <Text style={styles.emptyText}>
            Add an item to your cart or pick a product first, then we’ll get the rest of the order ready here.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            activeOpacity={0.85}
            onPress={() => router.replace("/(root)/(tabs)/cart")}
          >
            <Text style={styles.emptyButtonText}>Go to Cart</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>
                {checkoutMode === "cart" ? "Cart summary" : "Order summary"}
              </Text>
              {checkoutMode === "cart" ? (
                <View style={styles.cartSummaryList}>
                  {checkoutItems.map((item, index) => (
                    <View
                      key={`${item.product_id}-${index}`}
                      style={[
                        styles.cartSummaryRow,
                        index !== checkoutItems.length - 1 && styles.cartSummaryRowBorder,
                      ]}
                    >
                      <View style={styles.cartSummaryText}>
                        <Text style={styles.cartSummaryTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.cartSummaryMeta}>
                          {item.category || "Item"} · Qty {item.quantity}
                        </Text>
                      </View>
                      <Text style={styles.cartSummaryAmount}>
                        ₵{(item.unit_price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
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
                        <Ionicons
                          name="image-outline"
                          size={rMS(28)}
                          color={AppColors.subtext[100]}
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {product.title}
                    </Text>
                    {product.category ? (
                      <Text style={styles.category} numberOfLines={1}>
                        {product.category}
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
                      <Text style={styles.price}>₵{(product.price ?? 0).toFixed(2)}</Text>
                      {(product.oldPrice ?? 0) > 0 ? (
                        <Text style={styles.oldPrice}>₵{(product.oldPrice ?? 0).toFixed(2)}</Text>
                      ) : null}
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
              )}
            </View>

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
                      {selectedAddress.label ? (
                        <Text style={styles.deliveryTag}>{selectedAddress.label}</Text>
                      ) : null}
                      <Text style={styles.deliveryTitle}>{selectedAddress.fullName}</Text>
                      <Text style={styles.deliverySub} numberOfLines={2}>
                        {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.region} ·{" "}
                        {selectedAddress.phone}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.deliveryTitle}>Add delivery address</Text>
                      <Text style={styles.deliverySub}>Select or add an address</Text>
                    </>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={AppColors.subtext[100]}
                />
              </TouchableOpacity>
            </View>

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
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={AppColors.subtext[100]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Voucher</Text>
                <TouchableOpacity
                  style={styles.voucherBrowseBtn}
                  activeOpacity={0.82}
                  onPress={openVoucherScreen}
                >
                  <Text style={styles.voucherBrowseText}>Browse Wallet</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.voucherEntryRow}>
                <View style={styles.voucherInputWrap}>
                  <Ionicons
                    name="ticket-outline"
                    size={rMS(18)}
                    color={AppColors.subtext[100]}
                  />
                  <TextInput
                    value={voucherCodeInput}
                    onChangeText={(value) => {
                      setVoucherCodeInput(value.toUpperCase());
                      if (voucherError) {
                        setVoucherError("");
                      }
                    }}
                    autoCapitalize="characters"
                    placeholder="Enter voucher code"
                    placeholderTextColor="#94A3B8"
                    style={styles.voucherInput}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.voucherApplyBtn,
                    isApplyingVoucher && styles.voucherApplyBtnDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={isApplyingVoucher}
                  onPress={() => void handleApplyVoucher()}
                >
                  <Text style={styles.voucherApplyText}>
                    {isApplyingVoucher ? "Applying..." : "Apply"}
                  </Text>
                </TouchableOpacity>
              </View>
              {voucherError ? (
                <Text style={styles.voucherErrorText}>{voucherError}</Text>
              ) : null}
              {appliedVoucher ? (
                <View style={styles.appliedVoucherCard}>
                  <View style={styles.appliedVoucherTopRow}>
                    <View style={styles.appliedVoucherBadge}>
                      <Ionicons name="pricetag-outline" size={rMS(14)} color="#166534" />
                      <Text style={styles.appliedVoucherBadgeText}>
                        {appliedVoucher.code}
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={handleRemoveVoucher}
                      style={styles.removeVoucherBtn}
                    >
                      <Text style={styles.removeVoucherText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.appliedVoucherTitle}>{appliedVoucher.title}</Text>
                  <Text style={styles.appliedVoucherMeta}>
                    {appliedVoucher.rewardText} · You save ₵
                    {appliedVoucher.discountAmount.toFixed(2)}
                  </Text>
                  {appliedVoucher.scope === "store" ? (
                    <Text style={styles.appliedVoucherScopeNote}>
                      This promotion only applies to eligible items from{" "}
                      {appliedVoucher.storeName ?? "that store"}.
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text style={styles.voucherHelpText}>
                  Apply an ODOS promo here, or pick a claimed store offer from your wallet.
                </Text>
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>₵{subtotal.toFixed(2)}</Text>
              </View>
              {discountAmount > 0 ? (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Voucher savings</Text>
                  <Text style={styles.discountValue}>-₵{discountAmount.toFixed(2)}</Text>
                </View>
              ) : null}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping</Text>
                <Text style={[styles.totalValue, styles.shippingFree]}>
                  {shipping === 0 ? "FREE" : `₵${shipping.toFixed(2)}`}
                </Text>
              </View>
              <View style={[styles.totalRow, styles.totalRowLast]}>
                <Text style={styles.totalLabelBold}>Total</Text>
                <Text style={styles.totalValueBold}>₵{total.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>

          <View style={styles.footer}>
            {!canPlaceOrder ? (
              <Text style={styles.footerHint}>
                {!selectedAddress && !selectedPayment
                  ? "Add address and payment to continue"
                  : !selectedAddress
                    ? "Add delivery address to continue"
                    : !selectedPayment
                      ? "Add payment method to continue"
                      : "Sign in to continue"}
              </Text>
            ) : null}
            <TouchableOpacity
              style={[
                styles.placeOrderBtn,
                !canPlaceOrder && styles.placeOrderBtnDisabled,
              ]}
              onPress={handlePlaceOrder}
              activeOpacity={0.85}
              disabled={!canPlaceOrder}
            >
              <Text style={styles.placeOrderText}>
                {isPlacingOrder
                  ? "Placing order..."
                  : `Place order · ₵${total.toFixed(2)}`}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    color: AppColors.secondary,
    textDecorationLine: "line-through",
    marginLeft: rS(8),
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityLabel: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.textBold,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
  },
  quantityBtn: {
    width: rMS(30),
    height: rMS(30),
    borderRadius: rMS(10),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityValue: {
    fontSize: rMS(14),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    minWidth: rS(18),
    textAlign: "center",
  },
  cartSummaryList: {
    gap: rV(10),
  },
  cartSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(12),
    paddingBottom: rV(10),
  },
  cartSummaryRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E8ECF1",
  },
  cartSummaryText: {
    flex: 1,
  },
  cartSummaryTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  cartSummaryMeta: {
    marginTop: rV(3),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  cartSummaryAmount: {
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryIcon: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(12),
    backgroundColor: "#F2F6FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: rS(12),
  },
  deliveryText: {
    flex: 1,
  },
  deliveryTag: {
    alignSelf: "flex-start",
    marginBottom: rV(4),
    paddingHorizontal: rS(10),
    paddingVertical: rV(4),
    borderRadius: rMS(999),
    backgroundColor: "#EEF2F6",
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: AppColors.secondary,
  },
  deliveryTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  deliverySub: {
    marginTop: rV(4),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIcon: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(12),
    backgroundColor: "#F2F6FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: rS(12),
  },
  paymentText: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  paymentSub: {
    marginTop: rV(4),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  voucherBrowseBtn: {
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
    borderRadius: rMS(999),
    backgroundColor: "#EEF2F6",
  },
  voucherBrowseText: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: AppColors.secondary,
  },
  voucherEntryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
  },
  voucherInputWrap: {
    flex: 1,
    minHeight: rV(48),
    borderRadius: rMS(14),
    borderWidth: 1,
    borderColor: "#D8E0EA",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: rS(12),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
  },
  voucherInput: {
    flex: 1,
    fontSize: rMS(13),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    letterSpacing: 0.4,
  },
  voucherApplyBtn: {
    minHeight: rV(48),
    paddingHorizontal: rS(18),
    borderRadius: rMS(14),
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  voucherApplyBtnDisabled: {
    opacity: 0.7,
  },
  voucherApplyText: {
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  voucherHelpText: {
    marginTop: rV(10),
    fontSize: rMS(12),
    lineHeight: rMS(18),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  voucherErrorText: {
    marginTop: rV(10),
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: "#B91C1C",
  },
  appliedVoucherCard: {
    marginTop: rV(12),
    borderRadius: rMS(14),
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: rS(12),
  },
  appliedVoucherTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(12),
  },
  appliedVoucherBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
    borderRadius: rMS(999),
    backgroundColor: "#DCFCE7",
  },
  appliedVoucherBadgeText: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: "#166534",
    letterSpacing: 0.4,
  },
  removeVoucherBtn: {
    paddingVertical: rV(4),
  },
  removeVoucherText: {
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: "#B91C1C",
  },
  appliedVoucherTitle: {
    marginTop: rV(10),
    fontSize: rMS(14),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  appliedVoucherMeta: {
    marginTop: rV(4),
    fontSize: rMS(12),
    lineHeight: rMS(18),
    fontFamily: Fonts.text,
    color: "#166534",
  },
  appliedVoucherScopeNote: {
    marginTop: rV(6),
    fontSize: rMS(11.5),
    lineHeight: rMS(17),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rV(12),
  },
  totalRowLast: {
    marginBottom: 0,
    paddingTop: rV(4),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E8ECF1",
  },
  totalLabel: {
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  totalValue: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  totalLabelBold: {
    fontSize: rMS(15),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  totalValueBold: {
    fontSize: rMS(16),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  discountValue: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: "#166534",
  },
  shippingFree: {
    color: "#15803D",
  },
  bottomSpacer: {
    height: rV(120),
  },
  footer: {
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
    color: AppColors.secondary,
    marginBottom: rV(10),
  },
  placeOrderBtn: {
    minHeight: rV(52),
    borderRadius: rMS(16),
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  placeOrderBtnDisabled: {
    backgroundColor: "#B8C1CC",
  },
  placeOrderText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  emptyCheckout: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: rS(24),
  },
  emptyTitle: {
    fontSize: rMS(18),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
    textAlign: "center",
    marginBottom: rV(8),
  },
  emptyText: {
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    textAlign: "center",
    lineHeight: rMS(20),
  },
  emptyButton: {
    alignSelf: "center",
    marginTop: rV(18),
    paddingHorizontal: rS(18),
    paddingVertical: rV(12),
    borderRadius: rMS(14),
    backgroundColor: AppColors.primary,
  },
  emptyButtonText: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
});
