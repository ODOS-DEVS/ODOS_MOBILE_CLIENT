import TextInputField from "@/components/TextInputField";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { StatusBadge } from "@/components/vendor/StatusBadge";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { vendorBusinessCategories } from "@/constants/vendor";
import { useToast } from "@/context/ToastContext";
import { useMarkets } from "@/hooks/useCommerce";
import { useVendorSession } from "@/hooks/useVendorSession";
import { useVendorStore } from "@/stores/vendorStore";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type { VendorApplicationInput } from "@/types/vendor";
import { pickCroppedImage } from "@/utils/imagePicker";
import { resolveImageSource } from "@/utils/media";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FormErrors = Partial<Record<keyof VendorApplicationInput, string>>;

const initialForm = (phoneNumber?: string | null): VendorApplicationInput => ({
  businessName: "",
  businessCategory: "",
  businessDescription: "",
  phoneNumber: phoneNumber ?? "",
  whatsappNumber: phoneNumber ?? "",
  region: "",
  city: "",
  marketId: "",
  storeLocation: "",
  storeName: "",
  storeDescription: "",
});

function validateForm(values: VendorApplicationInput) {
  const errors: FormErrors = {};

  if (!values.businessName.trim()) {
    errors.businessName = "Enter the registered or trading business name.";
  }
  if (!values.businessCategory.trim()) {
    errors.businessCategory = "Choose or enter a business category.";
  }
  if (values.businessDescription.trim().length < 20) {
    errors.businessDescription = "Describe the business in at least 20 characters.";
  }
  if (values.phoneNumber.replace(/\D/g, "").length < 10) {
    errors.phoneNumber = "Enter a valid phone number.";
  }
  if (!values.region.trim()) {
    errors.region = "Enter the operating region.";
  }
  if (!values.city.trim()) {
    errors.city = "Enter the operating city.";
  }
  if (!values.storeName.trim()) {
    errors.storeName = "Enter the store name customers will see.";
  }

  return errors;
}

export default function VendorApplyScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { showToast } = useToast();
  const { isHydrating, session, user } = useVendorSession();
  const { markets: availableMarkets } = useMarkets();
  const {
    error,
    isLoading,
    isSubmitting,
    refreshVendorState,
    submitVendorApplication,
    vendorApplication,
    vendorProfile,
    vendorStatus,
  } = useVendorStore();

  const [form, setForm] = useState<VendorApplicationInput>(initialForm(user?.phone_number));
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    if (!user) {
      router.replace("/(root)/(auth)/signin");
      return;
    }

    void refreshVendorState(session);
  }, [isHydrating, refreshVendorState, session, user]);

  useEffect(() => {
    if (user?.phone_number) {
      setForm((current) => ({
        ...current,
        phoneNumber: current.phoneNumber || user.phone_number || "",
        whatsappNumber: current.whatsappNumber || user.phone_number || "",
      }));
    }
  }, [user?.phone_number]);

  useEffect(() => {
    if (!vendorApplication || vendorStatus !== "rejected") {
      return;
    }

    setForm({
      businessName: vendorApplication.businessName,
      businessCategory: vendorApplication.businessCategory,
      businessDescription: vendorApplication.businessDescription,
      phoneNumber: vendorApplication.phoneNumber,
      whatsappNumber: vendorApplication.whatsappNumber ?? "",
      region: vendorApplication.region,
      city: vendorApplication.city,
      marketId: vendorApplication.marketId ?? "",
      storeLocation: vendorApplication.storeLocation ?? "",
      storeName: vendorApplication.storeName,
      storeDescription: vendorApplication.storeDescription ?? "",
      ghanaCardNumber: vendorApplication.ghanaCardNumber ?? "",
      businessRegistrationNumber:
        vendorApplication.businessRegistrationNumber ?? "",
      logoImage: vendorApplication.logoImage ?? "",
      bannerImage: vendorApplication.bannerImage ?? "",
      shopImage: vendorApplication.shopImage ?? "",
    });
  }, [vendorApplication, vendorStatus]);

  const titleCopy = useMemo(() => {
    if (vendorStatus === "approved") {
      return {
        headline: "Vendor access is already active",
        body: "Your ODOS account already has vendor access. You can go straight to your dashboard and manage your store.",
      };
    }

    if (vendorStatus === "pending" || vendorStatus === "under_review") {
      return {
        headline: "Application already submitted",
        body: "Your application is in the queue. You can check status updates any time without filling the form again.",
      };
    }

    if (vendorStatus === "suspended") {
      return {
        headline: "Vendor access is suspended",
        body: "This account was previously approved, but vendor access is currently paused. Review the status details before reapplying or contacting support.",
      };
    }

    if (vendorStatus === "rejected") {
      return {
        headline: "You can apply again",
        body: "Update your business details and resubmit when you're ready. Rejected applications stay visible on the status screen for reference.",
      };
    }

    return {
      headline: "Sell on ODOS",
      body: "Submit your business and store details once. Customers keep the same account, and approved vendors unlock store management in the same app.",
    };
  }, [vendorStatus]);

  const handleChange = <K extends keyof VendorApplicationInput>(
    key: K,
    value: VendorApplicationInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showToast("Please complete the required vendor details.");
      return;
    }

    try {
      await submitVendorApplication(session, {
        ...form,
        marketId: form.marketId?.trim() || undefined,
        storeLocation: form.storeLocation?.trim() || undefined,
        storeDescription: form.storeDescription?.trim() || undefined,
        whatsappNumber: form.whatsappNumber?.trim() || undefined,
      });
      showToast("Vendor application submitted.");
      router.replace("/vendor/application-status" as any);
    } catch (submitError) {
      showToast(
        submitError instanceof Error
          ? submitError.message
          : "We couldn't submit your application right now.",
      );
    }
  };

  const handlePickImage = async (
    field: "logoImage" | "bannerImage" | "shopImage",
  ) => {
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

  const topCard = (
    <View style={styles.heroCard}>
      <View style={styles.heroRow}>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>{titleCopy.headline}</Text>
          <Text style={styles.heroBody}>{titleCopy.body}</Text>
        </View>
        <StatusBadge status={vendorStatus} />
      </View>
      {(vendorApplication?.storeName || vendorProfile?.storeName) ? (
        <Text style={styles.heroMeta}>
          Store: {vendorApplication?.storeName || vendorProfile?.storeName}
        </Text>
      ) : null}
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
    </View>
  );

  if (isLoading && !vendorApplication && !vendorProfile && vendorStatus === "none") {
    return (
      <View style={styles.screen}>
        <ProfileHeader title="Become a Vendor" />
        <ScreenLoader label="Loading vendor details..." />
      </View>
    );
  }

  if (vendorStatus === "approved" || vendorStatus === "pending" || vendorStatus === "under_review" || vendorStatus === "suspended") {
    return (
      <View style={styles.screen}>
        <ProfileHeader title="Become a Vendor" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + rV(28) },
          ]}
        >
          <View style={[styles.contentWrap, { maxWidth: contentMaxWidth }]}>
            {topCard}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                router.push(
                  vendorStatus === "approved"
                    ? ("/vendor/dashboard" as any)
                    : ("/vendor/application-status" as any),
                )
              }
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonLabel}>
                {vendorStatus === "approved"
                  ? "Open Vendor Dashboard"
                  : "View Application Status"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Become a Vendor" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + rV(36) },
          ]}
        >
          <View style={[styles.contentWrap, { maxWidth: contentMaxWidth }]}>
            {topCard}

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Business information</Text>
              <TextInputField
                label="Business Name *"
                icon="business-outline"
                placeholder="e.g. Ama Fashion House"
                value={form.businessName}
                onChangeText={(text) => handleChange("businessName", text)}
                errorMessage={fieldErrors.businessName}
              />

              <Text style={styles.fieldLabel}>Business Category *</Text>
              <View style={styles.chipsRow}>
                {vendorBusinessCategories.map((category) => {
                  const isSelected = form.businessCategory === category;
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => handleChange("businessCategory", category)}
                      activeOpacity={0.82}
                    >
                      <Text
                        style={[
                          styles.chipLabel,
                          isSelected && styles.chipLabelSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {fieldErrors.businessCategory ? (
                <Text style={styles.fieldError}>{fieldErrors.businessCategory}</Text>
              ) : null}

              <TextInputField
                label="Business Description *"
                icon="document-text-outline"
                placeholder="Tell ODOS what you sell and how your store operates."
                value={form.businessDescription}
                onChangeText={(text) => handleChange("businessDescription", text)}
                errorMessage={fieldErrors.businessDescription}
                multiline
                numberOfLines={4}
              />

              <TextInputField
                label="Phone Number *"
                icon="call-outline"
                placeholder="Enter your business contact number"
                value={form.phoneNumber}
                onChangeText={(text) => handleChange("phoneNumber", text)}
                errorMessage={fieldErrors.phoneNumber}
                keyboardType="phone-pad"
              />

              <TextInputField
                label="WhatsApp Number"
                icon="logo-whatsapp"
                placeholder="Optional contact number for customers"
                value={form.whatsappNumber}
                onChangeText={(text) => handleChange("whatsappNumber", text)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Store setup</Text>
              <TextInputField
                label="Store Name *"
                icon="storefront-outline"
                placeholder="The name customers will see"
                value={form.storeName}
                onChangeText={(text) => handleChange("storeName", text)}
                errorMessage={fieldErrors.storeName}
              />

              <TextInputField
                label="Store Description"
                icon="albums-outline"
                placeholder="Optional storefront summary"
                value={form.storeDescription}
                onChangeText={(text) => handleChange("storeDescription", text)}
                multiline
                numberOfLines={3}
              />

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
                label="Store Location"
                icon="pin-outline"
                placeholder="Optional landmark or market row"
                value={form.storeLocation}
                onChangeText={(text) => handleChange("storeLocation", text)}
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
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Store visuals</Text>
              <Text style={styles.helperText}>
                Upload a clean store logo and banner so your storefront feels trustworthy from day one.
              </Text>

              <View style={styles.uploadGrid}>
                {[
                  {
                    key: "logoImage" as const,
                    label: "Store Logo",
                    actionLabel: "Upload Logo",
                    value: form.logoImage,
                  },
                  {
                    key: "bannerImage" as const,
                    label: "Store Banner",
                    actionLabel: "Upload Banner",
                    value: form.bannerImage,
                  },
                  {
                    key: "shopImage" as const,
                    label: "Shop Photo",
                    actionLabel: "Upload Shop Photo",
                    value: form.shopImage,
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
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonLabel}>
                {isSubmitting ? "Submitting..." : "Submit Vendor Application"}
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
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    marginBottom: rV(16),
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(12),
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
  },
  heroBody: {
    marginTop: rV(8),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
  },
  heroMeta: {
    marginTop: rV(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
  inlineError: {
    marginTop: rV(10),
    color: "#B91C1C",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  sectionCard: {
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
  fieldError: {
    marginTop: -rV(4),
    marginBottom: rV(12),
    paddingLeft: rS(8),
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
    marginBottom: rV(8),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonLabel: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(14),
  },
});
