import StoreLocationPicker, {
  type StoreLocationValue,
} from "@/components/location/StoreLocationPicker";
import KeyboardAwareScreen from "@/components/layout/KeyboardAwareScreen";
import TextInputField from "@/components/TextInputField";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import {
  AccountActionButton,
  AccountSectionCard,
  VendorEmptyState,
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useToast } from "@/context/ToastContext";
import { useMarkets } from "@/hooks/useCommerce";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type { ManagedStoreUpdateInput } from "@/types/store";
import { getStoreLocationValidationError } from "@/utils/location";
import { pickCroppedImage } from "@/utils/imagePicker";
import { resolveImageSource } from "@/utils/media";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StoreErrors = Partial<Record<keyof ManagedStoreUpdateInput, string>>;

const STORE_AUDIENCE_OPTIONS = [
  { label: "Ladies", value: "ladies" },
  { label: "Gents", value: "gents" },
  { label: "Kids", value: "kids" },
  { label: "Beauty", value: "beauty" },
  { label: "Groceries", value: "groceries" },
  { label: "Automobile", value: "automobile" },
];

function validateStore(values: ManagedStoreUpdateInput) {
  const errors: StoreErrors = {};

  if (!values.name.trim()) {
    errors.name = "Enter the storefront name.";
  }
  if (values.description.trim().length < 12) {
    errors.description = "Add a short storefront description.";
  }
  if (!values.category.trim()) {
    errors.category = "Enter the storefront category.";
  }
  if (!values.region.trim()) {
    errors.region = "Enter the operating region.";
  }
  if (!values.city.trim()) {
    errors.city = "Enter the operating city.";
  }

  const locationError = getStoreLocationValidationError(
    values.location,
    values.latitude,
    values.longitude,
  );
  if (locationError) {
    errors.location = locationError;
  }

  return errors;
}

export default function VendorStoreScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { showToast } = useToast();
  const { markets: availableMarkets } = useMarkets();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const { error, fetchStoreProfile, isLoadingStore, isSavingStore, storeProfile, updateStoreProfile } =
    useStoreStore();

  const [form, setForm] = useState<ManagedStoreUpdateInput>({
    name: "",
    description: "",
    category: "",
    marketId: "",
    location: "",
    phone: "",
    latitude: null,
    longitude: null,
    instagramUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    twitterUrl: "",
    whatsappUrl: "",
    websiteUrl: "",
    region: "",
    city: "",
    bannerImage: "",
    logoImage: "",
    audienceSlugs: [],
  });
  const [fieldErrors, setFieldErrors] = useState<StoreErrors>({});

  useEffect(() => {
    if (!hasVendorAccess) {
      return;
    }

    void fetchStoreProfile(session);
  }, [fetchStoreProfile, hasVendorAccess, session]);

  useEffect(() => {
    if (!storeProfile) {
      return;
    }

    setForm({
      name: storeProfile.name,
      description: storeProfile.description,
      category: storeProfile.category,
      marketId: storeProfile.marketId ?? "",
      location: storeProfile.location ?? "",
      phone: storeProfile.phone ?? "",
      latitude: storeProfile.latitude ?? null,
      longitude: storeProfile.longitude ?? null,
      region: storeProfile.region,
      city: storeProfile.city,
      bannerImage: storeProfile.bannerImage ?? "",
      logoImage: storeProfile.logoImage ?? "",
      audienceSlugs: storeProfile.audienceSlugs ?? [],
    });
  }, [storeProfile]);

  const canShowForm = useMemo(() => Boolean(storeProfile), [storeProfile]);

  if (isCheckingVendorAccess || isLoadingStore) {
    return (
      <VendorScreenShell
        title="Store Profile"
        loading
        loadingLabel="Loading store profile..."
      />
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  const handleChange = <K extends keyof ManagedStoreUpdateInput>(
    key: K,
    value: ManagedStoreUpdateInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSave = async () => {
    const nextErrors = validateStore(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showToast("Please complete the required store fields.");
      return;
    }

    try {
      const socialLinks = normalizeStoreSocialLinks({
        instagramUrl: form.instagramUrl,
        facebookUrl: form.facebookUrl,
        tiktokUrl: form.tiktokUrl,
        twitterUrl: form.twitterUrl,
        whatsappUrl: form.whatsappUrl,
        websiteUrl: form.websiteUrl,
      });

      await updateStoreProfile(session, {
        ...form,
        instagramUrl: socialLinks.instagramUrl ?? "",
        facebookUrl: socialLinks.facebookUrl ?? "",
        tiktokUrl: socialLinks.tiktokUrl ?? "",
        twitterUrl: socialLinks.twitterUrl ?? "",
        whatsappUrl: socialLinks.whatsappUrl ?? "",
        websiteUrl: socialLinks.websiteUrl ?? "",
      });
      showToast("Store profile updated.");
    } catch (storeError) {
      showToast(
        storeError instanceof Error
          ? storeError.message
          : "We couldn't save your store details right now.",
      );
    }
  };

  const toggleAudience = (value: string) => {
    const current = form.audienceSlugs ?? [];
    const nextValues = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];

    handleChange("audienceSlugs", nextValues);
  };

  const handlePickImage = async (field: "logoImage" | "bannerImage") => {
    const result = await pickCroppedImage(undefined, 0.8);
    if (!result.granted) {
      showToast("Allow photo access to upload store images.");
      return;
    }
    if (result.canceled || !result.uri) {
      return;
    }
    handleChange(field, result.uri);
  };

  if (!canShowForm) {
    return (
      <VendorScreenShell title="Store Profile">
        <View style={styles.emptyWrap}>
          <VendorEmptyState
            icon="storefront-outline"
            title="No managed store found"
            message="The vendor profile is approved, but the store details haven't been linked yet. This will usually be created during approval."
          />
        </View>
      </VendorScreenShell>
    );
  }

  return (
    <VendorScreenShell title="Store Profile">
      <KeyboardAwareScreen
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          vendorStyles.content,
          { paddingBottom: insets.bottom + rV(36) },
        ]}
      >
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <VendorPageIntro
              title="Store profile"
              subtitle="Update the storefront details, visuals, and location shoppers see first."
            />
            <AccountSectionCard title="Customer-facing store details">
              <TextInputField
                label="Store Name *"
                icon="storefront-outline"
                placeholder="Your store name"
                value={form.name}
                onChangeText={(text) => handleChange("name", text)}
                errorMessage={fieldErrors.name}
              />
              <TextInputField
                label="Description *"
                icon="document-text-outline"
                placeholder="What shoppers should know about this store"
                value={form.description}
                onChangeText={(text) => handleChange("description", text)}
                errorMessage={fieldErrors.description}
                multiline
                numberOfLines={4}
              />
              <TextInputField
                label="Category *"
                icon="pricetag-outline"
                placeholder="e.g. Fashion & Accessories"
                value={form.category}
                onChangeText={(text) => handleChange("category", text)}
                errorMessage={fieldErrors.category}
              />
              <Text style={styles.fieldLabel}>Store audiences</Text>
              <Text style={styles.helperText}>
                Choose the shopper groups this store should appear under. You can
                select more than one.
              </Text>
              <View style={styles.chipsRow}>
                {STORE_AUDIENCE_OPTIONS.map((audience) => {
                  const isSelected = form.audienceSlugs?.includes(audience.value);
                  return (
                    <TouchableOpacity
                      key={audience.value}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => toggleAudience(audience.value)}
                      activeOpacity={0.82}
                    >
                      <Text
                        style={[
                          styles.chipLabel,
                          isSelected && styles.chipLabelSelected,
                        ]}
                      >
                        {audience.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TextInputField
                label="Region *"
                icon="map-outline"
                placeholder="e.g. Greater Accra"
                value={form.region}
                onChangeText={(text) => handleChange("region", text)}
                errorMessage={fieldErrors.region}
              />
              <TextInputField
                label="City *"
                icon="location-outline"
                placeholder="e.g. Accra"
                value={form.city}
                onChangeText={(text) => handleChange("city", text)}
                errorMessage={fieldErrors.city}
              />
              <TextInputField
                label="Store phone"
                icon="call-outline"
                placeholder="Number customers can call"
                value={form.phone ?? ""}
                onChangeText={(text) => handleChange("phone", text)}
                keyboardType="phone-pad"
              />
              <StoreLocationPicker
                value={{
                  address: form.location ?? "",
                  latitude: form.latitude ?? null,
                  longitude: form.longitude ?? null,
                }}
                onChange={(value: StoreLocationValue) => {
                  setForm((current) => ({
                    ...current,
                    location: value.address,
                    latitude: value.latitude,
                    longitude: value.longitude,
                  }));
                  setFieldErrors((current) => ({
                    ...current,
                    location: undefined,
                  }));
                }}
                errorMessage={fieldErrors.location}
                city={form.city}
                region={form.region}
              />
              <Text style={styles.fieldLabel}>Preferred Market</Text>
              <View style={styles.chipsRow}>
                {availableMarkets.map((market) => {
                  const isSelected = form.marketId === market.id;
                  return (
                    <TouchableOpacity
                      key={market.id}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => handleChange("marketId", market.id)}
                      activeOpacity={0.82}
                    >
                      <Text
                        style={[
                          styles.chipLabel,
                          isSelected && styles.chipLabelSelected,
                        ]}
                      >
                        {market.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </AccountSectionCard>

            <AccountSectionCard title="Store branding">
              <Text style={styles.helperText}>
                These images are shown on the customer side, so use a crisp logo and a banner that represents the storefront well.
              </Text>

              <View style={styles.uploadGrid}>
                {[
                  {
                    key: "logoImage" as const,
                    label: "Store Logo",
                    value: form.logoImage || storeProfile?.logoImage,
                    actionLabel: "Change Logo",
                  },
                  {
                    key: "bannerImage" as const,
                    label: "Store Banner",
                    value: form.bannerImage || storeProfile?.bannerImage,
                    actionLabel: "Change Banner",
                  },
                ].map((upload) => (
                  <View key={upload.key} style={styles.uploadCard}>
                    <Text style={styles.uploadTitle}>{upload.label}</Text>
                    <View style={styles.uploadPreview}>
                      <Image
                        source={resolveImageSource(upload.value, "bag")}
                        style={styles.uploadPreviewImage}
                        resizeMode="cover"
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => handlePickImage(upload.key)}
                      activeOpacity={0.82}
                    >
                      <Text style={styles.uploadButtonLabel}>{upload.actionLabel}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </AccountSectionCard>

            <AccountActionButton
              label={isSavingStore ? "Saving Store..." : "Save Store Profile"}
              variant="primary"
              onPress={handleSave}
              disabled={isSavingStore}
            />
          </View>
      </KeyboardAwareScreen>
    </VendorScreenShell>
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
  emptyWrap: {
    flex: 1,
    paddingHorizontal: rS(16),
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingTop: rV(18),
    paddingBottom: rV(6),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    marginBottom: rV(16),
  },
  sectionTitle: {
    marginBottom: rV(14),
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(15),
  },
  helperText: {
    marginBottom: rV(14),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
  },
  fieldLabel: {
    marginBottom: rV(10),
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
    paddingLeft: rS(8),
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    marginBottom: rV(12),
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
  errorText: {
    marginBottom: rV(10),
    color: "#B91C1C",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  uploadGrid: {
    gap: rV(12),
    marginBottom: rV(14),
  },
  uploadCard: {
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D7DEE7",
    padding: rS(12),
    backgroundColor: "#FAFBFC",
  },
  uploadTitle: {
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
    marginBottom: rV(10),
  },
  uploadPreview: {
    height: rV(132),
    borderRadius: rMS(16),
    overflow: "hidden",
    backgroundColor: "#E8EDF2",
    marginBottom: rV(10),
  },
  uploadPreviewImage: {
    width: "100%",
    height: "100%",
  },
  uploadButton: {
    borderRadius: rMS(999),
    backgroundColor: "#E9EEF5",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(12),
  },
  uploadButtonLabel: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
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
