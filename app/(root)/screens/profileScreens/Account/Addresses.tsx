import ProfileHeader from "@/components/profile/ProfileHeader";
import { useProfile } from "@/context/ProfileContext";
import type { Address } from "@/context/ProfileContext";
import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "@/utils/navigation";
import {
  Edit2,
  MapPin,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const getParam = (p: string | string[] | undefined) =>
  Array.isArray(p) ? p[0] : p;

type AddressFieldErrors = Partial<
  Record<"label" | "fullName" | "phone" | "street" | "city" | "region", string>
>;

function validateAddressForm(form: Omit<Address, "id">): AddressFieldErrors {
  const errors: AddressFieldErrors = {};
  const phoneDigits = form.phone.replace(/\D/g, "");

  if (form.label && form.label.trim().length < 2) {
    errors.label = "Nickname should be at least 2 characters.";
  }
  if (!form.fullName.trim() || form.fullName.trim().length < 2) {
    errors.fullName = "Enter the full recipient name.";
  }
  if (phoneDigits.length < 10) {
    errors.phone = "Enter a valid phone number.";
  }
  if (!form.street.trim() || form.street.trim().length < 3) {
    errors.street = "Enter a delivery street address.";
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
    city: "",
    region: "",
    isDefault: false,
  });

  const resetForm = () => {
    setForm({
      label: "",
      fullName: "",
      phone: "",
      street: "",
      city: "",
      region: "",
      isDefault: false,
    });
    setEditingId(null);
    setFieldErrors({});
  };

  React.useEffect(() => {
    void refreshProfileData();
  }, [refreshProfileData]);

  const handleSave = async () => {
    const validationErrors = validateAddressForm(form);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        const newId = await addAddress(form);
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

  return (
    <View className="flex-1 bg-gray-100">
      <ProfileHeader
        title={fromCheckout ? "Choose Address" : "My Addresses"}
        fallbackHref={fromCheckout ? ("/(root)/(tabs)/cart" as any) : "/(root)/(tabs)/profile"}
      />

      {/* Empty State */}
      {!isSyncingProfileData && addresses.length === 0 && (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-6">
            <MapPin size={40} color="#6B7280" />
          </View>
          <Text className="text-xl font-semibold mb-2">No saved addresses</Text>
          <Text className="text-gray-500 text-center leading-6">
            Add a delivery address to make checkout faster and easier.
          </Text>
        </View>
      )}

      {/* Address List */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {addresses.map((a) => (
          <View key={a.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-3">
                {a.label ? (
                  <View className="self-start bg-gray-100 px-3 py-1 rounded-full mb-2">
                    <Text className="text-xs font-semibold text-gray-700">{a.label}</Text>
                  </View>
                ) : null}
                <Text className="font-semibold text-base">{a.fullName}</Text>
              </View>
              {a.isDefault && (
                <View className="bg-black px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-medium">Default</Text>
                </View>
              )}
            </View>

            <View className="mt-3 space-y-1">
              <Text className="text-gray-700">{a.street}</Text>
              <Text className="text-gray-600">
                {a.city}, {a.region}
              </Text>
              <Text className="text-gray-600">{a.phone}</Text>
            </View>

            <View className="flex-row mt-5 gap-2">
              {fromCheckout && (
                <TouchableOpacity
                  onPress={() => handleUseForCheckout(a.id)}
                  className="flex-1 bg-black rounded-xl py-3 items-center"
                >
                  <Text className="text-white text-sm font-semibold">
                    Use this address
                  </Text>
                </TouchableOpacity>
              )}
              {!fromCheckout && (
                <>
                  {!a.isDefault && (
                    <TouchableOpacity
                      onPress={() => setDefaultAddress(a.id)}
                      className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                    >
                      <Star size={16} />
                      <Text className="text-xs font-semibold mt-1">
                        Set Default
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      setForm(a);
                      setEditingId(a.id);
                      setShowModal(true);
                    }}
                    className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                  >
                    <Edit2 size={16} />
                    <Text className="text-xs font-semibold mt-1">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(a.id)}
                    className="flex-1 bg-red-50 rounded-xl py-3 items-center"
                  >
                    <Trash2 size={16} color="#DC2626" />
                    <Text className="text-xs font-semibold text-red-600 mt-1">
                      Delete
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={() => {
          resetForm();
          setShowModal(true);
        }}
        className="absolute bottom-24 right-8 bg-black w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Plus size={26} color="white" />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide">
        <View className="flex-1 bg-white px-5 pt-14">
          <View className="flex-row items-center mb-6 mt-10">
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                resetForm();
              }}
              className="w-10 h-10 rounded-full bg-black/10 items-center justify-center"
            >
              <X size={20} color="#111827" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold ml-4">
              {editingId ? "Edit Address" : "Add Address"}
            </Text>
          </View>

          <Text className="text-gray-500 mb-4">
            Save a nickname like Home or Office so checkout feels quicker next time.
          </Text>

          {[
            ["label", "Address Nickname (optional)"],
            ["fullName", "Full Name"],
            ["phone", "Phone Number"],
            ["street", "Street Address"],
            ["city", "City / Town"],
            ["region", "Region / State"],
          ].map(([key, placeholder]) => (
            <View key={key}>
              <TextInput
                placeholder={placeholder}
                value={form[key as keyof typeof form] as string}
                onChangeText={(t) => {
                  setForm({ ...form, [key]: t });
                  setFieldErrors((current) => ({ ...current, [key]: undefined }));
                }}
                keyboardType={key === "phone" ? "phone-pad" : "default"}
                autoCapitalize={key === "phone" ? "none" : "words"}
                className="bg-gray-100 rounded-xl px-4 py-4 mb-2 text-base"
              />
              {fieldErrors[key as keyof AddressFieldErrors] ? (
                <Text className="text-red-500 text-xs mb-3">
                  {fieldErrors[key as keyof AddressFieldErrors]}
                </Text>
              ) : (
                <View className="mb-2" />
              )}
            </View>
          ))}

          <TouchableOpacity
            onPress={handleSave}
            className="bg-black py-4 rounded-full mt-4"
            disabled={isSaving}
            style={{ opacity: isSaving ? 0.7 : 1 }}
          >
            <Text className="text-white text-center font-semibold text-base">
              {isSaving
                ? editingId
                  ? "Updating..."
                  : "Saving..."
                : editingId
                  ? "Update Address"
                  : "Save Address"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
