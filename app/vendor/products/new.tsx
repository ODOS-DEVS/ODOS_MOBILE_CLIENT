import TextInputField from "@/components/TextInputField";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type { VendorProduct, VendorProductInput } from "@/types/store";
import { pickCroppedImage } from "@/utils/imagePicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ProductErrors = Partial<Record<keyof VendorProductInput, string>>;
const FLASH_SALE_TAG = "flash-sale";

const suggestedColors = [
  "Black",
  "White",
  "Brown",
  "Tan",
  "Burgundy",
  "Navy",
  "Pink",
  "Gold",
];

const suggestedSizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
];

const productTaxonomy = [
  {
    label: "Fashion",
    value: "Fashion",
    subcategories: ["Dresses", "Tops", "Trousers", "Two-Piece Sets", "Denim"],
  },
  {
    label: "Accessories",
    value: "Accessories",
    subcategories: ["Handbags", "Jewelry", "Belts", "Hats", "Scarves"],
  },
  {
    label: "Footwear",
    value: "Footwear",
    subcategories: ["Sneakers", "Heels", "Sandals", "Slides", "Formal Shoes"],
  },
  {
    label: "Beauty",
    value: "Beauty",
    subcategories: ["Skincare", "Makeup", "Fragrance", "Haircare"],
  },
  {
    label: "Kids",
    value: "Kids",
    subcategories: ["Kids Clothing", "School Bags", "Toys", "Baby Essentials"],
  },
  {
    label: "Electronics",
    value: "Electronics",
    subcategories: ["Phones", "Audio", "Accessories", "Wearables"],
  },
  {
    label: "Home",
    value: "Home",
    subcategories: ["Decor", "Kitchen", "Bedding", "Storage"],
  },
];

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
    errors.description = "Add a short product description.";
  }
  if (!values.category.trim()) {
    errors.category = "Enter the product category.";
  }
  if (!Number.isFinite(values.price) || values.price <= 0) {
    errors.price = "Enter a valid price.";
  }
  if (
    values.oldPrice !== undefined &&
    values.oldPrice !== null &&
    (!Number.isFinite(values.oldPrice) || values.oldPrice <= values.price)
  ) {
    errors.oldPrice = "Compare-at price should be higher than the live selling price.";
  }
  if (!Number.isFinite(values.stock) || values.stock < 0) {
    errors.stock = "Enter a valid stock quantity.";
  }
  if (!values.imageUris?.length) {
    errors.imageUris = "Upload at least one real product image.";
  }
  return errors;
}

export default function NewVendorProductScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const params = useLocalSearchParams<{ productId?: string | string[] }>();
  const productId = typeof params.productId === "string"
    ? params.productId
    : Array.isArray(params.productId)
      ? params.productId[0]
      : undefined;
  const isEditing = Boolean(productId);
  const { session, hasVendorAccess, isCheckingVendorAccess } = useRequireVendor();
  const {
    createProduct,
    updateProduct,
    fetchProducts,
    products,
    error,
    isSavingProduct,
  } = useStoreStore();
  const { showToast } = useToast();

  const [customColor, setCustomColor] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [specificationsText, setSpecificationsText] = useState("");
  const [selectorMode, setSelectorMode] = useState<"category" | "subcategory" | null>(null);
  const [form, setForm] = useState<VendorProductInput>({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    price: 0,
    oldPrice: undefined,
    stock: 0,
    imageUris: [],
    placementTags: [],
    colorOptions: [],
    sizeOptions: [],
  });
  const [fieldErrors, setFieldErrors] = useState<ProductErrors>({});

  const canSubmit = useMemo(() => !isSavingProduct, [isSavingProduct]);
  const selectedCategory = useMemo(
    () => productTaxonomy.find((entry) => entry.value === form.category),
    [form.category],
  );
  const subcategoryOptions = selectedCategory?.subcategories ?? [];
  const selectedProduct = useMemo<VendorProduct | null>(
    () => products.find((product) => product.id === productId) ?? null,
    [productId, products],
  );
  const isFlashSale = Boolean(form.placementTags?.includes(FLASH_SALE_TAG));

  useEffect(() => {
    if (!hasVendorAccess || !session || !isEditing || products.length > 0) {
      return;
    }

    void fetchProducts(session);
  }, [fetchProducts, hasVendorAccess, isEditing, products.length, session]);

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    setForm({
      name: selectedProduct.name,
      description: selectedProduct.description,
      category: selectedProduct.category,
      subcategory: selectedProduct.subcategory ?? "",
      price: selectedProduct.price,
      oldPrice: selectedProduct.oldPrice,
      stock: selectedProduct.stock,
      imageKey: selectedProduct.imageKey,
      imageUrl: selectedProduct.imageUrl,
      imageUris:
        selectedProduct.imageUrls?.length
          ? selectedProduct.imageUrls
          : selectedProduct.imageUrl
            ? [selectedProduct.imageUrl]
            : [],
      placementTags: selectedProduct.placementTags ?? [],
      colorOptions: selectedProduct.colorOptions ?? [],
      sizeOptions: selectedProduct.sizeOptions ?? [],
      specifications: selectedProduct.specifications ?? [],
    });
    setSpecificationsText((selectedProduct.specifications ?? []).join("\n"));
  }, [selectedProduct]);

  if (isCheckingVendorAccess || !hasVendorAccess) {
    return (
      <View style={styles.screen}>
        <ProfileHeader title={isEditing ? "Edit Product" : "Add Product"} />
      </View>
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
    if ((form.imageUris?.length ?? 0) >= 6) {
      showToast("You can upload up to 6 product images.");
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
      showToast("Please complete the product details.");
      return;
    }

    try {
      if (isEditing && productId) {
        await updateProduct(session, productId, nextInput);
        showToast("Product changes saved.");
      } else {
        await createProduct(session, nextInput);
        showToast("Product added to your vendor store.");
      }
      router.replace("/vendor/products" as any);
    } catch (createError) {
      showToast(
        createError instanceof Error
          ? createError.message
          : isEditing
            ? "We couldn't update the product right now."
            : "We couldn't create the product right now.",
      );
    }
  };

  const handleToggleColor = (value: string) => {
    handleChange("colorOptions", toggleValue(form.colorOptions, value));
  };

  const handleToggleSize = (value: string) => {
    handleChange("sizeOptions", toggleValue(form.sizeOptions, value));
  };

  const handleAddCustomColor = () => {
    const nextValue = customColor.trim();
    if (!nextValue) {
      return;
    }

    if (form.colorOptions?.includes(nextValue)) {
      setCustomColor("");
      return;
    }

    handleChange("colorOptions", [...(form.colorOptions ?? []), nextValue]);
    setCustomColor("");
  };

  const handleAddCustomSize = () => {
    const nextValue = customSize.trim();
    if (!nextValue) {
      return;
    }

    if (form.sizeOptions?.includes(nextValue)) {
      setCustomSize("");
      return;
    }

    handleChange("sizeOptions", [...(form.sizeOptions ?? []), nextValue]);
    setCustomSize("");
  };

  const handleToggleFlashSale = () => {
    handleChange("placementTags", toggleValue(form.placementTags, FLASH_SALE_TAG));
  };

  const handleSelectCategory = (value: string) => {
    handleChange("category", value);
    handleChange("subcategory", "");
    setSelectorMode(null);
  };

  const handleSelectSubcategory = (value: string) => {
    handleChange("subcategory", value);
    setSelectorMode(null);
  };

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Add Product" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Modal
          transparent
          visible={selectorMode !== null}
          animationType="fade"
          onRequestClose={() => setSelectorMode(null)}
        >
          <Pressable style={styles.selectorOverlay} onPress={() => setSelectorMode(null)}>
            <Pressable style={styles.selectorModal} onPress={() => undefined}>
              <Text style={styles.selectorModalTitle}>
                {selectorMode === "category" ? "Choose category" : "Choose subcategory"}
              </Text>
              <ScrollView
                style={styles.selectorOptionsWrap}
                showsVerticalScrollIndicator={false}
              >
                {(selectorMode === "category"
                  ? productTaxonomy.map((entry) => ({
                      key: entry.value,
                      label: entry.label,
                      selected: form.category === entry.value,
                      onPress: () => handleSelectCategory(entry.value),
                    }))
                  : subcategoryOptions.map((entry) => ({
                      key: entry,
                      label: entry,
                      selected: form.subcategory === entry,
                      onPress: () => handleSelectSubcategory(entry),
                    }))
                ).map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.selectorOption,
                      option.selected && styles.selectorOptionSelected,
                    ]}
                    onPress={option.onPress}
                    activeOpacity={0.82}
                  >
                    <Text
                      style={[
                        styles.selectorOptionText,
                        option.selected && styles.selectorOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.selectorCloseButton}
                onPress={() => setSelectorMode(null)}
                activeOpacity={0.84}
              >
                <Text style={styles.selectorCloseButtonLabel}>Done</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + rV(36) },
          ]}
        >
          <View style={[styles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <View style={styles.heroCard}>
              <Text style={styles.heroEyebrow}>Product Studio</Text>
              <Text style={styles.heroTitle}>
                {isEditing ? "Refine the listing shoppers already see" : "Build a listing that feels ready to buy"}
              </Text>
              <Text style={styles.heroText}>
                {isEditing
                  ? "Update the gallery, sharpen the offer, and control whether this product shows up in flash-sale merchandising."
                  : "Use sharp product photos, clear pricing, and only add variants that actually matter for this item."}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.galleryHeader}>
                <View style={styles.galleryHeaderTextWrap}>
                  <Text style={styles.sectionTitle}>Product gallery</Text>
                  <Text style={styles.helperText}>
                    Upload up to 6 real product images. The first image becomes the cover.
                  </Text>
                </View>
                {form.imageUris?.length ? (
                  <View style={styles.galleryCountBadge}>
                    <Text style={styles.galleryCountText}>
                      {form.imageUris.length} image{form.imageUris.length > 1 ? "s" : ""}
                    </Text>
                  </View>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickImages}
                activeOpacity={0.84}
              >
                <Text style={styles.uploadButtonLabel}>
                  {form.imageUris?.length ? "Add another cropped image" : "Upload product images"}
                </Text>
                <Text style={styles.uploadButtonHint}>
                  Crop each image before adding it so shoppers see the right focus.
                </Text>
              </TouchableOpacity>

              {fieldErrors.imageUris ? (
                <Text style={styles.errorText}>{fieldErrors.imageUris}</Text>
              ) : null}

              {form.imageUris?.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.previewRow}
                >
                  {form.imageUris.map((uri, index) => (
                    <View key={`${uri}-${index}`} style={styles.previewCard}>
                      <Image
                        source={{ uri }}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                      <View style={styles.previewBadge}>
                        <Text style={styles.previewBadgeText}>
                          {index === 0 ? "Cover" : `View ${index + 1}`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(uri)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.removeImageButtonLabel}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyGalleryState}>
                  <Text style={styles.emptyGalleryTitle}>No images selected yet</Text>
                  <Text style={styles.emptyGalleryText}>
                    This listing will look much better once shoppers can swipe through
                    real photos of the item.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Product details</Text>
              <Text style={styles.helperText}>
                Add the essentials first, then define optional variants like colors
                or sizes only if they matter for this product.
              </Text>
              <TextInputField
                label="Product Name *"
                icon="cube-outline"
                placeholder="e.g. Classic Shoulder Bag"
                value={form.name}
                onChangeText={(text) => handleChange("name", text)}
                errorMessage={fieldErrors.name}
              />

              <TextInputField
                label="Description *"
                icon="document-text-outline"
                placeholder="Short summary customers will see"
                value={form.description}
                onChangeText={(text) => handleChange("description", text)}
                errorMessage={fieldErrors.description}
                multiline
                numberOfLines={4}
              />

              <View style={styles.dualRow}>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Category *</Text>
                  <TouchableOpacity
                    style={styles.selectorField}
                    onPress={() => setSelectorMode("category")}
                    activeOpacity={0.84}
                  >
                    <Text
                      style={[
                        styles.selectorValue,
                        !form.category && styles.selectorPlaceholder,
                      ]}
                    >
                      {form.category || "Select a category"}
                    </Text>
                    <Text style={styles.selectorAction}>Choose</Text>
                  </TouchableOpacity>
                  {fieldErrors.category ? (
                    <Text style={styles.errorText}>{fieldErrors.category}</Text>
                  ) : null}
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Subcategory</Text>
                  <TouchableOpacity
                    style={[
                      styles.selectorField,
                      !selectedCategory && styles.selectorFieldDisabled,
                    ]}
                    onPress={() => {
                      if (!selectedCategory) {
                        showToast("Choose a category first.");
                        return;
                      }
                      setSelectorMode("subcategory");
                    }}
                    activeOpacity={0.84}
                  >
                    <Text
                      style={[
                        styles.selectorValue,
                        !form.subcategory && styles.selectorPlaceholder,
                      ]}
                    >
                      {form.subcategory || "Select a subcategory"}
                    </Text>
                    <Text style={styles.selectorAction}>Choose</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.dualRow}>
                <View style={styles.halfField}>
                  <TextInputField
                    label="Price (GHS) *"
                    icon="cash-outline"
                    placeholder="0.00"
                    value={form.price ? String(form.price) : ""}
                    onChangeText={(text) =>
                      handleChange("price", Number(text.replace(/[^0-9.]/g, "")) || 0)
                    }
                    errorMessage={fieldErrors.price}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.halfField}>
                  <TextInputField
                    label="Compare-at price (GHS)"
                    icon="pricetag-outline"
                    placeholder="0.00"
                    value={form.oldPrice ? String(form.oldPrice) : ""}
                    onChangeText={(text) =>
                      handleChange("oldPrice", Number(text.replace(/[^0-9.]/g, "")) || undefined)
                    }
                    errorMessage={fieldErrors.oldPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.dualRow}>
                <View style={styles.halfField}>
                  <TextInputField
                    label="Stock *"
                    icon="layers-outline"
                    placeholder="0"
                    value={String(form.stock)}
                    onChangeText={(text) =>
                      handleChange("stock", Number(text.replace(/\D/g, "")) || 0)
                    }
                    errorMessage={fieldErrors.stock}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Flash sale</Text>
                  <TouchableOpacity
                    style={[styles.selectorField, isFlashSale && styles.selectorFieldActive]}
                    onPress={handleToggleFlashSale}
                    activeOpacity={0.84}
                  >
                    <Text style={styles.selectorValue}>
                      {isFlashSale ? "Included in flash sales" : "Not in flash sales yet"}
                    </Text>
                    <Text style={styles.selectorAction}>
                      {isFlashSale ? "Remove" : "Feature"}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.helperInline}>
                    Flash sale products surface on your store screen and the shared ODOS home flash-sales section. Add a compare-at price too if you want the deal to look stronger.
                  </Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Colors</Text>
              <Text style={styles.helperText}>
                Pick one or more common colors, then add a custom value if you need a
                shade that is not listed.
              </Text>
              <View style={styles.chipsRow}>
                {suggestedColors.map((color) => {
                  const isSelected = form.colorOptions?.includes(color);
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => handleToggleColor(color)}
                      activeOpacity={0.82}
                    >
                      <Text
                        style={[
                          styles.chipLabel,
                          isSelected && styles.chipLabelSelected,
                        ]}
                      >
                        {color}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.inlineInputRow}>
                <View style={styles.inlineInputField}>
                  <TextInputField
                    label="Custom color"
                    icon="color-palette-outline"
                    placeholder="e.g. Rose Gold"
                    value={customColor}
                    onChangeText={setCustomColor}
                  />
                </View>
                <TouchableOpacity
                  style={styles.inlineAddButton}
                  onPress={handleAddCustomColor}
                  activeOpacity={0.82}
                >
                  <Text style={styles.inlineAddButtonLabel}>Add</Text>
                </TouchableOpacity>
              </View>
              {form.colorOptions?.length ? (
                <View style={styles.selectedWrap}>
                  {form.colorOptions.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={styles.selectedChip}
                      onPress={() => handleToggleColor(color)}
                      activeOpacity={0.82}
                    >
                      <Text style={styles.selectedChipLabel}>{color} ×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              <Text style={styles.fieldLabel}>Sizes</Text>
              <Text style={styles.helperText}>
                Use apparel sizes, numeric shoe sizes, or add your own custom label.
              </Text>
              <View style={styles.chipsRow}>
                {suggestedSizes.map((size) => {
                  const isSelected = form.sizeOptions?.includes(size);
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => handleToggleSize(size)}
                      activeOpacity={0.82}
                    >
                      <Text
                        style={[
                          styles.chipLabel,
                          isSelected && styles.chipLabelSelected,
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.inlineInputRow}>
                <View style={styles.inlineInputField}>
                  <TextInputField
                    label="Custom size"
                    icon="resize-outline"
                    placeholder="e.g. Standard or 46"
                    value={customSize}
                    onChangeText={setCustomSize}
                  />
                </View>
                <TouchableOpacity
                  style={styles.inlineAddButton}
                  onPress={handleAddCustomSize}
                  activeOpacity={0.82}
                >
                  <Text style={styles.inlineAddButtonLabel}>Add</Text>
                </TouchableOpacity>
              </View>
              {form.sizeOptions?.length ? (
                <View style={styles.selectedWrap}>
                  {form.sizeOptions.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={styles.selectedChip}
                      onPress={() => handleToggleSize(size)}
                      activeOpacity={0.82}
                    >
                      <Text style={styles.selectedChipLabel}>{size} ×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              <TextInputField
                label="Specifications"
                icon="list-outline"
                placeholder={"Processor: Intel Core i7\nRAM: 16GB\nStorage: 512GB SSD"}
                value={specificationsText}
                onChangeText={setSpecificationsText}
                multiline
                numberOfLines={5}
              />
              <Text style={styles.helperText}>
                Add one spec per line. This works especially well for laptops,
                appliances, gadgets, and detailed fashion measurements.
              </Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonLabel}>
                {isSavingProduct
                  ? isEditing
                    ? "Saving Changes..."
                    : "Saving Product..."
                  : isEditing
                    ? "Update Product"
                    : "Create Product"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  heroCard: {
    backgroundColor: "#102542",
    borderRadius: rMS(28),
    paddingHorizontal: rS(20),
    paddingVertical: rV(22),
    marginBottom: rV(16),
  },
  heroEyebrow: {
    color: "#A5C8FF",
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.5),
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  heroTitle: {
    marginTop: rV(8),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(22),
    lineHeight: rMS(28),
  },
  heroText: {
    marginTop: rV(10),
    color: "#D8E6FF",
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingTop: rV(18),
    paddingBottom: rV(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    marginBottom: rV(16),
  },
  sectionTitle: {
    marginBottom: rV(12),
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(15),
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rS(10),
  },
  galleryHeaderTextWrap: {
    flex: 1,
  },
  galleryCountBadge: {
    alignSelf: "flex-start",
    borderRadius: rMS(999),
    backgroundColor: "#EEF4FF",
    paddingHorizontal: rS(12),
    paddingVertical: rV(7),
  },
  galleryCountText: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.5),
  },
  helperText: {
    marginBottom: rV(14),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
  },
  selectorOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
    paddingHorizontal: rS(20),
    justifyContent: "center",
  },
  selectorModal: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingTop: rV(18),
    paddingBottom: rV(14),
    maxHeight: "72%",
  },
  selectorModalTitle: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    marginBottom: rV(12),
  },
  selectorOptionsWrap: {
    maxHeight: rV(320),
  },
  selectorOption: {
    borderRadius: rMS(16),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    backgroundColor: "#F8FAFC",
    marginBottom: rV(10),
  },
  selectorOptionSelected: {
    backgroundColor: "#EAF2FF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#94B8FF",
  },
  selectorOptionText: {
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
  selectorOptionTextSelected: {
    color: AppColors.primary,
  },
  selectorCloseButton: {
    marginTop: rV(8),
    borderRadius: rMS(999),
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(14),
  },
  selectorCloseButtonLabel: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
  dualRow: {
    flexDirection: "row",
    gap: rS(12),
  },
  halfField: {
    flex: 1,
  },
  selectorField: {
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D9E0E8",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    minHeight: rV(54),
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rV(4),
  },
  selectorFieldDisabled: {
    opacity: 0.58,
  },
  selectorFieldActive: {
    borderColor: "#94B8FF",
    backgroundColor: "#EEF4FF",
  },
  selectorValue: {
    color: AppColors.text,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    flex: 1,
    paddingRight: rS(10),
  },
  selectorPlaceholder: {
    color: AppColors.subtext[100],
  },
  selectorAction: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
  fieldLabel: {
    marginBottom: rV(10),
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
    paddingLeft: rS(8),
  },
  helperInline: {
    marginTop: rV(6),
    marginBottom: rV(8),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
    lineHeight: rMS(17),
    paddingLeft: rS(8),
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    marginBottom: rV(12),
  },
  inlineInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: rS(10),
  },
  inlineInputField: {
    flex: 1,
  },
  inlineAddButton: {
    minWidth: rS(76),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rMS(14),
    backgroundColor: "#E8EEF6",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    marginBottom: rV(12),
  },
  inlineAddButtonLabel: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
  chip: {
    borderRadius: rMS(999),
    paddingHorizontal: rS(14),
    paddingVertical: rV(10),
    backgroundColor: "#F3F4F6",
  },
  chipSelected: {
    backgroundColor: AppColors.primary,
  },
  chipLabel: {
    color: AppColors.secondary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
  chipLabelSelected: {
    color: AppColors.white,
  },
  selectedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    marginBottom: rV(8),
  },
  selectedChip: {
    borderRadius: rMS(999),
    backgroundColor: "#EFF6FF",
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
  },
  selectedChipLabel: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.5),
  },
  uploadButton: {
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D9E0E8",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(16),
    marginBottom: rV(12),
  },
  uploadButtonLabel: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
  uploadButtonHint: {
    marginTop: rV(6),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
  emptyGalleryState: {
    borderRadius: rMS(20),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#DAE2EC",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: rS(16),
    paddingVertical: rV(18),
    marginBottom: rV(8),
  },
  emptyGalleryTitle: {
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13.5),
  },
  emptyGalleryText: {
    marginTop: rV(6),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
  },
  previewRow: {
    gap: rS(12),
    paddingBottom: rV(12),
  },
  previewCard: {
    width: rS(110),
  },
  previewImage: {
    width: "100%",
    height: rV(110),
    borderRadius: rMS(18),
    backgroundColor: "#E5E7EB",
  },
  previewBadge: {
    marginTop: rV(8),
    alignSelf: "flex-start",
    borderRadius: rMS(999),
    backgroundColor: "#EEF2FF",
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
  },
  previewBadgeText: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
  },
  removeImageButton: {
    marginTop: rV(8),
    alignSelf: "flex-start",
    borderRadius: rMS(999),
    backgroundColor: "#FEE2E2",
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
  },
  removeImageButtonLabel: {
    color: "#B91C1C",
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
  },
  errorText: {
    marginBottom: rV(10),
    color: "#B91C1C",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  primaryButton: {
    backgroundColor: AppColors.primary,
    borderRadius: rMS(999),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(16),
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  primaryButtonLabel: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(14),
  },
});
