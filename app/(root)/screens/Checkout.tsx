import AssistantEntryButton from "@/components/assistant/AssistantEntryButton";
import CheckoutPaymentSection from "@/components/checkout/CheckoutPaymentSection";
import CheckoutProcessingOverlay, {
  type CheckoutProcessingMode,
} from "@/components/checkout/CheckoutProcessingOverlay";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import DeliveryOptionsCard from "@/components/delivery/DeliveryOptionsCard";
import {
  AccountEmptyState,
  AccountListCard,
  AccountSectionCard,
  useAccountStyles,
  formatOrderMoney,
  OrderSelectableRow,
  estimateOrderStickyFooterHeight,
  OrderStickyFooter,
  OrderSummaryRow,
} from "@/components/orders/OrderUi";
import { resolveCatalogImage } from "@/constants/catalogImages";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { useCatalogProduct } from "@/hooks/useCatalog";
import { createCheckoutSessionRequest, createWalletCheckoutRequest } from "@/hooks/useOrders";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { type VoucherPreview, useVouchers } from "@/hooks/useVouchers";
import { useDeliveryQuote } from "@/hooks/useDeliveryQuote";
import { useDeliveryStore } from "@/stores/deliveryStore";
import { useCheckoutStyles } from "@/styles/themedCheckoutStyles";
import { rMS, rS, rV } from "@/styles/responsive";
import { buildOrderItemImagePayload } from "@/utils/orderImages";
import { goBackOr } from "@/utils/navigation";
import {
  isWalletCheckoutSelection,
  WALLET_CHECKOUT_PAYMENT_ID,
  walletCoversOrder,
} from "@/utils/checkoutPayment";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ImageSourcePropType,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import KeyboardAwareScrollView from "@/components/layout/KeyboardAwareScrollView";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getParam = (p: string | string[] | undefined) =>
  Array.isArray(p) ? p[0] : p;

const normalizeVoucherCode = (value: string) => value.trim().toUpperCase();

function normalizeRouteParamsFromUrl(url: string) {
  const parsed = Linking.parse(url);
  const queryParams = parsed.queryParams ?? {};
  const normalizedParams: Record<string, string> = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (typeof value === "string" && value.length > 0) {
      normalizedParams[key] = value;
      continue;
    }

    if (Array.isArray(value) && value[0]) {
      normalizedParams[key] = String(value[0]);
    }
  }

  return normalizedParams;
}

export default function CheckoutScreen() {
  const accountStyles = useAccountStyles();
  const styles = useCheckoutStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { requireAuth, user, isHydrating } = useRequireAuth();
  const { accessToken } = useAuth();
  const { cart, clearCart } = useCart();
  const { showSuccessToast, showErrorToast, showInfoToast } = useToast();
  const { previewVoucher, suggestVouchers, calculatePromotions } = useVouchers();
  const params = useLocalSearchParams();
  const id = String(getParam(params.id) ?? "").trim();
  const imageKey = getParam(params.imageKey);
  const paramTitle = String(getParam(params.title) ?? "Product");
  const paramCategory = getParam(params.category) ?? undefined;
  const paramPrice = Number(getParam(params.price) ?? 0);
  const paramOldPrice = Number(getParam(params.oldPrice) ?? 0) || undefined;
  const hasBuyNowProduct = Boolean(id);
  const checkoutMode =
    getParam(params.mode) === "cart" || (!hasBuyNowProduct && cart.length > 0)
      ? "cart"
      : "buy_now";
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
    checkoutPaymentId,
    setCheckoutPaymentId,
    paymentMethods,
    checkoutVoucherCode,
    setCheckoutVoucherCode,
    isSyncingProfileData,
    customerWallet,
    refreshProfileData,
  } = useProfile();
  const { selectedMethodId, setSelectedMethodId, resetDeliveryMethod } = useDeliveryStore();

  const [quantity, setQuantity] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [processingMode, setProcessingMode] = useState<CheckoutProcessingMode | null>(null);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherPreview | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [suggestedVouchers, setSuggestedVouchers] = useState<VoucherPreview[]>([]);

  const routeToPaymentReturn = useCallback(
    (params: Record<string, string>) => {
      router.replace({
        pathname: "/payments/return" as any,
        params,
      });
    },
    [],
  );

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
        ...buildOrderItemImagePayload({
          image: item.image,
          imageKey: item.imageKey,
          imageUrl: item.imageUrl,
        }),
        quantity: item.quantity,
        unit_price: item.price,
        selected_color: null,
        selected_size: null,
      }));
    }

    if (!hasBuyNowProduct) {
      return [];
    }

    return [
      {
        product_id: id,
        title: product.title,
        category: product.category ?? null,
        ...buildOrderItemImagePayload({
          image: product.image,
          imageKey: product.imageKey ?? imageKey ?? null,
          imageUrl: product.imageUrl,
        }),
        quantity,
        unit_price: product.price ?? 0,
        selected_color: selectedColor ?? null,
        selected_size: selectedSize ?? null,
      },
    ];
  }, [
    hasBuyNowProduct,
    cart,
    checkoutMode,
    id,
    imageKey,
    product.category,
    product.image,
    product.imageKey,
    product.imageUrl,
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
  const {
    options: deliveryOptions,
    selectedMethod: resolvedDeliveryMethodId,
    shippingAmount: shipping,
    isLoading: isLoadingDelivery,
    error: deliveryQuoteError,
  } = useDeliveryQuote({
    subtotal,
    region: selectedAddress?.region,
    city: selectedAddress?.city,
    selectedMethod: selectedMethodId,
  });

  useEffect(() => {
    if (resolvedDeliveryMethodId !== selectedMethodId) {
      setSelectedMethodId(resolvedDeliveryMethodId);
    }
  }, [resolvedDeliveryMethodId, selectedMethodId, setSelectedMethodId]);
  const discountAmount = appliedVoucher?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + shipping - discountAmount);
  const payingWithWallet = isWalletCheckoutSelection(selectedPayment, checkoutPaymentId);
  const walletInsufficient = payingWithWallet && !walletCoversOrder(customerWallet, total);

  const canPlaceOrder =
    !!user &&
    !!selectedAddress &&
    !!selectedPayment &&
    !!accessToken &&
    checkoutItems.length > 0 &&
    !isPlacingOrder &&
    !isApplyingVoucher &&
    !isLoadingDelivery &&
    !walletInsufficient;

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

  useFocusEffect(
    useCallback(() => {
      void refreshProfileData();
    }, [refreshProfileData]),
  );

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
          showSuccessToast(`${preview.code} applied successfully.`);
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
          showErrorToast(message);
        }
        return null;
      } finally {
        setIsApplyingVoucher(false);
      }
    },
    [checkoutItems, previewVoucher, setCheckoutVoucherCode, shipping, showSuccessToast, showErrorToast],
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

  useEffect(() => {
    if (!user || appliedVoucher || checkoutItems.length === 0) {
      return;
    }

    let cancelled = false;
    void calculatePromotions({
      items: checkoutItems,
      shippingAmount: shipping,
      includeAutoApply: true,
    }).then((result) => {
      if (cancelled || !result?.appliedPromotions.length) {
        return;
      }
      const best = result.appliedPromotions[0];
      if (best?.code) {
        void applyVoucherCode(best.code, { silent: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [applyVoucherCode, appliedVoucher, calculatePromotions, checkoutItems, shipping, user]);

  useEffect(() => {
    if (!user || appliedVoucher || checkoutItems.length === 0) {
      setSuggestedVouchers([]);
      return;
    }

    let cancelled = false;
    void suggestVouchers({
      items: checkoutItems,
      shippingAmount: shipping,
    }).then((items) => {
      if (!cancelled) {
        setSuggestedVouchers(items);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [appliedVoucher, checkoutItems, shipping, suggestVouchers, user]);

  const executeWalletCheckout = async () => {
    if (!accessToken || !selectedAddress) {
      return;
    }

    const walletResult = await createWalletCheckoutRequest(accessToken, {
      source: checkoutMode,
      items: checkoutItems,
      subtotal_amount: subtotal,
      shipping_amount: shipping,
      delivery_method: resolvedDeliveryMethodId,
      discount_amount: discountAmount,
      total_amount: total,
      voucher_code: appliedVoucher?.code ?? null,
      address_full_name: selectedAddress.fullName,
      address_phone: selectedAddress.phone,
      address_street: selectedAddress.street,
      address_city: selectedAddress.city,
      address_region: selectedAddress.region,
      payment_type: "wallet",
      payment_label: "ODOS Wallet",
      payment_network: null,
      payment_phone: null,
      payment_last4: null,
    });

    if (checkoutMode === "cart") {
      await clearCart();
    }
    resetDeliveryMethod();
    setCheckoutPaymentId(null);
    void refreshProfileData();
    showSuccessToast(walletResult.message);
    router.replace({
      pathname: "/(root)/screens/order-success" as any,
      params: {
        orderId: walletResult.order.id,
        orderNumber: walletResult.order.order_number,
        total: String(walletResult.order.total_amount),
        itemCount: String(
          walletResult.order.items.reduce((sum, item) => sum + item.quantity, 0),
        ),
        eta: walletResult.order.tracking_eta ?? "Estimated delivery in 2–3 days",
      },
    });
  };

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder || !selectedAddress || !selectedPayment || !accessToken) {
      return;
    }

    let keepProcessingOverlay = false;
    try {
      if (payingWithWallet) {
        const balanceAfter = (customerWallet?.available_balance ?? 0) - total;
        await new Promise<void>((resolve, reject) => {
          Alert.alert(
            "Pay with ODOS Wallet?",
            `₵${total.toFixed(2)} will be deducted instantly. Remaining balance: ₵${Math.max(
              0,
              balanceAfter,
            ).toFixed(2)}.`,
            [
              { text: "Cancel", style: "cancel", onPress: () => reject(new Error("cancelled")) },
              {
                text: "Confirm & pay",
                onPress: () => resolve(),
              },
            ],
          );
        });

        setIsPlacingOrder(true);
        setProcessingMode("wallet");
        await executeWalletCheckout();
        keepProcessingOverlay = true;
        return;
      }

      setIsPlacingOrder(true);
      setProcessingMode("paystack");

      const callbackUrl = Linking.createURL("/payments/return");
      const checkoutSession = await createCheckoutSessionRequest(accessToken, {
        source: checkoutMode,
        items: checkoutItems,
        subtotal_amount: subtotal,
        shipping_amount: shipping,
        delivery_method: resolvedDeliveryMethodId,
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
      showInfoToast("Opening secure payment...");
      setProcessingMode(null);
      const checkoutResult = await WebBrowser.openAuthSessionAsync(
        checkoutSession.authorization_url,
        callbackUrl,
      );

      if (checkoutResult.type === "success" && checkoutResult.url) {
        routeToPaymentReturn(normalizeRouteParamsFromUrl(checkoutResult.url));
        return;
      }

      if (checkoutResult.type === "cancel" || checkoutResult.type === "dismiss") {
        routeToPaymentReturn({
          orderId: checkoutSession.order_id,
          reference: checkoutSession.reference,
        });
      }
    } catch (error) {
      if (error instanceof Error && error.message === "cancelled") {
        return;
      }
      const message =
        error instanceof Error && error.message
          ? error.message
          : payingWithWallet
            ? "We couldn't complete your wallet payment right now."
            : "We couldn't start your payment right now.";
      showErrorToast(message);
    } finally {
      setIsPlacingOrder(false);
      if (!keepProcessingOverlay) {
        setProcessingMode(null);
      }
    }
  };

  const footerHint = useMemo(() => {
    if (checkoutItems.length === 0) {
      return undefined;
    }

    if (isPlacingOrder) {
      return "Processing your order...";
    }

    if (isApplyingVoucher) {
      return "Applying voucher...";
    }

    if (isHydrating) {
      return "Loading your account...";
    }

    if (!user || !accessToken) {
      return "Sign in to continue";
    }

    if (!selectedAddress && !selectedPayment) {
      return "Add address and payment to continue";
    }

    if (!selectedAddress) {
      return "Add delivery address to continue";
    }

    if (!selectedPayment) {
      return "Add payment method to continue";
    }

    if (isLoadingDelivery) {
      return "Calculating delivery...";
    }

    if (walletInsufficient) {
      return "Insufficient wallet balance for this order";
    }

    if (payingWithWallet) {
      return "Paid instantly from your ODOS wallet";
    }

    return undefined;
  }, [
    accessToken,
    checkoutItems.length,
    isApplyingVoucher,
    isHydrating,
    isLoadingDelivery,
    isPlacingOrder,
    payingWithWallet,
    selectedAddress,
    selectedPayment,
    user,
    walletInsufficient,
  ]);

  const footerScrollPadding = useMemo(
    () =>
      estimateOrderStickyFooterHeight({
        hasHint: Boolean(footerHint),
        hasSplitAmount: true,
        bottomInset: insets.bottom,
      }),
    [footerHint, insets.bottom],
  );

  return (
    <View style={accountStyles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + rV(8) }]}>
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
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      {shouldShowLoadingState || isSyncingProfileData ? (
        <ScreenLoader label="Loading checkout..." />
      ) : checkoutItems.length === 0 ? (
        <View style={styles.emptyCheckout}>
          <AccountEmptyState
            icon="bag-outline"
            title="Nothing to check out yet"
            message="Add an item to your cart or pick a product first, then we'll get the rest of the order ready here."
            actionLabel="Go to Cart"
            onAction={() => router.replace("/(root)/(tabs)/cart")}
          />
        </View>
      ) : (
        <>
          <KeyboardAwareScrollView
            style={styles.scroll}
            contentContainerStyle={[
              accountStyles.content,
              styles.scrollContent,
              { paddingBottom: footerScrollPadding },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <AccountSectionCard
              title={checkoutMode === "cart" ? "Cart summary" : "Order summary"}
            >
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
                          color={colors.textMuted}
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
                          <Ionicons name="remove" size={18} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityBtn}
                          onPress={() => setQuantity((q) => q + 1)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add" size={18} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </AccountSectionCard>

            <AccountSectionCard title="Delivery">
              <OrderSelectableRow
                icon="location-outline"
                tag={selectedAddress?.label}
                title={selectedAddress?.fullName ?? "Add delivery address"}
                subtitle={
                  selectedAddress
                    ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.region} · ${selectedAddress.phone}`
                    : "Select or add an address"
                }
                onPress={openAddressScreen}
              />
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: rS(6),
                  paddingVertical: rV(8),
                }}
                activeOpacity={0.82}
                onPress={openAddressScreen}
              >
                <Ionicons name="swap-horizontal-outline" size={rMS(14)} color={colors.primary} />
                <Text
                  style={{
                    fontFamily: Fonts.titleBold,
                    fontSize: rMS(12),
                    color: colors.primary,
                  }}
                >
                  {selectedAddress ? "Change address" : "Browse addresses"}
                </Text>
              </TouchableOpacity>
            </AccountSectionCard>

            <AccountSectionCard title="Delivery speed">
              <DeliveryOptionsCard
                subtotal={subtotal}
                region={selectedAddress?.region}
                city={selectedAddress?.city}
                selectedMethodId={selectedMethodId}
                onSelectMethod={setSelectedMethodId}
                options={deliveryOptions}
                isLoading={isLoadingDelivery}
                statusMessage={deliveryQuoteError}
                variant="inline"
              />
            </AccountSectionCard>

            <AccountSectionCard title="Payment">
              <CheckoutPaymentSection
                wallet={customerWallet}
                paymentMethods={paymentMethods}
                selectedPaymentId={checkoutPaymentId ?? selectedPayment?.id ?? null}
                selectedPayment={selectedPayment}
                orderTotal={total}
                onSelectWallet={() => setCheckoutPaymentId(WALLET_CHECKOUT_PAYMENT_ID)}
                onSelectMethod={(id) => setCheckoutPaymentId(id)}
                onManagePayments={openPaymentScreen}
              />
            </AccountSectionCard>

            <AccountListCard>
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
                    color={colors.textMuted}
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
                    placeholderTextColor={colors.placeholder}
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
                      <Ionicons name="pricetag-outline" size={rMS(14)} color={colors.successText} />
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
                    {appliedVoucher.rewardText} · You saved GH₵
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
                <>
                  <Text style={styles.voucherHelpText}>
                    Apply an ODOS promo here, or pick a claimed store offer from your wallet.
                  </Text>
                  {suggestedVouchers.length > 0 ? (
                    <View style={styles.suggestedVouchersWrap}>
                      <Text style={styles.suggestedVouchersTitle}>Best for your cart</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.suggestedVouchersRow}
                      >
                        {suggestedVouchers.map((suggestion) => (
                          <TouchableOpacity
                            key={suggestion.voucherId}
                            style={styles.suggestedVoucherChip}
                            activeOpacity={0.82}
                            onPress={() => void applyVoucherCode(suggestion.code)}
                          >
                            <Text style={styles.suggestedVoucherCode}>{suggestion.code}</Text>
                            <Text style={styles.suggestedVoucherMeta}>
                              Save GH₵{suggestion.discountAmount.toFixed(2)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  ) : null}
                </>
              )}
            </AccountListCard>

            <AccountSectionCard title="Order total">
              <OrderSummaryRow label="Subtotal" value={formatOrderMoney(subtotal)} />
              {discountAmount > 0 ? (
                <OrderSummaryRow
                  label="Voucher savings"
                  value={`-${formatOrderMoney(discountAmount).slice(1)}`}
                  accent="discount"
                />
              ) : null}
              <OrderSummaryRow
                label={
                  deliveryOptions.find((option) => option.id === resolvedDeliveryMethodId)
                    ?.title ?? "Shipping"
                }
                value={shipping === 0 ? "FREE" : formatOrderMoney(shipping)}
                accent={shipping === 0 ? "success" : "default"}
              />
              <OrderSummaryRow label="Total" value={formatOrderMoney(total)} last />
            </AccountSectionCard>

            <View style={{ paddingHorizontal: rS(16), paddingTop: rV(8) }}>
              <AssistantEntryButton screen="checkout" label="Need help before you pay?" compact />
            </View>

          </KeyboardAwareScrollView>

          <OrderStickyFooter
            hint={footerHint}
            amountValue={formatOrderMoney(total)}
            primaryLabel={isPlacingOrder ? "Processing..." : "Pay"}
            onPrimaryPress={handlePlaceOrder}
            disabled={!canPlaceOrder}
          />
        </>
      )}
      {processingMode ? (
        <CheckoutProcessingOverlay
          visible
          mode={processingMode}
          subtotal={subtotal}
          shipping={shipping}
          discount={discountAmount}
          total={total}
        />
      ) : null}
    </View>
  );
}
