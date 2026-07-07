import {
  AccountActionButton,
  AccountActionRow,
  AccountBadge,
  AccountEmptyState,
  AccountFab,
  AccountFormField,
  AccountFormSheet,
  AccountInsightCard,
  AccountListCard,
  AccountIconShell,
  useAccountStyles,
} from "@/components/account/AccountUi";
import PhoneVerificationPanel from "@/components/profile/PhoneVerificationPanel";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { formatPhoneInput, validateGhanaPhone } from "@/utils/phone";
import { looksLikeGhanaGpsCode, normalizeGhanaGpsCode } from "@/utils/location";
import type { Address } from "@/context/ProfileContext";
import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "@/utils/navigation";
import React, { useEffect, useState } from "react";
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
  if (form.gpsCode?.trim() && !looksLikeGhanaGpsCode(form.gpsCode)) {
    errors.gpsCode = "Use a GhanaPost GPS code like GA-144-1234.";
  }
  if (!form.city.trim() || form.city.trim().length < 2) {
    errors.city = "Enter the city or town.";
  }
  if (!form.region.trim() || form.region.trim().length < 2) {
    errors.region = "Enter the region or state.";
  }

  return errors;
}

export default function AddressScreen() {
  const accountStyles = useAccountStyles();
  const {
    addresses,
    addAddress,
    isSyncingProfileData,
    refreshProfileData,
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

  useEffect(() => {
    void refreshProfileData();
  }, [refreshProfileData]);

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
        gpsCode: form.gpsCode?.trim()
          ? normalizeGhanaGpsCode(form.gpsCode)
          : undefined,
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

      {!isSyncingProfileData && addresses.length === 0 ? (
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
                    onPress={() => {
                        setForm(address);
                        setEditingId(address.id);
                      setShowModal(true);
                    }}
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

      <AccountFab
        onPress={() => {
          resetForm();
          setShowModal(true);
        }}
      />

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
        <AccountFormField
          label="Phone number"
          placeholder="0541234567"
          value={form.phone}
          keyboardType="phone-pad"
          onChangeText={(value) => {
            setForm({ ...form, phone: formatPhoneInput(value) });
            setFieldErrors((current) => ({ ...current, phone: undefined }));
            addressPhoneVerification.setVerificationError("");
          }}
          error={fieldErrors.phone}
        />
        {addressPhoneVerification.isVerified && addressPhoneVerification.normalizedPhone ? (
          <Text style={{ fontSize: 12, color: "#15803D", marginTop: -4 }}>
            Number verified
          </Text>
        ) : null}
        {addressPhoneVerification.showVerificationPanel &&
        addressPhoneVerification.normalizedPhone ? (
          <PhoneVerificationPanel
            phoneNumber={addressPhoneVerification.normalizedPhone}
            codeSent={addressPhoneVerification.codeSent}
            isSendingCode={addressPhoneVerification.isSendingCode}
            isVerifying={addressPhoneVerification.isVerifying}
            error={addressPhoneVerification.verificationError}
            onDismissError={() => addressPhoneVerification.setVerificationError("")}
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
        ) : null}
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
          label="GhanaPost GPS (optional)"
          placeholder="e.g. GA-144-1234"
          value={form.gpsCode ?? ""}
          autoCapitalize="characters"
          onChangeText={(value) => {
            setForm({ ...form, gpsCode: value.toUpperCase() });
            setFieldErrors((current) => ({ ...current, gpsCode: undefined }));
          }}
          error={fieldErrors.gpsCode}
        />
        <AccountFormField
          label="City / town"
          placeholder="City"
          value={form.city}
          onChangeText={(value) => {
            setForm({ ...form, city: value });
            setFieldErrors((current) => ({ ...current, city: undefined }));
          }}
          error={fieldErrors.city}
        />
        <AccountFormField
          label="Region / state"
          placeholder="Region"
          value={form.region}
          onChangeText={(value) => {
            setForm({ ...form, region: value });
            setFieldErrors((current) => ({ ...current, region: undefined }));
          }}
          error={fieldErrors.region}
        />
      </AccountFormSheet>
    </View>
  );
}
