import AddToCartBtn from "@/components/buttons/AddToCartBtn";
import AddToWishList from "@/components/buttons/AddToWishList";
import CollapsibleShippingCard from "@/components/cards/CollapsableCard";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProductCard from "@/components/cards/ProductCard";
import { AppColors } from "@/constants/Colors";
import {
  PopularProducts,
  Stores,
} from "@/constants/Data";
import Fonts from "@/constants/Fonts";
import { useCatalogProduct, useCatalogProducts } from "@/hooks/useCatalog";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rMS, rS, rV } from "@/styles/responsive";
import { resolveApiMediaUrl, resolveImageSource } from "@/utils/media";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

function formatPrice(value: number) {
  return `₵${value.toFixed(2)}`;
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

export default function ProductDetail() {
  const { requireAuth } = useRequireAuth();
  const getParam = (param: string | string[] | undefined) =>
    Array.isArray(param) ? param[0] : param;

  const params = useLocalSearchParams();

  const id = String(getParam(params.id) ?? "");
  const paramTitle = getParam(params.title) ?? "";
  const paramCategory = getParam(params.category);
  const paramImage = getParam(params.image);
  const paramImageKey = getParam(params.imageKey);
  const paramImageUrl = getParam(params.imageUrl);
  const paramPrice = Number(getParam(params.price) ?? 0);
  const paramOldPrice = Number(getParam(params.oldPrice) ?? 0);
  const paramRating = Number(getParam(params.rating) ?? 0);
  const paramReviews = getParam(params.reviews);
  const paramDiscount = getParam(params.discount);
  const isVoucher = getParam(params.isVoucher) === "true";
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const productFallback = useMemo(
    () => ({
      id,
      title: paramTitle,
      category: paramCategory ?? undefined,
      price: paramPrice,
      oldPrice: paramOldPrice > 0 ? paramOldPrice : undefined,
      rating: paramRating > 0 ? paramRating : undefined,
      reviews: paramReviews ?? undefined,
      discount: paramDiscount ?? undefined,
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
  const { products: popularProducts } = useCatalogProducts({
    section: "popular",
    fallback: PopularProducts,
  });
  const title = product.title;
  const category = product.category;
  const image = product.image;
  const price = product.price ?? 0;
  const oldPrice = product.oldPrice ?? 0;
  const rating = product.rating ?? 0;
  const reviews = product.reviews;
  const discount = product.discount;
  const hasRatingsInfo = Boolean(
    (!Number.isNaN(rating) && rating > 0) || reviews?.trim(),
  );
  const productColorOptions = useMemo(
    () => buildColorOptions(product.colorOptions),
    [product.colorOptions],
  );
  const productSizeOptions = useMemo(() => product.sizeOptions ?? [], [product.sizeOptions]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
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
  const shouldShowLoadingState = isLoading;

  React.useEffect(() => {
    if (!selectedColor && productColorOptions[0]) {
      setSelectedColor(productColorOptions[0].id);
    }
  }, [productColorOptions, selectedColor]);

  React.useEffect(() => {
    if (!selectedSize && productSizeOptions[0]) {
      setSelectedSize(productSizeOptions[0]);
    }
  }, [productSizeOptions, selectedSize]);

  const store = useMemo(() => {
    const productTitle = String(title ?? "").toLowerCase();
    const productCategory = String(category ?? "").toLowerCase();

    const match = Stores.find((storeItem) => {
      const storeCategory = String(storeItem.category ?? "").toLowerCase();
      const storeName = String(storeItem.title ?? "").toLowerCase();
      return (
        productTitle.includes(storeName.split(" ")[0]) ||
        productCategory.includes(storeCategory)
      );
    });

    return match ?? Stores[0];
  }, [category, title]);

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
        <Text style={styles.headerTitle}>Product</Text>
        <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
          <AntDesign name="more" size={22} color={AppColors.text} />
        </TouchableOpacity>
      </View>

      {shouldShowLoadingState ? (
        <ScreenLoader label="Loading product..." />
      ) : (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        <View style={styles.imageWrap}>
          <FlatList
            data={productImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => `${id}-img-${idx}`}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth,
              );
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.imageSlide}>
                <Image
                  source={item as any}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            )}
          />
          {productImages.length > 1 && (
            <View style={styles.imageDotsRow}>
              {productImages.map((_, index) => (
                <View
                  key={`${id}-dot-${index}`}
                  style={[
                    styles.imageDot,
                    activeImageIndex === index && styles.imageDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {title}
            </Text>
            {!isVoucher && (
              <View style={styles.badges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>In Stock</Text>
                </View>
                {discount ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{discount}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          {category || (!isVoucher && hasRatingsInfo) ? (
            <View style={styles.metaRow}>
              {category ? <Text style={styles.category}>{category}</Text> : null}
              {!isVoucher && hasRatingsInfo ? (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#facc15" />
                  {rating > 0 ? <Text style={styles.ratingText}>{rating}</Text> : null}
                  {reviews?.trim() ? (
                    <Text style={styles.reviewsText}>({reviews})</Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(price)}</Text>
            {oldPrice > 0 && <Text style={styles.oldPrice}>{formatPrice(oldPrice)}</Text>}
          </View>

          {!isVoucher && (productColorOptions.length > 0 || productSizeOptions.length > 0) && (
            <View style={styles.variantCard}>
              {productColorOptions.length > 0 ? (
                <>
                  <View style={styles.variantHeader}>
                    <Text style={styles.variantTitle}>Choose Color</Text>
                    <Text style={styles.variantValue}>{activeColor?.label ?? "Select"}</Text>
                  </View>
                  <View style={styles.colorRow}>
                    {productColorOptions.map((item) => {
                      const isActive = selectedColor === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.colorBtn,
                            isActive && styles.colorBtnActive,
                          ]}
                          activeOpacity={0.8}
                          onPress={() => setSelectedColor(item.id)}
                        >
                          <View
                            style={[styles.colorDot, { backgroundColor: item.hex }]}
                          />
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
                      const isActive = selectedSize === item;
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[styles.sizeBtn, isActive && styles.sizeBtnActive]}
                          activeOpacity={0.85}
                          onPress={() => setSelectedSize(item)}
                        >
                          <Text
                            style={[
                              styles.sizeBtnText,
                              isActive && styles.sizeBtnTextActive,
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
          )}
        </View>

        {/* Description, Shipping, Returns */}
        <View style={styles.sections}>
          <CollapsibleShippingCard
            title="Description"
            icon={
              <Ionicons
                name="information-outline"
                size={22}
                color={AppColors.subtext[100]}
              />
            }
            description={buildDescriptionLines(product.description)}
            specifications={product.specifications}
            defaultExpanded={false}
          />

          {!isVoucher && (
            <CollapsibleShippingCard
              title="Shipping"
              icon={
                <Ionicons
                  name="arrow-up-right-box"
                  size={18}
                  color={AppColors.subtext[100]}
                />
              }
              description={["Choose your preferred delivery method."]}
              shippingOptions={[
                {
                  type: "Economy",
                  deliveryTime: "Arrives in 7-10 business days",
                  price: "GHC19",
                },
                {
                  type: "Regular",
                  deliveryTime: "Arrives in 4-5 business days",
                  price: "GHC29",
                },
                {
                  type: "One day",
                  deliveryTime: "Arrives in 1 business day",
                  price: "GHC49",
                },
              ]}
              defaultExpanded={false}
            />
          )}
          <CollapsibleShippingCard
            title="Return Policy"
            icon={
              <Ionicons
                name="at-circle"
                size={18}
                color={AppColors.subtext[100]}
              />
            }
            description={[
              "We accept returns of products purchased in online stores by following our Returns Policy below:\n",
              "1. Return within 30 days from the date of ordered through online store.\n",
              "2. Products through online purchases can only be returned to the UNIQLO warehouse for getting refund by returned product in new and original, unused, and still has the price tag and invoice attached.\n",
              "3. The amount refunded is based on the amount you have paid even if the discount has ended with the promotion.\n",
              "4. Products can be exchanged/refunded if there is a factory error.\n",
              "5. The following products cannot be exchanged/refunded for hygiene reasons: Socks, innerwear, camisole, baby products, shoes, AIRism accessories (such as masks, bed sheets, pillowcases, etc.) and other accessories unless the product was originally purchased damaged or defective product.",
            ]}
          />
          {hasRatingsInfo ? (
            <CollapsibleShippingCard
              title="Review"
              icon={
                <Ionicons name="star" size={22} color={AppColors.subtext[100]} />
              }
              description={[
                rating > 0 ? `Average rating: ${rating}/5` : "No star rating yet.",
                reviews?.trim()
                  ? `Customer review summary: ${reviews}`
                  : "No written review summary yet.",
              ]}
              defaultExpanded={false}
            />
          ) : null}
          <View
            className="shadow-sm"
            style={{ borderRadius: 16, marginBottom: 12 }}
          >
            <TouchableOpacity
              style={styles.visitStoreCardContainer}
              activeOpacity={0.7}
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
              <View style={styles.visitStoreCardHeader}>
                <View style={styles.visitStoreCardIconTitle}>
                  <Ionicons
                    name="storefront"
                    size={22}
                    color={AppColors.subtext[100]}
                  />
                  <Text style={styles.visitStoreCardTitle}>Visit Store</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={AppColors.subtext[100]}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* You may also like */}
        <Text style={styles.sectionHeading}>You may also like</Text>
          <FlatList
          data={popularProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard {...item} />}
          contentContainerStyle={styles.alsoLikeList}
        />

        {/* Bottom actions */}
        <View style={styles.actions}>
          <AddToWishList
            product={{
              id,
              image,
              title,
              category,
              price,
              oldPrice,
              rating,
              reviews,
            }}
            size={20}
            iconColor="#fff"
            activeIconColor="#fff"
            containerStyle={styles.iconBtn}
          />
          <TouchableOpacity
            style={styles.buyNowBtn}
            activeOpacity={0.85}
            onPress={handleBuyNow}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chatBtn}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/screens/productDetails/chat/[vendorId]",
                params: { vendorId: id, vendorName: String(title ?? "Vendor") },
              } as any)
            }
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={AppColors.white}
            />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
          <AddToCartBtn
            item={{ id, title, category, price, image, imageKey: product.imageKey }}
            iconSize={22}
            containerStyle={styles.iconBtn}
            iconColor="#fff"
          />
        </View>

        {/* <TouchableOpacity
          style={styles.visitStoreBtn}
          activeOpacity={0.85}
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
          <Text style={styles.visitStoreText}>Visit Store</Text>
        </TouchableOpacity> */}

        <View style={styles.bottomSpacer} />
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rS(16),
    paddingTop: rV(58),
    paddingBottom: rV(12),
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
  headerAction: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: rV(24),
  },
  imageWrap: {
    width: "100%",
    height: rV(300),
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  imageSlide: {
    width: screenWidth,
    height: rV(300),
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageDotsRow: {
    position: "absolute",
    bottom: rV(12),
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(6),
  },
  imageDot: {
    width: rMS(6),
    height: rMS(6),
    borderRadius: rMS(3),
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  imageDotActive: {
    width: rMS(18),
    backgroundColor: AppColors.white,
  },
  info: {
    paddingHorizontal: rS(16),
    paddingTop: rV(20),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(12),
  },
  productTitle: {
    flex: 1,
    fontSize: rMS(20),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  badges: {
    flexDirection: "row",
    gap: rS(8),
  },
  badge: {
    backgroundColor: AppColors.secondary,
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
    borderRadius: rMS(8),
  },
  badgeText: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: rV(10),
  },
  category: {
    fontSize: rMS(14),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
    marginLeft: rS(4),
  },
  reviewsText: {
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
    marginLeft: rS(4),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rV(12),
  },
  price: {
    fontSize: rMS(22),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  oldPrice: {
    fontSize: rMS(18),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
    marginLeft: rS(10),
    textDecorationLine: "line-through",
  },
  variantCard: {
    marginTop: rV(16),
    padding: rS(14),
    borderRadius: rMS(14),
    backgroundColor: "#F7F7F8",
    gap: rV(12),
  },
  variantHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  variantTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  variantValue: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.secondary,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
  },
  colorBtn: {
    minWidth: rMS(56),
    minHeight: rMS(40),
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
    borderColor: AppColors.secondary,
    borderWidth: 2,
  },
  colorDot: {
    width: rMS(22),
    height: rMS(22),
    borderRadius: rMS(11),
  },
  colorLabel: {
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  sizeBtn: {
    minWidth: rMS(46),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderRadius: rMS(10),
    borderWidth: 1,
    borderColor: "#D6D6D8",
    backgroundColor: AppColors.white,
  },
  sizeBtnActive: {
    borderColor: AppColors.secondary,
    backgroundColor: AppColors.secondary,
  },
  sizeBtnText: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  sizeBtnTextActive: {
    color: AppColors.white,
  },
  sections: {
    marginTop: rV(24),
    marginHorizontal: rS(16),
  },
  sectionHeading: {
    fontSize: rMS(17),
    fontFamily: Fonts.title,
    color: AppColors.text,
    marginTop: rV(24),
    marginHorizontal: rS(16),
    marginBottom: rV(12),
  },
  alsoLikeList: {
    paddingHorizontal: rS(16),
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rV(14),
    marginHorizontal: rS(16),
    gap: rS(8),
  },
  iconBtn: {
    backgroundColor: AppColors.secondary,
    padding: rS(14),
    borderRadius: rMS(24),
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: AppColors.secondary,
    paddingVertical: rV(12),
    borderRadius: rMS(24),
    alignItems: "center",
    justifyContent: "center",
  },
  buyNowText: {
    fontSize: rMS(16),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(6),
    paddingVertical: rV(12),
    paddingHorizontal: rS(20),
    borderRadius: rMS(24),
    backgroundColor: AppColors.secondary,
  },
  chatBtnText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  visitStoreBtn: {
    marginTop: rV(16),
    marginHorizontal: rS(16),
    paddingVertical: rV(14),
    borderRadius: rMS(24),
    borderWidth: 1,
    borderColor: AppColors.secondary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
  },
  visitStoreText: {
    fontSize: rMS(16),
    fontFamily: Fonts.textBold,
    color: AppColors.secondary,
  },
  bottomSpacer: {
    height: rV(1),
  },
  visitStoreCardContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  visitStoreCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 18,
    backgroundColor: "#F8FAFC",
  },
  visitStoreCardIconTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  visitStoreCardTitle: {
    fontSize: 16,
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
});
