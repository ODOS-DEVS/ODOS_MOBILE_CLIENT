import {
  AccountActionButton,
  AccountActionRow,
  AccountBadge,
  AccountChoiceOption,
  AccountChoiceSheet,
  AccountEmptyState,
  AccountFab,
  AccountFormField,
  AccountFormSheet,
  AccountInsightCard,
  AccountListCard,
  AccountIconShell,
  AccountPickerField,
  useAccountStyles,
} from "@/components/account/AccountUi";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import PhoneVerificationField, {
  isPhoneVerificationRequired,
} from "@/components/profile/PhoneVerificationField";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import {
  GHANA_REGIONS,
  getCitiesForRegion,
  matchGhanaRegion,
} from "@/utils/ghanaLocations";
import { formatPhoneInput, validateGhanaPhone } from "@/utils/phone";
import { looksLikeGhanaGpsCode, normalizeGhanaGpsCode } from "@/utils/location";
import type { Address } from "@/context/ProfileContext";
import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "@/utils/navigation";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

const getParam = (p: string | string[] | undefined) =>
  Array.isArray(p) ? p[0] : p;

type AddressFieldErrors = Partial<
  Record<"label" | "fullName" | "phone" | "street" | "gpsCode" | "city" | "region", string>
>;

function validateAddressForm(form: Omit<Address, "id">): AddressFieldErrors {
  const errors: AddressFieldErrors = {};

  if (form.label && form.label.trim().length < 2) {
    errors.label = "Nickname should be at least 2 characters.";
  }
  if (!form.fullName.trim() || form.fullName.trim().length < 2) {
    errors.fullName = "Enter the full recipient name.";
  }
  const phoneError = validateGhanaPhone(form.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }
  if (!form.street.trim() || form.street.trim().length < 3) {
    errors.street = "Enter a delivery street address.";
  }
  if (!form.gpsCode?.trim()) {
    errors.gpsCode = "Enter a GhanaPost GPS code.";
  } else if (!looksLikeGhanaGpsCode(form.gpsCode)) {
    errors.gpsCode = "Use a GhanaPost GPS code like GA-144-1234.";
  }
  if (!form.city.trim()) {
    errors.city = "Select your town or city.";
  }
  if (!form.region.trim()) {
    errors.region = "Select your region.";
  }

  return errors;
}

export default function AddressScreen() {
  const accountStyles = useAccountStyles();
  const {
    addresses,
    addAddress,
    isLoadingProfileData,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    setCheckoutAddressId,
  } = useProfile();
  const { showInfoToast } = useToast();

  const params = useLocalSearchParams();
  const fromCheckout = getParam(params.fromCheckout) === "1";

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AddressFieldErrors>({});
  const [form, setForm] = useState<Omit<Address, "id">>({
    label: "",
    fullName: "",
    phone: "",
    street: "",
    gpsCode: "",
    city: "",
    region: "",
    isDefault: false,
  });

  const editingAddress = editingId
    ? addresses.find((item) => item.id === editingId) ?? null
    : null;

  const addressPhoneVerification = usePhoneVerification(form.phone, {
    linkToProfile: false,
    treatAsVerifiedIf: editingAddress?.phone ?? null,
  });

  const cityOptions = useMemo(
    () => getCitiesForRegion(form.region, form.city),
    [form.region, form.city],
  );

  const resetForm = () => {
    setForm({
      label: "",
      fullName: "",
      phone: "",
      street: "",
      gpsCode: "",
      city: "",
      region: "",
      isDefault: false,
    });
    setEditingId(null);
    setFieldErrors({});
  };

  const openEditForm = (address: Address) => {
    setForm({
      ...address,
      region: matchGhanaRegion(address.region) ?? address.region,
    });
    setEditingId(address.id);
    setFieldErrors({});
    setShowModal(true);
  };

  const phoneVerificationRequired = isPhoneVerificationRequired(addressPhoneVerification);

  const handleSave = async () => {
    const validationErrors = validateAddressForm(form);
    if (!addressPhoneVerification.isVerified) {
      validationErrors.phone = "Verify this phone number before saving.";
    }
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        gpsCode: normalizeGhanaGpsCode(form.gpsCode ?? ""),
      };
      if (editingId) {
        await updateAddress(editingId, payload);
      } else {
        const newId = await addAddress(payload);
        if (fromCheckout && newId) {
          setCheckoutAddressId(newId);
        }
      }

      if (fromCheckout) {
        if (editingId) {
          setCheckoutAddressId(editingId);
        }
        resetForm();
        setShowModal(false);
        goBackOr(router, { fallback: "/(root)/(tabs)/cart" as any });
        return;
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      Alert.alert(
        "Couldn't save address",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete address?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeAddress(id),
      },
    ]);
  };

  const handleUseForCheckout = (id: string) => {
    setCheckoutAddressId(id);
    goBackOr(router, { fallback: "/(root)/(tabs)/cart" as any });
  };

  const defaultCount = addresses.filter((item) => item.isDefault).length;

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader
        title={fromCheckout ? "Choose Address" : "My Addresses"}
        fallbackHref={fromCheckout ? ("/(root)/(tabs)/cart" as any) : "/(root)/(tabs)/profile"}
      />

      {isLoadingProfileData ? (
        <ScreenLoader label="Loading addresses..." />
      ) : addresses.length === 0 ? (
        <AccountEmptyState
          icon="location-outline"
          title="No saved addresses"
          message="Add a delivery address so checkout is faster next time you order on ODOS."
          actionLabel="Add address"
          onAction={() => {
            resetForm();
            setShowModal(true);
          }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={accountStyles.content}
        >
          <AccountInsightCard
            title="Delivery addresses"
            subtitle="Save home, office, or pickup spots. Your default address is used first at checkout."
            stats={[
              { value: addresses.length, label: "Saved" },
              { value: defaultCount, label: "Default" },
              { value: fromCheckout ? "Checkout" : "Profile", label: "Mode" },
            ]}
          />

          {addresses.map((address) => (
            <AccountListCard key={address.id}>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                <AccountIconShell icon="location-outline" />
                <View style={{ flex: 1 }}>
                  <View style={accountStyles.cardHeader}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      {address.label ? (
                        <View style={[accountStyles.pill, { marginBottom: 6 }]}>
                          <Text style={accountStyles.pillText}>{address.label}</Text>
                        </View>
                      ) : null}
                      <Text style={accountStyles.cardTitle}>{address.fullName}</Text>
                      <Text style={accountStyles.cardSubtitle}>{address.phone}</Text>
                    </View>
                    {address.isDefault ? <AccountBadge label="Default" tone="dark" /> : null}
                  </View>

                  <View style={accountStyles.cardBody}>
                    <Text style={accountStyles.cardLine}>{address.street}</Text>
                    {address.gpsCode ? (
                      <Text style={[accountStyles.cardLine, { opacity: 0.72 }]}>
                        GPS: {address.gpsCode}
                      </Text>
                    ) : null}
                    <Text style={accountStyles.cardMuted}>
                      {address.city}, {address.region}
                    </Text>
                  </View>
                </View>
              </View>

              <AccountActionRow>
                {fromCheckout ? (
                  <AccountActionButton
                    label="Use this address"
                    variant="primary"
                    onPress={() => handleUseForCheckout(address.id)}
                  />
                ) : (
                  <>
                    {!address.isDefault ? (
                      <AccountActionButton
                        label="Set default"
                        icon="star-outline"
                        onPress={() => setDefaultAddress(address.id)}
                      />
                    ) : null}
                    <AccountActionButton
                      label="Edit"
                      icon="create-outline"
                      onPress={() => openEditForm(address)}
                    />
                    <AccountActionButton
                      label="Delete"
                      variant="danger"
                      icon="trash-outline"
                      onPress={() => handleDelete(address.id)}
                    />
                  </>
                )}
              </AccountActionRow>
            </AccountListCard>
          ))}
        </ScrollView>
      )}

      {!isLoadingProfileData ? (
        <AccountFab
          onPress={() => {
            resetForm();
            setShowModal(true);
          }}
        />
      ) : null}

      <AccountFormSheet
        visible={showModal}
        title={editingId ? "Edit address" : "Add address"}
        subtitle="Use a nickname like Home or Office so the right place is easy to spot at checkout."
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        onSave={() => void handleSave()}
        saveLabel={editingId ? "Update address" : "Save address"}
        isSaving={isSaving}
        saveDisabled={phoneVerificationRequired}
        saveDisabledLabel="Verify number to save"
      >
        <AccountFormField
          label="Address nickname (optional)"
          placeholder="e.g. Home, Office"
          value={form.label}
          onChangeText={(value) => {
            setForm({ ...form, label: value });
            setFieldErrors((current) => ({ ...current, label: undefined }));
          }}
          error={fieldErrors.label}
        />
        <AccountFormField
          label="Full name"
          placeholder="Recipient name"
          value={form.fullName}
          onChangeText={(value) => {
            setForm({ ...form, fullName: value });
            setFieldErrors((current) => ({ ...current, fullName: undefined }));
          }}
          error={fieldErrors.fullName}
        />
        <PhoneVerificationField
          value={form.phone}
          onChangeText={(value) => {
            setForm({ ...form, phone: formatPhoneInput(value) });
            setFieldErrors((current) => ({ ...current, phone: undefined }));
          }}
          fieldError={fieldErrors.phone}
          verification={addressPhoneVerification}
          verifiedTitle="Verified"
          onSendCode={async () => {
            const result = await addressPhoneVerification.handleSendCode();
            if (result.success) {
              showInfoToast(result.message || "Verification code sent.");
            }
          }}
          onVerify={async (code) => {
            const result = await addressPhoneVerification.handleVerify(code);
            if (result.success) {
              showInfoToast("Phone number verified.");
            }
          }}
        />
        <AccountFormField
          label="Street address"
          placeholder="House number and street"
          value={form.street}
          onChangeText={(value) => {
            setForm({ ...form, street: value });
            setFieldErrors((current) => ({ ...current, street: undefined }));
          }}
          error={fieldErrors.street}
        />
        <AccountFormField
          label="GhanaPost GPS"
          placeholder="e.g. GA-144-1234"
          value={form.gpsCode ?? ""}
          autoCapitalize="characters"
          onChangeText={(value) => {
            setForm({ ...form, gpsCode: value.toUpperCase() });
            setFieldErrors((current) => ({ ...current, gpsCode: undefined }));
          }}
          error={fieldErrors.gpsCode}
        />
        <AccountPickerField
          label="Region"
          value={form.region}
          placeholder="Select your region"
          icon="map-outline"
          error={fieldErrors.region}
          onPress={() => {
            setShowRegionPicker(true);
            setFieldErrors((current) => ({ ...current, region: undefined }));
          }}
          onClear={() => {
            setForm({ ...form, region: "", city: "" });
          }}
        />
        <AccountPickerField
          label="Town / city"
          value={form.city}
          placeholder={form.region ? "Select your town or city" : "Select a region first"}
          icon="business-outline"
          error={fieldErrors.city}
          onPress={() => {
            if (!form.region.trim()) {
              setFieldErrors((current) => ({
                ...current,
                region: "Select your region first.",
              }));
              return;
            }
            setShowCityPicker(true);
            setFieldErrors((current) => ({ ...current, city: undefined }));
          }}
          onClear={() => setForm({ ...form, city: "" })}
        />
      </AccountFormSheet>

      <AccountChoiceSheet
        visible={showRegionPicker}
        title="Select region"
        onClose={() => setShowRegionPicker(false)}
      >
        {GHANA_REGIONS.map((option) => (
          <AccountChoiceOption
            key={option}
            label={option}
            selected={form.region === option}
            onPress={() => {
              if (form.region !== option) {
                setForm({ ...form, region: option, city: "" });
              } else {
                setForm({ ...form, region: option });
              }
              setShowRegionPicker(false);
            }}
          />
        ))}
      </AccountChoiceSheet>

      <AccountChoiceSheet
        visible={showCityPicker}
        title={`Towns in ${form.region}`}
        onClose={() => setShowCityPicker(false)}
      >
        {cityOptions.map((option) => (
          <AccountChoiceOption
            key={option}
            label={option}
            selected={form.city === option}
            onPress={() => {
              setForm({ ...form, city: option });
              setShowCityPicker(false);
            }}
          />
        ))}
      </AccountChoiceSheet>
    </View>
  );
}
