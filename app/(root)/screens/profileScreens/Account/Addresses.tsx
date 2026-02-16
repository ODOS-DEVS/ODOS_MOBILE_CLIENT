import ProfileHeader from "@/components/profile/ProfileHeader";
import { useProfile } from "@/context/ProfileContext";
import type { Address } from "@/context/ProfileContext";
import { router, useLocalSearchParams } from "expo-router";
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

export default function AddressScreen() {
  const {
    addresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    setCheckoutAddressId,
  } = useProfile();

  const params = useLocalSearchParams();
  const fromCheckout = getParam(params.fromCheckout) === "1";

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Address, "id">>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    region: "",
    isDefault: false,
  });

  const resetForm = () => {
    setForm({
      fullName: "",
      phone: "",
      street: "",
      city: "",
      region: "",
      isDefault: false,
    });
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.fullName || !form.phone || !form.street) {
      Alert.alert("Missing fields", "Please fill all required fields.");
      return;
    }
    if (editingId) {
      updateAddress(editingId, form);
    } else {
      const newId = addAddress(form);
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
      router.back();
      return;
    }
    resetForm();
    setShowModal(false);
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
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ProfileHeader title={fromCheckout ? "Choose Address" : "My Addresses"} />

      {/* Empty State */}
      {addresses.length === 0 && (
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
              <Text className="font-semibold text-base">{a.fullName}</Text>
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
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              <X size={26} />
            </TouchableOpacity>
            <Text className="text-xl font-semibold ml-4">
              {editingId ? "Edit Address" : "Add Address"}
            </Text>
          </View>

          {["fullName", "phone", "street", "city", "region"].map((key) => (
            <TextInput
              key={key}
              placeholder={key.replace(/^\w/, (c) => c.toUpperCase())}
              value={form[key as keyof typeof form] as string}
              onChangeText={(t) => setForm({ ...form, [key]: t })}
              className="bg-gray-100 rounded-xl px-4 py-4 mb-4 text-base"
            />
          ))}

          <TouchableOpacity
            onPress={handleSave}
            className="bg-black py-4 rounded-full mt-4"
          >
            <Text className="text-white text-center font-semibold text-base">
              {editingId ? "Update Address" : "Save Address"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
