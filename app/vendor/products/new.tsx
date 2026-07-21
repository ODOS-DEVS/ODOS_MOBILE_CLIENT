import { CatalogTaxonomyPicker } from "@/components/catalog/CatalogTaxonomyPicker";
import { AccountEmptyState } from "@/components/account/AccountUi";
import {
  AccountSettingsGroup,
  AccountSettingToggle,
  AccountStickySaveBar,
} from "@/components/profile/ProfileHubUi";
import KeyboardAwareScrollView from "@/components/layout/KeyboardAwareScrollView";
import TextInputField from "@/components/TextInputField";
import {
  ProductFormChipGroup,
  ProductFormDiscountHint,
  ProductFormDivider,
  ProductFormGallery,
  ProductFormPolicyPicker,
  ProductFormPreviewCard,
  ProductFormProgressCard,
  productFormStyles,
} from "@/components/vendor/VendorProductFormUi";
import {
  AccountSectionCard,
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { useToast } from "@/context/ToastContext";
import { fetchCampaignTags, type CampaignTagOption } from "@/hooks/useDealProducts";
import { useCatalogCategories } from "@/hooks/useCatalog";
import type { CatalogCategoryItem } from "@/hooks/useCatalog";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type { VendorProduct, VendorProductInput } from "@/types/store";
import {
  findCatalogCategoryForProduct,
  findCatalogSubcategoryLabel,
} from "@/utils/catalogTaxonomy";
import { pickCroppedImage } from "@/utils/imagePicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ProductErrors = Partial<Record<keyof VendorProductInput, string>>;
const FLASH_SALE_TAG = "flash-sale";
const MAX_IMAGES = 6;

const SUGGESTED_COLORS = [
  "Black",
  "White",
  "Brown",
  "Tan",
  "Burgundy",
  "Navy",
  "Pink",
  "Gold",
];

const SUGGESTED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "39", "40", "41", "42", "43", "44", "45"];

function toggleValue(values: string[] | undefined, nextValue: string) {
  const current = values ?? [];
  return current.includes(nextValue)
    ? current.filter((value) => value !== nextValue)
    : [...current, nextValue];
}

function validate(values: VendorProductInput) {
  const errors: ProductErrors = {};

  if (!values.name.trim()) {
    errors.name = "Enter the product name.";
  }
  if (values.description.trim().length < 12) {
    errors.description = "Add a short product description (at least 12 characters).";
  }
  if (!values.categorySlug?.trim() && !values.category.trim()) {
    errors.category = "Choose a category from the ODOS catalog.";
  }
  if (!Number.isFinite(values.price) || values.price <= 0) {
    errors.price = "Enter a valid selling price.";
  }
  if (
    values.oldPrice !== undefined &&
    values.oldPrice !== null &&
    (!Number.isFinite(values.oldPrice) || values.oldPrice <= values.price)
  ) {
    errors.oldPrice = "Compare-at price must be higher than the selling price.";
  }
  if (!Number.isFinite(values.stock) || values.stock < 0) {
    errors.stock = "Enter a valid stock quantity.";
  }
  if (!values.imageUris?.length) {
    errors.imageUris = "Add at least one product photo.";
  }
  return errors;
}

const emptyForm = (): VendorProductInput => ({
    name: "",
    description: "",
    category: "",
  categorySlug: "",
    subcategory: "",
    price: 0,
    oldPrice: undefined,
    stock: 0,
    imageUris: [],
    placementTags: [],
    colorOptions: [],
    sizeOptions: [],
    isReturnable: true,
  });

export default function NewVendorProductScreen() {
  const { contentMaxWidth, width } = useResponsive();
  const useSplitRows = width < 400;
  const params = useLocalSearchParams<{
    productId?: string | string[];
    duplicateFrom?: string | string[];
  }>();
  const productId =
    typeof params.productId === "string"
      ? params.productId
      : Array.isArray(params.productId)
        ? params.productId[0]
        : undefined;
  const duplicateFrom =
    typeof params.duplicateFrom === "string"
      ? params.duplicateFrom
      : Array.isArray(params.duplicateFrom)
        ? params.duplicateFrom[0]
        : undefined;
  const isEditing = Boolean(productId);
  const isDuplicating = Boolean(duplicateFrom) && !isEditing;
  const sourceProductId = productId ?? (isDuplicating ? duplicateFrom : undefined);

  const { session, hasVendorAccess, isCheckingVendorAccess } = useRequireVendor();
  const { createProduct, updateProduct, fetchProducts, products, error, isSavingProduct, isLoadingProducts } =
    useStoreStore();
  const { showToast } = useToast();
  const {
    categories: catalogCategories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCatalogCategories();

  const [customColor, setCustomColor] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [specificationsText, setSpecificationsText] = useState("");
  const [form, setForm] = useState<VendorProductInput>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<ProductErrors>({});
  const [campaignOptions, setCampaignOptions] = useState<CampaignTagOption[]>([]);

  useEffect(() => {
    void fetchCampaignTags().then(setCampaignOptions);
  }, []);

  const selectedCategory = useMemo(
    () =>
      catalogCategories.find((entry) => entry.slug === form.categorySlug) ??
      catalogCategories.find((entry) => entry.title === form.category),
    [catalogCategories, form.category, form.categorySlug],
  );

  const selectedProduct = useMemo<VendorProduct | null>(
    () => products.find((product) => product.id === sourceProductId) ?? null,
    [sourceProductId, products],
  );

  const isFlashSale = Boolean(form.placementTags?.includes(FLASH_SALE_TAG));
  const hasSalePricing = Boolean(form.oldPrice && form.oldPrice > form.price);
  const selectedCampaignTags = useMemo(
    () =>
      (form.placementTags ?? []).filter((tag) =>
        campaignOptions.some((option) => option.tag === tag),
      ),
    [campaignOptions, form.placementTags],
  );

  const toggleCampaignTag = (tag: string) => {
    const current = form.placementTags ?? [];
    const preserved = current.filter(
      (value) =>
        value === FLASH_SALE_TAG ||
        !campaignOptions.some((option) => option.tag === value),
    );
    handleChange("placementTags", toggleValue(preserved, tag));
  };
  const coverUri = form.imageUris?.[0];

  const progressItems = useMemo(
    () => [
      { key: "photos", label: "Photos added", done: Boolean(form.imageUris?.length) },
      { key: "name", label: "Product name", done: Boolean(form.name.trim()) },
      {
        key: "description",
        label: "Description",
        done: form.description.trim().length >= 12,
      },
      {
        key: "category",
        label: "Category",
        done: Boolean(form.categorySlug?.trim() || form.category.trim()),
      },
      { key: "price", label: "Selling price", done: form.price > 0 },
      { key: "stock", label: "Stock", done: Number.isFinite(form.stock) && form.stock >= 0 },
    ],
    [form],
  );

  const categoryLabel = selectedCategory
    ? `${selectedCategory.title}${form.subcategory ? ` · ${form.subcategory}` : ""}`
    : form.category;

  const pricePreview =
    form.price > 0
      ? form.oldPrice && form.oldPrice > form.price
        ? `GHS ${form.price.toFixed(2)} · was GHS ${form.oldPrice.toFixed(2)}`
        : `GHS ${form.price.toFixed(2)}`
      : "Set your price";

  useEffect(() => {
    if (!hasVendorAccess || !session || !sourceProductId) {
      return;
    }
    void fetchProducts(session);
  }, [fetchProducts, hasVendorAccess, sourceProductId, session]);

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    const matchedCategory = findCatalogCategoryForProduct(catalogCategories, selectedProduct);

    setForm({
      name: isDuplicating
        ? `${selectedProduct.name} (copy)`
        : selectedProduct.name,
      description: selectedProduct.description,
      category: matchedCategory?.title ?? selectedProduct.category,
      categorySlug: matchedCategory?.slug ?? selectedProduct.categorySlug ?? "",
      subcategory: findCatalogSubcategoryLabel(matchedCategory, selectedProduct.subcategory),
      price: selectedProduct.price,
      oldPrice: selectedProduct.oldPrice,
      stock: selectedProduct.stock,
      imageKey: selectedProduct.imageKey,
      imageUrl: selectedProduct.imageUrl,
      imageUris: selectedProduct.imageUrls?.length
          ? selectedProduct.imageUrls
          : selectedProduct.imageUrl
            ? [selectedProduct.imageUrl]
            : [],
      placementTags: selectedProduct.placementTags ?? [],
      colorOptions: selectedProduct.colorOptions ?? [],
      sizeOptions: selectedProduct.sizeOptions ?? [],
      specifications: selectedProduct.specifications ?? [],
      isReturnable: selectedProduct.isReturnable ?? true,
    });
    setSpecificationsText((selectedProduct.specifications ?? []).join("\n"));
  }, [catalogCategories, isDuplicating, selectedProduct]);

  if (isCheckingVendorAccess || !hasVendorAccess) {
    return <VendorScreenShell title={isEditing ? "Edit Product" : "Add Product"} />;
  }

  if ((isEditing || isDuplicating) && !selectedProduct && isLoadingProducts) {
    return (
      <VendorScreenShell
        title={isEditing ? "Edit Product" : "Add Product"}
        loading
        loadingLabel="Loading product..."
      />
    );
  }

  if ((isEditing || isDuplicating) && !selectedProduct && !isLoadingProducts) {
    return (
      <VendorScreenShell title={isEditing ? "Edit Product" : "Add Product"}>
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <AccountEmptyState
            icon="cube-outline"
            title="Product not found"
            message="This listing is missing from your catalog."
            actionLabel="Back to products"
            onAction={() => router.back()}
          />
        </View>
      </VendorScreenShell>
    );
  }

  const handleChange = <K extends keyof VendorProductInput>(
    key: K,
    value: VendorProductInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handlePickImages = async () => {
    if ((form.imageUris?.length ?? 0) >= MAX_IMAGES) {
      showToast(`You can upload up to ${MAX_IMAGES} product images.`);
      return;
    }

    const result = await pickCroppedImage(undefined, 0.85);
    if (!result.granted) {
      showToast("Allow photo access to upload product images.");
      return;
    }
    if (result.canceled || !result.uri) {
      return;
    }
    handleChange("imageUris", [...(form.imageUris ?? []), result.uri]);
  };

  const handleSetCover = (uri: string) => {
    const rest = (form.imageUris ?? []).filter((entry) => entry !== uri);
    handleChange("imageUris", [uri, ...rest]);
  };

  const handleRemoveImage = (uri: string) => {
    handleChange(
      "imageUris",
      (form.imageUris ?? []).filter((entry) => entry !== uri),
    );
  };

  const handleSubmit = async () => {
    const nextInput: VendorProductInput = {
      ...form,
      subcategory: form.subcategory?.trim() || undefined,
      placementTags: form.placementTags?.length ? form.placementTags : undefined,
      colorOptions: form.colorOptions?.length ? form.colorOptions : undefined,
      sizeOptions: form.sizeOptions?.length ? form.sizeOptions : undefined,
      specifications: specificationsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };

    const nextErrors = validate(nextInput);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showToast("Complete the required fields highlighted below.");
      return;
    }

    try {
      if (isEditing && productId) {
        await updateProduct(session, productId, nextInput);
        showToast("Product updated successfully.");
      } else {
        await createProduct(session, nextInput);
        showToast("Product submitted for review.");
      }
      router.replace("/vendor/products" as any);
    } catch (submitError) {
      showToast(
        submitError instanceof Error
          ? submitError.message
          : isEditing
            ? "We couldn't update the product right now."
            : "We couldn't create the product right now.",
      );
    }
  };

  const handleSelectCategory = (category: CatalogCategoryItem) => {
    setForm((current) => ({
      ...current,
      categorySlug: category.slug,
      category: category.title,
      subcategory: "",
    }));
    setFieldErrors((current) => ({ ...current, category: undefined }));
  };

  const handleAddCustomColor = () => {
    const nextValue = customColor.trim();
    if (!nextValue || form.colorOptions?.includes(nextValue)) {
      setCustomColor("");
      return;
    }
    handleChange("colorOptions", [...(form.colorOptions ?? []), nextValue]);
    setCustomColor("");
  };

  const handleAddCustomSize = () => {
    const nextValue = customSize.trim();
    if (!nextValue || form.sizeOptions?.includes(nextValue)) {
      setCustomSize("");
      return;
    }
    handleChange("sizeOptions", [...(form.sizeOptions ?? []), nextValue]);
    setCustomSize("");
  };

  const priceFields = (
    <>
      <TextInputField
        label="Selling price (GHS) *"
        icon="cash-outline"
        placeholder="0.00"
        value={form.price ? String(form.price) : ""}
        onChangeText={(text) =>
          handleChange("price", Number(text.replace(/[^0-9.]/g, "")) || 0)
        }
        errorMessage={fieldErrors.price}
        keyboardType="decimal-pad"
      />
      <TextInputField
        label="Compare-at price (GHS)"
        icon="pricetags-outline"
        placeholder="Optional — shows a discount"
        value={form.oldPrice ? String(form.oldPrice) : ""}
        onChangeText={(text) =>
          handleChange("oldPrice", Number(text.replace(/[^0-9.]/g, "")) || undefined)
        }
        errorMessage={fieldErrors.oldPrice}
        keyboardType="decimal-pad"
      />
      <ProductFormDiscountHint price={form.price} oldPrice={form.oldPrice} />
    </>
  );

  const stockAndPromoFields = (
    <>
      <TextInputField
        label="Stock quantity *"
        icon="layers-outline"
        placeholder="0"
        value={form.stock ? String(form.stock) : ""}
        onChangeText={(text) => handleChange("stock", Number(text.replace(/\D/g, "")) || 0)}
        errorMessage={fieldErrors.stock}
        keyboardType="number-pad"
      />
      <AccountSettingsGroup title="Merchandising">
        <AccountSettingToggle
          title="Feature in flash sales"
          description="Surfaces on your store and the ODOS home flash-sale section. Pair with compare-at pricing for stronger deals."
          value={isFlashSale}
          onValueChange={(value) =>
            handleChange(
              "placementTags",
              value
                ? [...selectedCampaignTags, FLASH_SALE_TAG]
                : selectedCampaignTags,
            )
          }
          isLast={!hasSalePricing || campaignOptions.length === 0}
        />
      </AccountSettingsGroup>
      {hasSalePricing && campaignOptions.length > 0 ? (
        <ProductFormChipGroup
          label="Join ODOS campaigns"
          helper="Optional. Only products you discount can appear in campaign promos — you control the sale price."
          options={campaignOptions.map((option) => option.label)}
          selected={selectedCampaignTags.map(
            (tag) => campaignOptions.find((option) => option.tag === tag)?.label ?? tag,
          )}
          onToggle={(label) => {
            const tag = campaignOptions.find((option) => option.label === label)?.tag;
            if (tag) {
              toggleCampaignTag(tag);
            }
          }}
        />
      ) : null}
    </>
  );

  return (
    <VendorScreenShell title={isEditing ? "Edit Product" : "Add Product"}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[vendorStyles.content, { paddingBottom: rV(110) }]}
      >
          <View style={[vendorStyles.contentWrap, styles.formStack, { maxWidth: contentMaxWidth }]}>
            <VendorPageIntro
              title={
                isEditing
                  ? "Update listing"
                  : isDuplicating
                    ? "Duplicate listing"
                    : "New product listing"
              }
              subtitle={
                isDuplicating
                  ? "Review the copied details, adjust anything needed, then publish as a new product."
                  : "Build a complete listing with ODOS catalog categories, clear pricing, and photos shoppers can trust."
              }
            />

            <ProductFormProgressCard items={progressItems} />

            <ProductFormPreviewCard
              name={form.name}
              categoryLabel={categoryLabel}
              priceLabel={pricePreview}
              imageUri={coverUri}
            />

            <AccountSectionCard title="Photos">
              <ProductFormGallery
                images={(form.imageUris ?? []).map((uri) => ({ uri }))}
                maxImages={MAX_IMAGES}
                error={fieldErrors.imageUris}
                onAdd={() => void handlePickImages()}
                onRemove={handleRemoveImage}
                onSetCover={handleSetCover}
              />
            </AccountSectionCard>

            <AccountSectionCard title="Basics">
              <View style={productFormStyles.sectionGap}>
              <TextInputField
                  label="Product name *"
                icon="cube-outline"
                  placeholder="e.g. Classic shoulder bag"
                value={form.name}
                onChangeText={(text) => handleChange("name", text)}
                errorMessage={fieldErrors.name}
              />
              <TextInputField
                label="Description *"
                icon="document-text-outline"
                  placeholder="What makes this product worth buying?"
                value={form.description}
                onChangeText={(text) => handleChange("description", text)}
                errorMessage={fieldErrors.description}
                multiline
                numberOfLines={4}
              />
                <CatalogTaxonomyPicker
                  categories={catalogCategories}
                  isLoading={isLoadingCategories}
                  error={categoriesError}
                  categorySlug={form.categorySlug ?? ""}
                  subcategory={form.subcategory ?? ""}
                  onSelectCategory={handleSelectCategory}
                  onSelectSubcategory={(value) => handleChange("subcategory", value)}
                  categoryError={fieldErrors.category}
                  />
                </View>
            </AccountSectionCard>

            <AccountSectionCard title="Pricing & inventory">
              <View style={productFormStyles.sectionGap}>
                {useSplitRows ? (
                  <>
                    <View style={productFormStyles.rowStack}>{priceFields}</View>
                    <View style={productFormStyles.rowStack}>{stockAndPromoFields}</View>
                  </>
                ) : (
                  <>
                    <View style={productFormStyles.rowSplit}>
                      <View style={productFormStyles.rowHalf}>{priceFields}</View>
                      <View style={productFormStyles.rowHalf}>{stockAndPromoFields}</View>
                </View>
                  </>
                )}
                </View>
            </AccountSectionCard>

            <AccountSectionCard title="Variants (optional)">
              <Text style={productFormStyles.helperText}>
                Only add options that apply. Leave blank for single-SKU items.
              </Text>

              <ProductFormChipGroup
                label="Colors"
                helper="Tap common colors or add a custom shade below."
                options={SUGGESTED_COLORS}
                selected={form.colorOptions ?? []}
                onToggle={(value) =>
                  handleChange("colorOptions", toggleValue(form.colorOptions, value))
                }
              />
              <View style={styles.inlineRow}>
                <View style={styles.inlineField}>
                  <TextInputField
                    label="Custom color"
                    icon="color-palette-outline"
                    placeholder="e.g. Rose gold"
                    value={customColor}
                    onChangeText={setCustomColor}
                  />
                </View>
                <TouchableOpacity
                  style={styles.inlineAddBtn}
                  onPress={handleAddCustomColor}
                  activeOpacity={0.85}
                >
                  <Text style={styles.inlineAddLabel}>Add</Text>
                </TouchableOpacity>
              </View>

              <ProductFormDivider />

              <ProductFormChipGroup
                label="Sizes"
                helper="Apparel, footwear, or any size label shoppers should pick."
                options={SUGGESTED_SIZES}
                selected={form.sizeOptions ?? []}
                onToggle={(value) =>
                  handleChange("sizeOptions", toggleValue(form.sizeOptions, value))
                }
              />
              <View style={styles.inlineRow}>
                <View style={styles.inlineField}>
                  <TextInputField
                    label="Custom size"
                    icon="resize-outline"
                    placeholder="e.g. One size"
                    value={customSize}
                    onChangeText={setCustomSize}
                  />
                </View>
                <TouchableOpacity
                  style={styles.inlineAddBtn}
                  onPress={handleAddCustomSize}
                  activeOpacity={0.85}
                >
                  <Text style={styles.inlineAddLabel}>Add</Text>
                </TouchableOpacity>
              </View>

              <ProductFormDivider />

              <TextInputField
                label="Specifications"
                icon="list-outline"
                placeholder={"Material: Leather\nWarranty: 6 months"}
                value={specificationsText}
                onChangeText={setSpecificationsText}
                multiline
                numberOfLines={5}
              />
              <Text style={productFormStyles.helperText}>
                One detail per line — great for electronics, appliances, or measurements.
              </Text>
            </AccountSectionCard>

            <AccountSectionCard title="Returns">
              <Text style={productFormStyles.helperText}>
                Returnable items can be requested in the shopper returns hub after delivery.
              </Text>
              <ProductFormPolicyPicker
                isReturnable={form.isReturnable !== false}
                onChange={(value) => handleChange("isReturnable", value)}
              />
            </AccountSectionCard>

            {error ? <Text style={productFormStyles.errorText}>{error}</Text> : null}

            {!isEditing ? (
              <Text style={styles.reviewNote}>
                New listings are reviewed by ODOS before they go live in the catalog.
              </Text>
            ) : null}
          </View>
        </KeyboardAwareScrollView>

        <AccountStickySaveBar
          label={isEditing ? "Save changes" : "Publish listing"}
          onPress={() => void handleSubmit()}
          loading={isSavingProduct}
        />
    </VendorScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  formStack: {
    gap: rV(14),
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: rS(10),
  },
  inlineField: {
    flex: 1,
  },
  inlineAddBtn: {
    minWidth: rS(72),
    borderRadius: rMS(14),
    backgroundColor: "#E8EEF6",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    marginBottom: rV(12),
  },
  inlineAddLabel: {
    color: "#1D4ED8",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12.5),
    textAlign: "center",
  },
  reviewNote: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: rS(8),
  },
});
