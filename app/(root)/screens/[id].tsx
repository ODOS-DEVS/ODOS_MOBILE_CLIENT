import AssistantEntryButton from "@/components/assistant/AssistantEntryButton";
import CollapsibleShippingCard from "@/components/cards/CollapsableCard";
import FlashSaleCountdown from "@/components/deals/FlashSaleCountdown";
import DeliveryOptionsCard from "@/components/delivery/DeliveryOptionsCard";
import { ProductDetailSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProductImageGalleryModal from "@/components/media/ProductImageGalleryModal";
import ProductDetailBottomBar from "@/components/product/ProductDetailBottomBar";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetailRecommendations from "@/components/product/ProductDetailRecommendations";
import MakeOfferSheet from "@/components/negotiation/MakeOfferSheet";
import { ProductReviewsPanel } from "@/components/reviews/ReviewUi";
import ProductShareSheet from "@/components/share/ProductShareSheet";
import { useProfile } from "@/context/ProfileContext";
import { useTheme } from "@/context/ThemeContext";
import { useCatalogProduct } from "@/hooks/useCatalog";
import { useStore } from "@/hooks/useCommerce";
import { useDeliveryQuote } from "@/hooks/useDeliveryQuote";
import { useOrders } from "@/hooks/useOrders";
import {
  useForYouRecommendations,
  useSimilarProducts,
} from "@/hooks/useRecommendations";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useProductReviews, useReviews } from "@/hooks/useReviews";
import { useToast } from "@/context/ToastContext";
import {
  BEHAVIOR_EVENT_TYPES,
  trackBehaviorEvent,
} from "@/services/behaviorTracking";
import { createProductDetailStyles } from "@/styles/productDetailStyles";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { getSecondsRemaining } from "@/utils/countdown";
import { formatCurrency } from "@/utils/currency";
import { resolveApiMediaUrl, resolveImageSource } from "@/utils/media";
import { goBackOr } from "@/utils/navigation";
import {
  buildReviewComposerRoute,
  resolveProductReviewTarget,
} from "@/utils/reviewNavigation";
import type { ProductSharePayload } from "@/utils/shareCatalog";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const namedColorMap: Record<string, string> = {
  black: "#111827",
  white: "#F9FAFB",
  tan: "#C9A37E",
  stone: "#D6D3D1",
  brown: "#6B4F3F",
  burgundy: "#7F1D1D",
  red: "#DC2626",
  blue: "#2563EB",
  navy: "#1E3A8A",
  green: "#15803D",
  olive: "#556B2F",
  pink: "#EC4899",
  gold: "#CA8A04",
  silver: "#94A3B8",
  grey: "#6B7280",
  gray: "#6B7280",
  cream: "#F5F1E8",
  beige: "#E5D3B3",
};

function getParam(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param;
}

function toNumber(value: string | string[] | undefined, fallback = 0) {
  const parsed = Number(getParam(value) ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function titleFromSlug(value?: string | null) {
  if (!value) {
    return null;
  }

  return value
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function buildColorOptions(colors?: string[]) {
  return (colors ?? []).map((color) => {
    const key = color.trim().toLowerCase();
    return {
      id: key.replace(/\s+/g, "-"),
      label: color.trim(),
      hex: namedColorMap[key] ?? "#CBD5E1",
    };
  });
}

function buildDescriptionLines(value?: string) {
  if (!value?.trim()) {
    return [
      "Product details will appear here once the catalog description is available.",
    ];
  }

  const lines = value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length > 0 ? lines : [value.trim()];
}

function formatReviewCountLabel(value?: string | number | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value} review${value === 1 ? "" : "s"}`;
  }

  if (typeof value === "string" && value.trim()) {
    const normalized = value.trim();
    return /review/i.test(normalized) ? normalized : `${normalized} reviews`;
  }

  return "Customer reviews";
}



export default function ProductDetail() {
  const { colors } = useTheme();
  const styles = useMemo(() => createProductDetailStyles(colors), [colors]);
  const { requireAuth } = useRequireAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const params = useLocalSearchParams();
  const id = String(getParam(params.id) ?? "");
  const paramTitle = getParam(params.title) ?? "";
  const paramCategory = getParam(params.category) ?? undefined;
  const paramImage = getParam(params.image);
  const paramImageKey = getParam(params.imageKey) ?? undefined;
  const paramImageUrl = getParam(params.imageUrl) ?? undefined;
  const paramPrice = toNumber(params.price);
  const paramOldPrice = toNumber(params.oldPrice);
  const paramRating = toNumber(params.rating);
  const paramReviews = getParam(params.reviews) ?? undefined;
  const paramDiscount = getParam(params.discount) ?? undefined;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [offerSheetOpen, setOfferSheetOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);

  const productFallback = useMemo(
    () => ({
      id,
      title: paramTitle,
      category: paramCategory,
      price: paramPrice,
      oldPrice: paramOldPrice > 0 ? paramOldPrice : undefined,
      rating: paramRating > 0 ? paramRating : undefined,
      reviews: paramReviews,
      discount: paramDiscount,
      image:
        paramImage && typeof paramImage === "object"
          ? paramImage
          : resolveImageSource(paramImageUrl ?? paramImage, paramImageKey),
      imageKey:
        paramImageKey ??
        (typeof paramImage === "string" && !resolveApiMediaUrl(paramImage)
          ? paramImage
          : undefined),
      imageUrl: resolveApiMediaUrl(paramImageUrl ?? paramImage),
    }),
    [
      id,
      paramCategory,
      paramDiscount,
      paramImage,
      paramImageKey,
      paramImageUrl,
      paramOldPrice,
      paramPrice,
      paramRating,
      paramReviews,
      paramTitle,
    ],
  );

  const { product, isLoading, isUnavailable } = useCatalogProduct({
    productId: id,
    fallback: productFallback,
  });

  useEffect(() => {
    if (isLoading || !product.id) {
      return;
    }

    trackBehaviorEvent({
      eventType: BEHAVIOR_EVENT_TYPES.PRODUCT_VIEW,
      productId: product.id,
      storeId: product.storeId ?? null,
      category: product.categorySlugs?.[0] ?? product.category ?? null,
      sourceScreen: "product_detail",
      metadata: {
        price: product.price,
      },
    });
  }, [
    isLoading,
    product.category,
    product.categorySlugs,
    product.id,
    product.price,
    product.storeId,
  ]);

  const {
    products: relatedProducts,
    feed: similarFeed,
    isLoading: isLoadingSimilar,
  } = useSimilarProducts({
    productId: id,
    limit: 8,
  });
  const {
    products: forYouProducts,
    feed: forYouFeed,
    isLoading: isLoadingForYou,
  } = useForYouRecommendations({ limit: 12 });
  const { selectedAddress } = useProfile();

  const { store } = useStore({
    storeId: product.storeId,
  });
  const { reviews: productReviews } = useProductReviews(id);
  const { orders } = useOrders();
  const { reviews: userReviews } = useReviews();

  const title = product.title;
  const category = product.category;
  const subcategory = product.subcategory;
  const price = product.price ?? 0;
  const {
    options: deliveryOptions,
    isLoading: isLoadingDelivery,
    error: deliveryQuoteError,
  } = useDeliveryQuote({
    subtotal: price,
    region: selectedAddress?.region,
    city: selectedAddress?.city,
    selectedMethod: "economy",
  });
  const oldPrice = product.oldPrice ?? 0;
  const baseRating = product.rating ?? 0;
  const baseReviews = product.reviews;
  const discount = product.discount;
  const stock = product.stock ?? 0;
  const flashSaleEndsAt = product.flashSaleEndsAt;
  const isLowStock = stock > 0 && stock <= 2;
  const hasLiveFlashSale = Boolean(
    flashSaleEndsAt && getSecondsRemaining(flashSaleEndsAt) > 0,
  );
  const hasDiscount = oldPrice > 0 && oldPrice > price;
  const savingsAmount = hasDiscount ? oldPrice - price : 0;
  const localReviewCount = productReviews.length;
  const localAverageRating =
    localReviewCount > 0
      ? productReviews.reduce((total, item) => total + item.rating, 0) /
        localReviewCount
      : 0;
  const rating = localReviewCount > 0 ? localAverageRating : baseRating;
  const reviews = localReviewCount > 0 ? String(localReviewCount) : baseReviews;
  const reviewsLabel =
    localReviewCount > 0
      ? formatReviewCountLabel(localReviewCount)
      : formatReviewCountLabel(baseReviews);
  const hasRatingsInfo = Boolean(
    (!Number.isNaN(rating) && rating > 0) || reviewsLabel.trim(),
  );

  const reviewTarget = useMemo(
    () =>
      resolveProductReviewTarget({
        productId: id,
        productTitle: title,
        productCategory: subcategory ?? category,
        imageKey: product.imageKey,
        imageUrl: product.imageUrl,
        orders,
        userReviews,
      }),
    [
      category,
      id,
      orders,
      product.imageKey,
      product.imageUrl,
      subcategory,
      title,
      userReviews,
    ],
  );

  const handleOpenProductReview = useCallback(() => {
    if (
      !requireAuth({
        title: "Sign in to review",
        message:
          "Log in or create an account to rate products you've received.",
      })
    ) {
      return;
    }

    if (!reviewTarget) {
      showToast("Reviews unlock after your order is delivered.");
      router.push("/(root)/screens/profileScreens/Account/Reviews" as any);
      return;
    }

    router.push(buildReviewComposerRoute(reviewTarget));
  }, [requireAuth, reviewTarget, showToast]);

  const handleViewAllReviews = useCallback(() => {
    // This used to open Account/Reviews — the reviews *you* wrote. From a
    // product page "see all reviews" means everyone's reviews of this product,
    // which is a different screen and a different endpoint.
    router.push({
      pathname: "/(root)/screens/product-reviews/[productId]" as any,
      params: { productId: product.id, title: product.title },
    });
  }, [product.id, product.title]);

  const productColorOptions = useMemo(
    () => buildColorOptions(product.colorOptions),
    [product.colorOptions],
  );
  const productSizeOptions = useMemo(
    () => product.sizeOptions ?? [],
    [product.sizeOptions],
  );

  const activeColor = useMemo(
    () =>
      productColorOptions.find((item) => item.id === selectedColor) ??
      productColorOptions[0] ??
      null,
    [productColorOptions, selectedColor],
  );
  const activeSize = selectedSize ?? productSizeOptions[0] ?? null;

  const productImages = useMemo(() => {
    const backendImages = (product.imageUrls ?? [])
      .map((value) => resolveApiMediaUrl(value))
      .filter((value): value is string => Boolean(value?.trim()));
    const primaryImageUrl =
      resolveApiMediaUrl(product.imageUrl) ??
      resolveApiMediaUrl(
        typeof paramImage === "string" ? paramImage : undefined,
      );
    const primaryImage = primaryImageUrl
      ? { uri: primaryImageUrl }
      : (product.image ??
        resolveImageSource(
          product.imageUrl ??
            (typeof paramImage === "string" ? paramImage : undefined),
          product.imageKey ?? paramImageKey,
        ));

    const remoteSources = backendImages.map((value) => ({ uri: value }));
    const merged = [primaryImage, ...remoteSources].filter(Boolean);
    const unique = merged.filter((item, index, array) => {
      const key =
        typeof item === "number"
          ? `asset-${item}`
          : typeof item === "object" && item && "uri" in item
            ? item.uri
            : JSON.stringify(item);
      return (
        array.findIndex((candidate) => {
          const candidateKey =
            typeof candidate === "number"
              ? `asset-${candidate}`
              : typeof candidate === "object" && candidate && "uri" in candidate
                ? candidate.uri
                : JSON.stringify(candidate);
          return candidateKey === key;
        }) === index
      );
    });

    return unique.slice(0, 6);
  }, [
    paramImage,
    paramImageKey,
    product.image,
    product.imageKey,
    product.imageUrl,
    product.imageUrls,
  ]);

  const taxonomyLabels = useMemo(() => {
    const labels = [category, subcategory].filter((value): value is string =>
      Boolean(value?.trim()),
    );
    if (store?.category?.trim()) {
      labels.push(store.category.trim());
    }
    return Array.from(new Set(labels));
  }, [category, store?.category, subcategory]);

  const storeMeta = useMemo(() => {
    const locationBits = [store?.city, titleFromSlug(store?.marketSlug)].filter(
      (value): value is string => Boolean(value?.trim()),
    );
    return locationBits.join(", ");
  }, [store?.city, store?.marketSlug]);

  const shortDescription = useMemo(() => {
    const firstLine = buildDescriptionLines(product.description)[0] ?? "";
    return firstLine.length > 140 ? `${firstLine.slice(0, 137)}...` : firstLine;
  }, [product.description]);

  useEffect(() => {
    if (!selectedColor && productColorOptions[0]) {
      setSelectedColor(productColorOptions[0].id);
    }
  }, [productColorOptions, selectedColor]);

  useEffect(() => {
    if (!selectedSize && productSizeOptions[0]) {
      setSelectedSize(productSizeOptions[0]);
    }
  }, [productSizeOptions, selectedSize]);

  useEffect(() => {
    if (activeImageIndex > productImages.length - 1) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, productImages.length]);

  const handleBuyNow = () => {
    if (stock <= 0) {
      showToast("This item is currently out of stock.", "error");
      return;
    }

    if (
      !requireAuth({
        title: "Sign in to buy now",
        message:
          "Log in or create an account to continue straight to checkout.",
      })
    ) {
      return;
    }

    router.push({
      pathname: "/screens/Checkout" as any,
      params: {
        id,
        title,
        price,
        oldPrice,
        category,
        imageKey: product.imageKey,
        selectedColor: activeColor?.label,
        selectedSize: activeSize ?? undefined,
      },
    });
  };

  const sharePayload = useMemo<ProductSharePayload>(
    () => ({
      id,
      title,
      price,
      oldPrice: oldPrice > 0 ? oldPrice : undefined,
      category,
      subcategory,
      rating: rating > 0 ? rating : undefined,
      reviewsLabel: reviewsLabel,
      discount,
      storeName: store?.title,
      imageUrl: product.imageUrl,
      imageUrls: product.imageUrls,
    }),
    [
      category,
      discount,
      id,
      oldPrice,
      price,
      product.imageUrl,
      product.imageUrls,
      rating,
      reviewsLabel,
      store?.title,
      subcategory,
      title,
    ],
  );

  const openShareSheet = () => {
    setIsShareSheetOpen(true);
  };

  const shouldShowLoadingState = isLoading;

  if (!id) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top + rV(6), rV(44)),
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => goBackOr(router, { fallback: "/(root)/(tabs)" })}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: horizontalPadding }}>
          <Text style={{ color: colors.text, fontSize: rMS(16), textAlign: "center" }}>
            This product link is missing or invalid.
          </Text>
        </View>
      </View>
    );
  }

  if (isUnavailable) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top + rV(6), rV(44)),
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => goBackOr(router, { fallback: "/(root)/(tabs)" })}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: horizontalPadding, gap: rV(12) }}>
          <Ionicons name="cube-outline" size={rMS(40)} color={colors.iconMuted} />
          <Text style={{ color: colors.text, fontSize: rMS(16), fontWeight: "600", textAlign: "center" }}>
            This product is no longer available
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: rMS(13), textAlign: "center" }}>
            The vendor may have removed it or it&apos;s currently out of stock indefinitely.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          shouldShowLoadingState ? styles.header : styles.headerFloating,
          {
            paddingTop: Math.max(insets.top + rV(6), rV(44)),
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <TouchableOpacity
          style={shouldShowLoadingState ? styles.headerButton : styles.headerButtonFloating}
          onPress={() => goBackOr(router, { fallback: "/(root)/(tabs)" })}
          activeOpacity={0.7}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        {shouldShowLoadingState ? (
          <Text style={styles.headerTitle}>Product Details</Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <TouchableOpacity
          style={shouldShowLoadingState ? styles.headerButton : styles.headerButtonFloating}
          activeOpacity={0.7}
          onPress={openShareSheet}
          disabled={shouldShowLoadingState || !title}
          accessibilityLabel="Share this product"
        >
          <AntDesign name="share-alt" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {shouldShowLoadingState ? (
        <ProductDetailSkeleton />
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{
              paddingBottom: insets.bottom + rV(72),
            }}
            showsVerticalScrollIndicator={false}
          >
            <ProductGallery
              images={productImages}
              activeIndex={activeImageIndex}
              onActiveIndexChange={setActiveImageIndex}
              onPressImage={() => setIsGalleryOpen(true)}
              idPrefix={String(id)}
              horizontalPadding={horizontalPadding}
              topInset={insets.top}
            />

            <View
              style={[styles.content, { paddingHorizontal: horizontalPadding }]}
            >
              <View style={styles.infoShell}>
                {/*
                  One quiet line of provenance, not three pills. Category,
                  subcategory and store-category were each rendered as a
                  filled pill above the name, so the first thing on the page
                  was taxonomy rather than the product.
                */}
                {taxonomyLabels.length > 0 ? (
                  <Text style={styles.eyebrow} numberOfLines={1}>
                    {taxonomyLabels.join("  ·  ")}
                  </Text>
                ) : null}

                <Text style={styles.productTitle}>{title}</Text>

                {/*
                  Rating and availability as text on one line. These were four
                  bordered chips competing with the three pills above them;
                  seven pill-shaped things stacked before the price is what
                  made the screen read as generated rather than designed.
                */}
                <View style={styles.metaLine}>
                  {hasRatingsInfo ? (
                    <TouchableOpacity
                      style={styles.metaRating}
                      activeOpacity={0.7}
                      onPress={handleOpenProductReview}
                      accessibilityRole="button"
                      accessibilityLabel="Read reviews"
                    >
                      <Ionicons name="star" size={rMS(13)} color={colors.warningText} />
                      <Text style={styles.metaStrong}>
                        {rating > 0 ? rating.toFixed(1) : "New"}
                      </Text>
                      {reviewsLabel.trim() ? (
                        <Text style={styles.metaDim}>({reviewsLabel})</Text>
                      ) : null}
                    </TouchableOpacity>
                  ) : null}

                  {hasRatingsInfo ? <Text style={styles.metaDot}>·</Text> : null}

                  <Text
                    style={[
                      styles.metaStock,
                      stock <= 0 && styles.metaStockOut,
                      isLowStock && stock > 0 && styles.metaStockLow,
                    ]}
                    numberOfLines={1}
                  >
                    {stock > 0
                      ? isLowStock
                        ? `Only ${stock} left`
                        : "In stock"
                      : "Currently unavailable"}
                  </Text>

                  {hasLiveFlashSale ? (
                    <>
                      <Text style={styles.metaDot}>·</Text>
                      <FlashSaleCountdown endsAt={flashSaleEndsAt} tone="gold" />
                    </>
                  ) : null}
                </View>
              </View>

              {/*
                Price directly under the name. It used to sit below a
                three-column stats row repeating the category and the store
                rating already shown above, so the number a shopper opens the
                screen for was the fourth thing they reached.
              */}
              <View style={styles.priceCard}>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{formatCurrency(price)}</Text>
                  {oldPrice > 0 ? (
                    <Text style={styles.oldPrice}>{formatCurrency(oldPrice)}</Text>
                  ) : null}
                  {hasDiscount ? (
                    <View style={styles.savingsPill}>
                      <Text style={styles.savingsPillText}>
                        Save {formatCurrency(savingsAmount)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Offers sit beside the price, never in place of Add to Cart: someone happy to
                  pay the listed price should not have to think about negotiating at all. */}
              {product.isNegotiable ? (
                <View
                  style={{
                    marginTop: rV(12),
                    padding: rV(14),
                    borderRadius: rV(16),
                    borderWidth: 1,
                    borderColor: colors.primary,
                    backgroundColor: colors.surfaceMuted,
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: rV(13) }}>
                    Price negotiable
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: rV(12), marginTop: 4 }}>
                    Propose your own price. If the seller agrees you can check out at that
                    price — and only you can use it.
                  </Text>
                  {product.negotiationNote ? (
                    <Text style={{ color: colors.textMuted, fontSize: rV(11), marginTop: 6 }}>
                      Seller says: {product.negotiationNote}
                    </Text>
                  ) : null}
                  <Pressable
                    onPress={() => setOfferSheetOpen(true)}
                    style={{
                      marginTop: rV(12),
                      paddingVertical: rV(11),
                      borderRadius: rV(12),
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.primary,
                    }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: "700", fontSize: rV(13) }}>
                      Make an offer
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {productColorOptions.length > 0 ||
              productSizeOptions.length > 0 ? (
                <View style={styles.variantCard}>
                  {productColorOptions.length > 0 ? (
                    <>
                      <View style={styles.variantHeader}>
                        <Text style={styles.variantTitle}>Choose Color</Text>
                        <Text style={styles.variantValue}>
                          {activeColor?.label ?? "Select"}
                        </Text>
                      </View>
                      <View style={styles.colorRow}>
                        {productColorOptions.map((item) => {
                          const active = selectedColor === item.id;
                          return (
                            <TouchableOpacity
                              key={item.id}
                              style={[
                                styles.colorBtn,
                                active && styles.colorBtnActive,
                              ]}
                              activeOpacity={0.82}
                              onPress={() => setSelectedColor(item.id)}
                            >
                              <View
                                style={[
                                  styles.colorDot,
                                  { backgroundColor: item.hex },
                                ]}
                              />
                              <Text style={styles.colorLabel}>
                                {item.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  ) : null}

                  {productSizeOptions.length > 0 ? (
                    <>
                      <View style={styles.variantHeader}>
                        <Text style={styles.variantTitle}>Choose Size</Text>
                        <Text style={styles.variantValue}>
                          {activeSize ? `Size ${activeSize}` : "Select"}
                        </Text>
                      </View>
                      <View style={styles.sizeRow}>
                        {productSizeOptions.map((item) => {
                          const active = selectedSize === item;
                          return (
                            <TouchableOpacity
                              key={item}
                              style={[
                                styles.sizeBtn,
                                active && styles.sizeBtnActive,
                              ]}
                              activeOpacity={0.82}
                              onPress={() => setSelectedSize(item)}
                            >
                              <Text
                                style={[
                                  styles.sizeBtnText,
                                  active && styles.sizeBtnTextActive,
                                ]}
                              >
                                {item}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.storeCard}>
                <View style={styles.storeHeaderRow}>
                  <View style={styles.storeTitleWrap}>
                    <View style={styles.storeIconWrap}>
                      <Ionicons
                        name="storefront-outline"
                        size={rMS(18)}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.storeEyebrow}>Sold by</Text>
                      <Text style={styles.storeTitle}>
                        {store?.title ?? "Store"}
                      </Text>
                      {storeMeta ? (
                        <Text style={styles.storeMeta}>{storeMeta}</Text>
                      ) : null}
                    </View>
                  </View>
                  {typeof store?.rating === "number" ? (
                    <View style={styles.storeRatingPill}>
                      <Ionicons name="star" size={rMS(12)} color={colors.ratingText} />
                      <Text style={styles.storeRatingText}>
                        {store.rating.toFixed(1)}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {store?.description ? (
                  <Text style={styles.storeDescription}>
                    {store.description}
                  </Text>
                ) : null}

                <View style={styles.storeActionsRow}>
                  {store ? (
                    <>
                      <TouchableOpacity
                        style={styles.storePrimaryAction}
                        activeOpacity={0.84}
                        onPress={() =>
                          router.push({
                            pathname: "/(root)/screens/stores/[id]" as any,
                            params: {
                              id: store.id,
                              title: store.title,
                              image: store.image,
                            },
                          })
                        }
                      >
                        <Text style={styles.storePrimaryActionText}>
                          Visit Store
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.storeSecondaryAction}
                        activeOpacity={0.84}
                        onPress={() =>
                          router.push({
                            pathname: "/screens/productDetails/chat/[vendorId]",
                            params: {
                              vendorId: store.id,
                              vendorName: String(store.title ?? "Store"),
                              productId: id,
                              productTitle: title,
                              productImageUrl:
                                product.imageUrl ?? productImages[0]?.uri,
                            },
                          } as any)
                        }
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={rMS(16)}
                          color={colors.onInverseSurface}
                        />
                        <Text style={styles.storeSecondaryActionText}>
                          Chat Store
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : null}
                </View>

                <View style={{ marginTop: rV(10) }}>
                  <AssistantEntryButton
                    screen="product"
                    label="Ask about this product"
                    compact
                    context={{
                      type: "product",
                      product_id: id,
                      product_title: title,
                      store_id: store?.id ?? null,
                      store_name: store?.title ? String(store.title) : null,
                      category: category ?? null,
                    }}
                  />
                </View>
              </View>

              <View style={styles.reviewSectionWrap}>
                <ProductReviewsPanel
                  rating={rating}
                  reviewsLabel={reviewsLabel}
                  reviewCount={localReviewCount}
                  reviews={productReviews}
                  onWriteReviewPress={handleOpenProductReview}
                  writeReviewLabel={reviewTarget?.mode === "edit" ? "Edit review" : "Write review"}
                  onViewAllPress={handleViewAllReviews}
                />
              </View>

              <View style={styles.sectionStack}>
                <CollapsibleShippingCard
                  title="About this item"
                  icon={
                    <Ionicons
                      name="information-circle-outline"
                      size={22}
                      color={colors.iconMuted}
                    />
                  }
                  description={buildDescriptionLines(product.description)}
                  specifications={product.specifications}
                  defaultExpanded
                />

                <DeliveryOptionsCard
                  subtotal={price}
                  region={selectedAddress?.region}
                  city={selectedAddress?.city}
                  options={deliveryOptions}
                  isLoading={isLoadingDelivery}
                  statusMessage={deliveryQuoteError}
                  defaultExpanded={false}
                />

                <CollapsibleShippingCard
                  title="Returns & support"
                  icon={
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color={colors.iconMuted}
                    />
                  }
                  description={[
                    "Products can be returned based on ODOS return policy and the seller's product condition rules.",
                    "If your item arrives damaged or significantly different, contact support from the order history or chat with the store directly.",
                  ]}
                  defaultExpanded={false}
                />
              </View>

              <ProductDetailRecommendations
                productId={id}
                similarFeed={similarFeed}
                similarProducts={relatedProducts}
                similarLoading={isLoadingSimilar}
                forYouFeed={forYouFeed}
                forYouProducts={forYouProducts}
                forYouLoading={isLoadingForYou}
              />
            </View>
          </ScrollView>

          <ProductDetailBottomBar
            priceLabel={formatCurrency(price)}
            variantLabel={
              activeColor?.label || activeSize
                ? [activeColor?.label, activeSize].filter(Boolean).join(" · ")
                : undefined
            }
            horizontalPadding={horizontalPadding}
            wishlistProduct={{
              id,
              image: product.image,
              title: title ?? "",
              category: category ?? "",
              price,
              oldPrice,
              rating,
              reviews,
            }}
            cartItem={{
              id,
              title: title ?? "",
              category: category ?? "",
              price,
              image: product.image,
              imageKey: product.imageKey,
            }}
            onBuyNow={handleBuyNow}
            unavailable={stock <= 0}
          />

          <ProductImageGalleryModal
            visible={isGalleryOpen}
            images={productImages}
            activeIndex={activeImageIndex}
            title={title}
            priceLabel={formatCurrency(price)}
            horizontalPadding={horizontalPadding}
            onClose={() => setIsGalleryOpen(false)}
            onIndexChange={setActiveImageIndex}
            onSharePress={openShareSheet}
          />
        </>
      )}

      <ProductShareSheet
        visible={isShareSheetOpen}
        product={sharePayload}
        previewImage={productImages[0]}
        onClose={() => setIsShareSheetOpen(false)}
      />

      {product.isNegotiable ? (
        <MakeOfferSheet
          visible={offerSheetOpen}
          onClose={() => setOfferSheetOpen(false)}
          productId={product.id}
          productTitle={product.title}
          listedPrice={price}
          negotiationNote={product.negotiationNote}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
        />
      ) : null}
    </View>
  );
}
