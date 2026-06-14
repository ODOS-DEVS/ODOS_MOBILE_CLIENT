import AddToCartBtn from "@/components/buttons/AddToCartBtn";
import AddToWishList from "@/components/buttons/AddToWishList";
import CollapsibleShippingCard from "@/components/cards/CollapsableCard";
import ProductCard from "@/components/cards/ProductCard";
import { ProductDetailSkeleton } from "@/components/loaders/CommerceSkeletons";
import { AppColors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { useStore } from "@/hooks/useCommerce";
import { useCatalogProduct, useCatalogProducts } from "@/hooks/useCatalog";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useProductReviews } from "@/hooks/useReviews";
import { ProductReviewsPanel } from "@/components/reviews/ReviewUi";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { createProductDetailStyles } from "@/styles/productDetailStyles";
import ProductShareSheet from "@/components/share/ProductShareSheet";
import FlashSaleCountdown from "@/components/deals/FlashSaleCountdown";
import { getSecondsRemaining } from "@/utils/countdown";
import { goBackOr } from "@/utils/navigation";
import { resolveApiMediaUrl, resolveImageSource } from "@/utils/media";
import type { ProductSharePayload } from "@/utils/shareCatalog";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

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

function formatPrice(value: number) {
  return `₵${value.toFixed(2)}`;
}

function normalizeValue(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function ProductMetaChip({
  icon,
  label,
  styles,
  mutedColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  styles: ReturnType<typeof createProductDetailStyles>;
  mutedColor: string;
}) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={rMS(13)} color={mutedColor} />
      <Text style={styles.metaChipText}>{label}</Text>
    </View>
  );
}

function InfoStat({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createProductDetailStyles>;
}) {
  return (
    <View style={styles.infoStat}>
      <Text style={styles.infoStatLabel}>{label}</Text>
      <Text style={styles.infoStatValue}>{value}</Text>
    </View>
  );
}

export default function ProductDetail() {
  const { colors } = useTheme();
  const styles = useMemo(() => createProductDetailStyles(colors), [colors]);
  const { requireAuth } = useRequireAuth();
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const params = useLocalSearchParams();
  const galleryRef = useRef<FlatList<any>>(null);
  const fullscreenGalleryRef = useRef<FlatList<any>>(null);

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
  const isVoucher = getParam(params.isVoucher) === "true";

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
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

  const { product, isLoading } = useCatalogProduct({
    productId: id,
    fallback: productFallback,
  });

  const primaryCategoryQuery = product.categorySlugs?.[0] ?? product.category;
  const { products: categoryProducts } = useCatalogProducts({
    category: primaryCategoryQuery,
  });
  const { products: popularProducts } = useCatalogProducts({
    section: "popular",
  });

  const { store } = useStore({
    storeId: product.storeId,
  });
  const { reviews: productReviews } = useProductReviews(id);

  const title = product.title;
  const category = product.category;
  const subcategory = product.subcategory;
  const price = product.price ?? 0;
  const oldPrice = product.oldPrice ?? 0;
  const baseRating = product.rating ?? 0;
  const baseReviews = product.reviews;
  const discount = product.discount;
  const stock = product.stock ?? 0;
  const flashSaleEndsAt = product.flashSaleEndsAt;
  const isLowStock = stock > 0 && stock <= 5;
  const hasLiveFlashSale = Boolean(flashSaleEndsAt && getSecondsRemaining(flashSaleEndsAt) > 0);
  const hasDiscount = oldPrice > 0 && oldPrice > price;
  const savingsAmount = hasDiscount ? oldPrice - price : 0;
  const localReviewCount = productReviews.length;
  const localAverageRating =
    localReviewCount > 0
      ? productReviews.reduce((total, item) => total + item.rating, 0) / localReviewCount
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
      resolveApiMediaUrl(typeof paramImage === "string" ? paramImage : undefined);
    const primaryImage =
      primaryImageUrl
        ? { uri: primaryImageUrl }
        : product.image ??
          resolveImageSource(
            product.imageUrl ?? (typeof paramImage === "string" ? paramImage : undefined),
            product.imageKey ?? paramImageKey,
          );

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

  const relatedProducts = useMemo(() => {
    const primarySubcategory = normalizeValue(product.subcategory);
    const currentStoreId = product.storeId;
    const merged = [...categoryProducts, ...popularProducts];
    const uniqueProducts = merged.filter(
      (item, index, array) =>
        item.id !== id && array.findIndex((candidate) => candidate.id === item.id) === index,
    );

    return uniqueProducts
      .sort((left, right) => {
        const leftScore =
          (normalizeValue(left.subcategory) === primarySubcategory ? 4 : 0) +
          (left.storeId === currentStoreId ? 2 : 0) +
          ((left.rating ?? 0) / 10);
        const rightScore =
          (normalizeValue(right.subcategory) === primarySubcategory ? 4 : 0) +
          (right.storeId === currentStoreId ? 2 : 0) +
          ((right.rating ?? 0) / 10);
        return rightScore - leftScore;
      })
      .slice(0, 8);
  }, [categoryProducts, id, popularProducts, product.storeId, product.subcategory]);

  const taxonomyLabels = useMemo(() => {
    const labels = [category, subcategory].filter(
      (value): value is string => Boolean(value?.trim()),
    );
    if (store?.category?.trim()) {
      labels.push(store.category.trim());
    }
    return Array.from(new Set(labels));
  }, [category, store?.category, subcategory]);

  const storeMeta = useMemo(() => {
    const locationBits = [store?.city, titleFromSlug(store?.marketSlug)]
      .filter((value): value is string => Boolean(value?.trim()));
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
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={openShareSheet}
          disabled={shouldShowLoadingState || !title}
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
              paddingBottom: insets.bottom + rV(138),
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroSection}>
              <View style={styles.heroBackdrop} />
              <View style={styles.galleryShell}>
              <FlatList
                ref={galleryRef}
                data={productImages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => `${id}-gallery-${index}`}
                getItemLayout={(_, index) => ({
                  length: screenWidth - rS(32),
                  offset: (screenWidth - rS(32)) * index,
                  index,
                })}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / (screenWidth - rS(32)),
                  );
                  setActiveImageIndex(index);
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.imageSlide}
                    activeOpacity={0.96}
                    onPress={() => setIsGalleryOpen(true)}
                  >
                    <Image source={item as any} style={styles.heroImage} resizeMode="cover" />
                  </TouchableOpacity>
                )}
              />

              <View style={styles.galleryOverlayRow}>
                <View style={styles.galleryCountBadge}>
                  <Ionicons name="images-outline" size={rMS(13)} color={AppColors.white} />
                  <Text style={styles.galleryCountText}>
                    {activeImageIndex + 1}/{productImages.length}
                  </Text>
                </View>
                {discount ? (
                  <View style={styles.discountPill}>
                    <Text style={styles.discountPillText}>{discount}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.expandHintWrap}>
                <Ionicons name="expand-outline" size={rMS(14)} color={AppColors.white} />
                <Text style={styles.expandHintText}>Tap to view</Text>
              </View>
            </View>
            </View>

            {productImages.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: horizontalPadding,
                  paddingTop: rV(14),
                }}
              >
                {productImages.map((item, index) => {
                  const active = index === activeImageIndex;
                  return (
                    <TouchableOpacity
                      key={`${id}-thumb-${index}`}
                      activeOpacity={0.8}
                      onPress={() => {
                        setActiveImageIndex(index);
                        galleryRef.current?.scrollToIndex({ index, animated: true });
                      }}
                      style={[styles.thumbnailWrap, active && styles.thumbnailWrapActive]}
                    >
                      <Image source={item as any} style={styles.thumbnailImage} resizeMode="cover" />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}

            <View style={[styles.content, { paddingHorizontal: horizontalPadding }]}>
              <View style={styles.infoShell}>
                <View style={styles.taxonomyRow}>
                  {taxonomyLabels.map((label) => (
                    <View key={label} style={styles.taxonomyPill}>
                      <Text style={styles.taxonomyPillText}>{label}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.productTitle}>{title}</Text>

                <View style={styles.metaRow}>
                  {hasRatingsInfo ? (
                    <ProductMetaChip
                      icon="star"
                      styles={styles}
                      mutedColor={colors.textMuted}
                      label={
                        rating > 0 && reviewsLabel.trim()
                          ? `${rating.toFixed(1)} · ${reviewsLabel}`
                          : rating > 0
                            ? `${rating.toFixed(1)} rated`
                            : reviewsLabel
                      }
                    />
                  ) : null}
                  <ProductMetaChip
                    icon={stock > 0 ? "checkmark-circle-outline" : "close-circle-outline"}
                    styles={styles}
                    mutedColor={colors.textMuted}
                    label={
                      stock > 0
                        ? isLowStock
                          ? `Only ${stock} left`
                          : `${stock} in stock`
                        : "Currently unavailable"
                    }
                  />
                  {hasLiveFlashSale ? (
                    <FlashSaleCountdown endsAt={flashSaleEndsAt} tone="dark" />
                  ) : null}
                  {store?.title ? (
                    <ProductMetaChip
                      icon="storefront-outline"
                      styles={styles}
                      mutedColor={colors.textMuted}
                      label={store.title}
                    />
                  ) : null}
                </View>

                <View style={styles.infoStatsRow}>
                  <InfoStat
                    label="Category"
                    value={subcategory ?? category ?? "General"}
                    styles={styles}
                  />
                  <InfoStat
                    label="Market"
                    value={titleFromSlug(store?.marketSlug) ?? "Storefront"}
                    styles={styles}
                  />
                  <InfoStat
                    label="Store rating"
                    value={
                      typeof store?.rating === "number"
                        ? `${store.rating.toFixed(1)} / 5`
                        : "Live seller"
                    }
                    styles={styles}
                  />
                </View>
              </View>

              <View style={styles.priceCard}>
                <View style={styles.priceTopRow}>
                  <View>
                    <Text style={styles.priceLabel}>ODOS price</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>{formatPrice(price)}</Text>
                      {oldPrice > 0 ? (
                        <Text style={styles.oldPrice}>{formatPrice(oldPrice)}</Text>
                      ) : null}
                    </View>
                  </View>
                  {hasDiscount ? (
                    <View style={styles.savingsPill}>
                      <Text style={styles.savingsPillText}>
                        Save {formatPrice(savingsAmount)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {!isVoucher && (productColorOptions.length > 0 || productSizeOptions.length > 0) ? (
                <View style={styles.variantCard}>
                  {productColorOptions.length > 0 ? (
                    <>
                      <View style={styles.variantHeader}>
                        <Text style={styles.variantTitle}>Choose Color</Text>
                        <Text style={styles.variantValue}>{activeColor?.label ?? "Select"}</Text>
                      </View>
                      <View style={styles.colorRow}>
                        {productColorOptions.map((item) => {
                          const active = selectedColor === item.id;
                          return (
                            <TouchableOpacity
                              key={item.id}
                              style={[styles.colorBtn, active && styles.colorBtnActive]}
                              activeOpacity={0.82}
                              onPress={() => setSelectedColor(item.id)}
                            >
                              <View style={[styles.colorDot, { backgroundColor: item.hex }]} />
                              <Text style={styles.colorLabel}>{item.label}</Text>
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
                              style={[styles.sizeBtn, active && styles.sizeBtnActive]}
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
                      <Ionicons name="storefront-outline" size={rMS(18)} color={AppColors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.storeEyebrow}>Sold by</Text>
                      <Text style={styles.storeTitle}>{store?.title ?? "Store"}</Text>
                      {storeMeta ? <Text style={styles.storeMeta}>{storeMeta}</Text> : null}
                    </View>
                  </View>
                  {typeof store?.rating === "number" ? (
                    <View style={styles.storeRatingPill}>
                      <Ionicons name="star" size={rMS(12)} color="#FACC15" />
                      <Text style={styles.storeRatingText}>{store.rating.toFixed(1)}</Text>
                    </View>
                  ) : null}
                </View>

                {store?.description ? (
                  <Text style={styles.storeDescription}>{store.description}</Text>
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
                        <Text style={styles.storePrimaryActionText}>Visit Store</Text>
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
                              productImageUrl: product.imageUrl ?? productImages[0]?.uri,
                            },
                          } as any)
                        }
                      >
                        <Ionicons name="chatbubble-outline" size={rMS(16)} color={colors.onInverseSurface} />
                        <Text style={styles.storeSecondaryActionText}>Chat Store</Text>
                      </TouchableOpacity>
                    </>
                  ) : null}
                </View>
              </View>

              <View style={styles.reviewSectionWrap}>
                <ProductReviewsPanel
                  rating={rating}
                  reviewsLabel={reviewsLabel}
                  reviewCount={localReviewCount}
                  reviews={productReviews}
                />
              </View>

              <View style={styles.sectionStack}>
                <CollapsibleShippingCard
                  title="About this item"
                  icon={
                    <Ionicons
                      name="information-circle-outline"
                      size={22}
                      color={AppColors.subtext[100]}
                    />
                  }
                  description={buildDescriptionLines(product.description)}
                  specifications={product.specifications}
                  defaultExpanded
                />

                {!isVoucher ? (
                  <CollapsibleShippingCard
                    title="Delivery & shipping"
                    icon={
                      <Ionicons
                        name="car-outline"
                        size={20}
                        color={AppColors.subtext[100]}
                      />
                    }
                    description={[
                      "Choose the delivery speed that works best for you at checkout.",
                    ]}
                    shippingOptions={[
                      {
                        type: "Economy",
                        deliveryTime: "Arrives in 3-5 business days",
                        price: "GHC19",
                      },
                      {
                        type: "Express",
                        deliveryTime: "Arrives in 1-2 business days",
                        price: "GHC29",
                      },
                      {
                        type: "Same day",
                        deliveryTime: "Available in selected areas",
                        price: "GHC49",
                      },
                    ]}
                    defaultExpanded={false}
                  />
                ) : null}

                <CollapsibleShippingCard
                  title="Returns & support"
                  icon={
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color={AppColors.subtext[100]}
                    />
                  }
                  description={[
                    "Products can be returned based on ODOS return policy and the seller's product condition rules.",
                    "If your item arrives damaged or significantly different, contact support from the order history or chat with the store directly.",
                  ]}
                  defaultExpanded={false}
                />
              </View>

              {relatedProducts.length > 0 ? (
                <>
                  <View style={styles.relatedHeader}>
                    <Text style={styles.relatedTitle}>More like this</Text>
                    <Text style={styles.relatedSubtitle}>
                      Similar picks from this category and store network.
                    </Text>
                  </View>
                  <FlatList
                    data={relatedProducts}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ProductCard {...item} />}
                    contentContainerStyle={styles.relatedList}
                  />
                </>
              ) : null}
            </View>
          </ScrollView>

          <View
            style={[
              styles.bottomBar,
              {
                paddingBottom: Math.max(insets.bottom, rV(12)),
                paddingHorizontal: horizontalPadding,
              },
            ]}
          >
            <View style={styles.bottomPriceWrap}>
              <Text style={styles.bottomPriceLabel}>Total</Text>
              <Text style={styles.bottomPriceValue}>{formatPrice(price)}</Text>
              {activeColor?.label || activeSize ? (
                <Text style={styles.bottomVariantText}>
                  {[activeColor?.label, activeSize].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
            </View>

            <View style={styles.bottomActionsRow}>
              <AddToWishList
                product={{
                  id,
                  image: product.image,
                  title,
                  category,
                  price,
                  oldPrice,
                  rating,
                  reviews,
                }}
                size={18}
                iconColor={colors.text}
                activeIconColor="#DC2626"
                containerStyle={styles.bottomIconButton}
              />
              <AddToCartBtn
                item={{
                  id,
                  title,
                  category,
                  price,
                  image: product.image,
                  imageKey: product.imageKey,
                }}
                iconSize={20}
                iconColor={AppColors.white}
                containerStyle={styles.bottomCartButton}
              />
              <TouchableOpacity
                style={styles.buyNowBtn}
                activeOpacity={0.85}
                onPress={handleBuyNow}
              >
                <Text style={styles.buyNowText}>Buy Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            visible={isGalleryOpen}
            animationType="fade"
            transparent={false}
            onRequestClose={() => setIsGalleryOpen(false)}
          >
            <View style={styles.fullscreenModal}>
              <View
                style={[
                  styles.fullscreenHeader,
                  {
                    paddingTop: Math.max(insets.top + rV(6), rV(28)),
                    paddingHorizontal: horizontalPadding,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.fullscreenHeaderButton}
                  activeOpacity={0.8}
                  onPress={() => setIsGalleryOpen(false)}
                >
                  <Ionicons name="close" size={rMS(22)} color={AppColors.white} />
                </TouchableOpacity>
                <View style={styles.fullscreenCounter}>
                  <Text style={styles.fullscreenCounterText}>
                    {activeImageIndex + 1}/{productImages.length}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.fullscreenHeaderButton}
                  activeOpacity={0.8}
                  onPress={openShareSheet}
                >
                  <AntDesign name="share-alt" size={rMS(18)} color={AppColors.white} />
                </TouchableOpacity>
              </View>

              <FlatList
                ref={fullscreenGalleryRef}
                data={productImages}
                horizontal
                pagingEnabled
                initialScrollIndex={activeImageIndex}
                getItemLayout={(_, index) => ({
                  length: screenWidth,
                  offset: screenWidth * index,
                  index,
                })}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => `${id}-fullscreen-${index}`}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / screenWidth,
                  );
                  setActiveImageIndex(index);
                }}
                renderItem={({ item }) => (
                  <View style={styles.fullscreenImageSlide}>
                    <Image
                      source={item as any}
                      style={styles.fullscreenImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
              />

              <View style={styles.fullscreenFooter}>
                <Text style={styles.fullscreenTitle} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.fullscreenPrice}>{formatPrice(price)}</Text>
                {productImages.length > 1 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.fullscreenThumbs}
                  >
                    {productImages.map((item, index) => {
                      const active = index === activeImageIndex;
                      return (
                        <TouchableOpacity
                          key={`${id}-fullscreen-thumb-${index}`}
                          activeOpacity={0.82}
                          onPress={() => {
                            setActiveImageIndex(index);
                            fullscreenGalleryRef.current?.scrollToIndex({
                              index,
                              animated: true,
                            });
                          }}
                          style={[
                            styles.fullscreenThumbWrap,
                            active && styles.fullscreenThumbWrapActive,
                          ]}
                        >
                          <Image
                            source={item as any}
                            style={styles.fullscreenThumbImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                ) : null}
              </View>
            </View>
          </Modal>
        </>
      )}

      <ProductShareSheet
        visible={isShareSheetOpen}
        product={sharePayload}
        previewImage={productImages[0]}
        onClose={() => setIsShareSheetOpen(false)}
      />
    </View>
  );
}
