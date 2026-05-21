import AddToCartBtn from "@/components/buttons/AddToCartBtn";
import AddToWishList from "@/components/buttons/AddToWishList";
import CollapsibleShippingCard from "@/components/cards/CollapsableCard";
import ProductCard from "@/components/cards/ProductCard";
import { ProductDetailSkeleton } from "@/components/loaders/CommerceSkeletons";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useStore } from "@/hooks/useCommerce";
import { useCatalogProduct, useCatalogProducts } from "@/hooks/useCatalog";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useProductReviews } from "@/hooks/useReviews";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import { resolveApiMediaUrl, resolveImageSource } from "@/utils/media";
import { getStarIconName } from "@/utils/ratings";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={rMS(13)} color={AppColors.secondary} />
      <Text style={styles.metaChipText}>{label}</Text>
    </View>
  );
}

function InfoStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoStat}>
      <Text style={styles.infoStatLabel}>{label}</Text>
      <Text style={styles.infoStatValue}>{value}</Text>
    </View>
  );
}

export default function ProductDetail() {
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
  const isLowStock = stock > 0 && stock <= 5;
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

  const handleShare = async () => {
    try {
      await Share.share({
        title: title || "ODOS product",
        message: `${title}${category ? ` · ${category}` : ""} · ${formatPrice(price)} on ODOS`,
      });
    } catch {
      // Native share dismissal or failure can stay quiet here.
    }
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
          <Ionicons name="arrow-back" size={22} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => void handleShare()}
        >
          <AntDesign name="share-alt" size={18} color={AppColors.text} />
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
                    label={
                      stock > 0
                        ? isLowStock
                          ? `Only ${stock} left`
                          : `${stock} in stock`
                        : "Currently unavailable"
                    }
                  />
                  {store?.title ? (
                    <ProductMetaChip icon="storefront-outline" label={store.title} />
                  ) : null}
                </View>

                <View style={styles.infoStatsRow}>
                  <InfoStat
                    label="Category"
                    value={subcategory ?? category ?? "General"}
                  />
                  <InfoStat
                    label="Market"
                    value={titleFromSlug(store?.marketSlug) ?? "Storefront"}
                  />
                  <InfoStat
                    label="Store rating"
                    value={
                      typeof store?.rating === "number"
                        ? `${store.rating.toFixed(1)} / 5`
                        : "Live seller"
                    }
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
                            pathname: "/screens/stores/[id]" as any,
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
                        <Ionicons name="chatbubble-outline" size={rMS(16)} color={AppColors.text} />
                        <Text style={styles.storeSecondaryActionText}>Chat Store</Text>
                      </TouchableOpacity>
                    </>
                  ) : null}
                </View>
              </View>

              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewHeaderTextWrap}>
                    <Text style={styles.reviewSectionTitle}>Customer reviews</Text>
                    <Text style={styles.reviewSectionSubtitle}>
                      {localReviewCount > 0
                        ? "Latest feedback from delivered ODOS purchases."
                        : "Delivered purchases can be reviewed from your account, and they will appear here."}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.reviewManageButton}
                    activeOpacity={0.84}
                    onPress={() =>
                      router.push("/(root)/screens/profileScreens/Account/Reviews" as any)
                    }
                  >
                    <Text style={styles.reviewManageButtonText}>My Reviews</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.reviewSummaryRow}>
                  <View style={styles.reviewSummaryCard}>
                    <Text style={styles.reviewSummaryValue}>
                      {rating > 0 ? rating.toFixed(1) : "0.0"}
                    </Text>
                    <View style={styles.reviewSummaryStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={`product-review-summary-${star}`}
                          name={getStarIconName(star, rating)}
                          size={rMS(14)}
                          color="#F59E0B"
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewSummaryLabel}>{reviewsLabel}</Text>
                  </View>

                  <View style={styles.reviewSummaryHintCard}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={rMS(18)}
                      color={AppColors.primary}
                    />
                    <Text style={styles.reviewSummaryHintText}>
                      Review this item after a delivered order from your account history.
                    </Text>
                  </View>
                </View>

                {productReviews.length > 0 ? (
                  <View style={styles.reviewPreviewStack}>
                    {productReviews.slice(0, 2).map((item) => (
                      <View key={item.id} style={styles.reviewPreviewCard}>
                        <View style={styles.reviewPreviewTopRow}>
                          <View style={styles.reviewPreviewStars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Ionicons
                                key={`${item.id}-star-${star}`}
                                name={getStarIconName(star, item.rating)}
                                size={rMS(13)}
                                color="#F59E0B"
                              />
                            ))}
                          </View>
                          <Text style={styles.reviewPreviewDate}>
                            {new Date(item.updatedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Text>
                        </View>
                        <Text style={styles.reviewPreviewComment}>{item.comment}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
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
                iconColor={AppColors.text}
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
                  onPress={() => void handleShare()}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    paddingBottom: rV(12),
  },
  headerButton: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    marginHorizontal: rS(12),
    fontSize: rMS(17),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  scroll: {
    flex: 1,
  },
  heroSection: {
    position: "relative",
    paddingBottom: rV(10),
  },
  heroBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: rV(250),
    backgroundColor: "#DCE5EC",
    borderBottomLeftRadius: rMS(34),
    borderBottomRightRadius: rMS(34),
  },
  galleryShell: {
    position: "relative",
    backgroundColor: "#EEF3F7",
    marginHorizontal: rS(16),
    marginTop: rV(12),
    borderRadius: rMS(30),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  imageSlide: {
    width: screenWidth - rS(32),
    height: rV(350),
    backgroundColor: "#EEF2F5",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  galleryOverlayRow: {
    position: "absolute",
    top: rV(16),
    left: rS(16),
    right: rS(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  galleryCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    backgroundColor: "rgba(15, 23, 42, 0.62)",
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderRadius: 999,
  },
  galleryCountText: {
    color: AppColors.white,
    fontSize: rMS(11),
    fontFamily: Fonts.title,
  },
  discountPill: {
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderRadius: 999,
  },
  discountPillText: {
    color: AppColors.white,
    fontSize: rMS(11),
    fontFamily: Fonts.titleBold,
  },
  expandHintWrap: {
    position: "absolute",
    right: rS(16),
    bottom: rV(16),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    backgroundColor: "rgba(15, 23, 42, 0.62)",
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderRadius: 999,
  },
  expandHintText: {
    color: AppColors.white,
    fontSize: rMS(11),
    fontFamily: Fonts.title,
  },
  thumbnailWrap: {
    width: rMS(64),
    height: rMS(64),
    borderRadius: rMS(16),
    marginRight: rS(10),
    padding: 3,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  thumbnailWrapActive: {
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: rMS(13),
  },
  content: {
    paddingTop: rV(10),
  },
  infoShell: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(28),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 3,
  },
  taxonomyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  taxonomyPill: {
    borderRadius: 999,
    backgroundColor: "#E7EDF2",
    paddingHorizontal: rS(12),
    paddingVertical: rV(7),
  },
  taxonomyPillText: {
    fontSize: rMS(11),
    color: AppColors.text,
    fontFamily: Fonts.title,
  },
  productTitle: {
    marginTop: rV(14),
    fontSize: rMS(26),
    lineHeight: rMS(33),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  productLead: {
    marginTop: rV(10),
    fontSize: rMS(13),
    lineHeight: rMS(20),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  metaRow: {
    marginTop: rV(14),
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
  },
  infoStatsRow: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(16),
  },
  infoStat: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: rMS(16),
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoStatLabel: {
    fontSize: rMS(10.5),
    color: AppColors.subtext[100],
    fontFamily: Fonts.text,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  infoStatValue: {
    marginTop: rV(6),
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.title,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    backgroundColor: AppColors.white,
    borderRadius: 999,
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  metaChipText: {
    fontSize: rMS(11),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  priceCard: {
    marginTop: rV(18),
    borderRadius: rMS(26),
    backgroundColor: "#0F172A",
    padding: rS(18),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 26,
    elevation: 4,
  },
  priceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rS(12),
  },
  priceLabel: {
    fontSize: rMS(12),
    color: "#CBD5E1",
    fontFamily: Fonts.text,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rV(6),
    flexWrap: "wrap",
  },
  price: {
    fontSize: rMS(24),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
  },
  oldPrice: {
    marginLeft: rS(10),
    fontSize: rMS(15),
    color: "#94A3B8",
    fontFamily: Fonts.text,
    textDecorationLine: "line-through",
  },
  savingsPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
  },
  savingsPillText: {
    fontSize: rMS(11),
    color: "#E2E8F0",
    fontFamily: Fonts.titleBold,
  },
  variantCard: {
    marginTop: rV(18),
    borderRadius: rMS(24),
    backgroundColor: AppColors.white,
    padding: rS(18),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: rV(14),
  },
  variantHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  variantTitle: {
    fontSize: rMS(14),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  variantValue: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.title,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
  },
  colorBtn: {
    minWidth: rMS(64),
    minHeight: rMS(42),
    borderRadius: rMS(16),
    borderWidth: 1,
    borderColor: "#DBDBDB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
    paddingHorizontal: rS(12),
    paddingVertical: rV(9),
    gap: rS(8),
    flexDirection: "row",
  },
  colorBtnActive: {
    borderColor: AppColors.primary,
    borderWidth: 2,
    backgroundColor: "#F8FAFC",
  },
  colorDot: {
    width: rMS(22),
    height: rMS(22),
    borderRadius: rMS(11),
  },
  colorLabel: {
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  sizeBtn: {
    minWidth: rMS(48),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(13),
    paddingVertical: rV(9),
    borderRadius: rMS(12),
    borderWidth: 1,
    borderColor: "#D6D6D8",
    backgroundColor: AppColors.white,
  },
  sizeBtnActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary,
  },
  sizeBtnText: {
    fontSize: rMS(13),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  sizeBtnTextActive: {
    color: AppColors.white,
  },
  storeCard: {
    marginTop: rV(18),
    borderRadius: rMS(24),
    backgroundColor: "#0F172A",
    padding: rS(18),
  },
  storeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rS(12),
  },
  storeTitleWrap: {
    flex: 1,
    flexDirection: "row",
    gap: rS(12),
  },
  storeIconWrap: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  storeEyebrow: {
    fontSize: rMS(11),
    color: "#CBD5E1",
    fontFamily: Fonts.text,
  },
  storeTitle: {
    marginTop: rV(2),
    fontSize: rMS(16),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
  },
  storeMeta: {
    marginTop: rV(4),
    fontSize: rMS(12),
    color: "#CBD5E1",
    fontFamily: Fonts.text,
  },
  storeRatingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: rS(10),
    paddingVertical: rV(7),
    borderRadius: 999,
  },
  storeRatingText: {
    color: AppColors.white,
    fontSize: rMS(11),
    fontFamily: Fonts.title,
  },
  storeDescription: {
    marginTop: rV(12),
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: "#DDE5EE",
    fontFamily: Fonts.text,
  },
  storeActionsRow: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(14),
  },
  storePrimaryAction: {
    flex: 1,
    backgroundColor: AppColors.white,
    paddingVertical: rV(11),
    borderRadius: rMS(14),
    alignItems: "center",
  },
  storePrimaryActionText: {
    color: "#0F172A",
    fontSize: rMS(13),
    fontFamily: Fonts.titleBold,
  },
  storeSecondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    borderRadius: rMS(14),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: rS(14),
  },
  storeSecondaryActionText: {
    color: AppColors.white,
    fontSize: rMS(12),
    fontFamily: Fonts.title,
  },
  reviewCard: {
    marginTop: rV(18),
    borderRadius: rMS(24),
    backgroundColor: AppColors.white,
    padding: rS(18),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rS(10),
  },
  reviewHeaderTextWrap: {
    flex: 1,
  },
  reviewSectionTitle: {
    fontSize: rMS(16),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  reviewSectionSubtitle: {
    marginTop: rV(4),
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  reviewManageButton: {
    alignSelf: "flex-start",
    borderRadius: rMS(12),
    backgroundColor: "#EEF2F6",
    paddingHorizontal: rS(12),
    paddingVertical: rV(9),
  },
  reviewManageButtonText: {
    fontSize: rMS(11.5),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  reviewSummaryRow: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(14),
  },
  reviewSummaryCard: {
    flex: 0.95,
    borderRadius: rMS(18),
    backgroundColor: "#0F172A",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
  },
  reviewSummaryValue: {
    fontSize: rMS(24),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
  },
  reviewSummaryStars: {
    flexDirection: "row",
    gap: rS(4),
    marginTop: rV(8),
  },
  reviewSummaryLabel: {
    marginTop: rV(8),
    fontSize: rMS(11),
    color: "#CBD5E1",
    fontFamily: Fonts.text,
  },
  reviewSummaryHintCard: {
    flex: 1,
    borderRadius: rMS(18),
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    justifyContent: "space-between",
  },
  reviewSummaryHintText: {
    marginTop: rV(12),
    fontSize: rMS(11.5),
    lineHeight: rMS(17),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  reviewPreviewStack: {
    marginTop: rV(14),
    gap: rS(10),
  },
  reviewPreviewCard: {
    borderRadius: rMS(18),
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
  },
  reviewPreviewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(8),
  },
  reviewPreviewStars: {
    flexDirection: "row",
    gap: rS(3),
  },
  reviewPreviewDate: {
    fontSize: rMS(10.5),
    color: AppColors.subtext[100],
    fontFamily: Fonts.text,
  },
  reviewPreviewComment: {
    marginTop: rV(8),
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: AppColors.text,
    fontFamily: Fonts.text,
  },
  sectionStack: {
    marginTop: rV(18),
  },
  relatedHeader: {
    marginTop: rV(24),
    marginBottom: rV(12),
  },
  relatedTitle: {
    fontSize: rMS(18),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  relatedSubtitle: {
    marginTop: rV(4),
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  relatedList: {
    paddingBottom: rV(4),
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: "#020617",
  },
  fullscreenHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fullscreenHeaderButton: {
    width: rMS(42),
    height: rMS(42),
    borderRadius: rMS(21),
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenCounter: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: rS(14),
    paddingVertical: rV(9),
  },
  fullscreenCounterText: {
    color: AppColors.white,
    fontSize: rMS(12),
    fontFamily: Fonts.title,
  },
  fullscreenImageSlide: {
    width: screenWidth,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
  fullscreenFooter: {
    paddingHorizontal: rS(16),
    paddingBottom: rV(22),
  },
  fullscreenTitle: {
    color: AppColors.white,
    fontSize: rMS(16),
    fontFamily: Fonts.titleBold,
  },
  fullscreenPrice: {
    marginTop: rV(4),
    color: "#CBD5E1",
    fontSize: rMS(13),
    fontFamily: Fonts.text,
  },
  fullscreenThumbs: {
    paddingTop: rV(14),
  },
  fullscreenThumbWrap: {
    width: rMS(56),
    height: rMS(56),
    borderRadius: rMS(14),
    overflow: "hidden",
    marginRight: rS(10),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  fullscreenThumbWrapActive: {
    borderWidth: 2,
    borderColor: AppColors.white,
  },
  fullscreenThumbImage: {
    width: "100%",
    height: "100%",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.985)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingTop: rV(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(12),
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 18,
    elevation: 10,
  },
  bottomPriceWrap: {
    flex: 1,
    minWidth: rS(76),
    paddingRight: rS(6),
  },
  bottomPriceLabel: {
    fontSize: rMS(11),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  bottomPriceValue: {
    marginTop: rV(2),
    fontSize: rMS(20),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    flexShrink: 0,
  },
  bottomVariantText: {
    marginTop: rV(2),
    fontSize: rMS(11),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    flexShrink: 1,
  },
  bottomActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    flex: 1,
    flexShrink: 0,
    justifyContent: "flex-end",
  },
  bottomIconButton: {
    backgroundColor: "#F1F5F9",
    padding: rS(12),
    borderRadius: rMS(18),
    elevation: 0,
  },
  bottomCartButton: {
    backgroundColor: "#0F172A",
    padding: rS(12),
    borderRadius: rMS(18),
  },
  buyNowBtn: {
    minWidth: rS(100),
    maxWidth: rS(138),
    flex: 1,
    backgroundColor: AppColors.primary,
    paddingHorizontal: rS(16),
    paddingVertical: rV(14),
    borderRadius: rMS(20),
    alignItems: "center",
    justifyContent: "center",
  },
  buyNowText: {
    color: AppColors.white,
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
  },
});
