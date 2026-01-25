import {
  ChevronLeft,
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

// ------------------
// Types
// ------------------
interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  region: string;
  isDefault?: boolean;
}

// ------------------
// Component
// ------------------
export default function AddressScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
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
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...form } : a)),
      );
    } else {
      const newAddress: Address = {
        id: Date.now().toString(),
        ...form,
      };

      setAddresses((prev) =>
        form.isDefault
          ? prev
              .map((a) => ({ ...a, isDefault: false }))
              .concat({ ...newAddress, isDefault: true })
          : [...prev, newAddress],
      );
    }

    resetForm();
    setShowModal(false);
  };

  const setDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  // ✅ Native delete alert
  const handleDelete = (id: string) => {
    Alert.alert("Delete address?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setAddresses((prev) => prev.filter((a) => a.id !== id));
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 pt-16 pb-4 flex-row items-center border-b border-gray-200">
        <ChevronLeft size={24} />
        <Text className="text-xl font-semibold ml-3">My Addresses</Text>
      </View>

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
            {/* Name + Default */}
            <View className="flex-row justify-between items-start">
              <Text className="font-semibold text-base">{a.fullName}</Text>
              {a.isDefault && (
                <View className="bg-black px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-medium">
                    Default
                  </Text>
                </View>
              )}
            </View>

            {/* Address */}
            <View className="mt-3 space-y-1">
              <Text className="text-gray-700">{a.street}</Text>
              <Text className="text-gray-600">
                {a.city}, {a.region}
              </Text>
              <Text className="text-gray-600">{a.phone}</Text>
            </View>

            {/* Actions */}
            <View className="flex-row mt-5 gap-2">
              {!a.isDefault && (
                <TouchableOpacity
                  onPress={() => setDefault(a.id)}
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
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="absolute bottom-24 right-8 bg-black w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Plus size={26} color="white" />
      </TouchableOpacity>

      {/* Add / Edit Modal */}
      <Modal visible={showModal} animationType="slide">
        <View className="flex-1 bg-white px-5 pt-14">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => setShowModal(false)}>
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
