import {
  ChevronLeft,
  CreditCard,
  Phone,
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
type PaymentType = "card" | "momo";
type MomoNetwork = "MTN" | "Telecel" | "AT";

interface PaymentMethod {
  id: string;
  type: PaymentType;
  label: string;
  isDefault?: boolean;

  // Card
  cardName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;

  // MoMo
  network?: MomoNetwork;
  phone?: string;
}

// ------------------
// Component
// ------------------
export default function WalletScreen() {
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<PaymentType>("card");

  const [form, setForm] = useState<Partial<PaymentMethod>>({});

  const resetForm = () => {
    setForm({});
    setType("card");
  };

  const handleSave = () => {
    if (type === "card") {
      const { cardName, cardNumber, expiry, cvv } = form;
      if (!cardName || !cardNumber || !expiry || !cvv) {
        Alert.alert("Missing fields", "Please fill all card details.");
        return;
      }
    }

    if (type === "momo") {
      const { network, phone } = form;
      if (!network || !phone) {
        Alert.alert("Missing fields", "Please complete MoMo details.");
        return;
      }
    }

    const newPayment: PaymentMethod = {
      id: Date.now().toString(),
      type,
      label:
        type === "card"
          ? `**** ${form.cardNumber?.slice(-4)}`
          : `${form.network} MoMo`,
      isDefault: payments.length === 0,
      ...form,
    };

    setPayments((prev) => [...prev, newPayment]);
    resetForm();
    setShowModal(false);
  };

  const setDefault = (id: string) => {
    setPayments((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })));
  };

  const handleDelete = (id: string) => {
    Alert.alert("Remove payment method?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setPayments((prev) => prev.filter((p) => p.id !== id)),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 pt-16 pb-4 flex-row items-center border-b border-gray-200">
        <ChevronLeft size={24} />
        <Text className="text-xl font-semibold ml-3">Wallet</Text>
      </View>

      {/* Empty State */}
      {payments.length === 0 && (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-6">
            <CreditCard size={40} color="#6B7280" />
          </View>
          <Text className="text-xl font-semibold mb-2">No payment methods</Text>
          <Text className="text-gray-500 text-center leading-6">
            Add a card or mobile money to make payments faster.
          </Text>
        </View>
      )}

      {/* List */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {payments.map((p) => (
          <View key={p.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                {p.type === "card" ? (
                  <CreditCard size={22} />
                ) : (
                  <Phone size={22} />
                )}
                <View>
                  <Text className="font-semibold text-base">{p.label}</Text>
                  <Text className="text-gray-600 text-sm">
                    {p.type === "card" ? "Debit / Credit Card" : p.network}
                  </Text>
                </View>
              </View>

              {p.isDefault && (
                <View className="bg-black px-3 py-1 rounded-full">
                  <Text className="text-white text-xs">Default</Text>
                </View>
              )}
            </View>

            <View className="flex-row mt-5 gap-2">
              {!p.isDefault && (
                <TouchableOpacity
                  onPress={() => setDefault(p.id)}
                  className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                >
                  <Star size={16} />
                  <Text className="text-xs font-semibold mt-1">
                    Set Default
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => handleDelete(p.id)}
                className="flex-1 bg-red-50 rounded-xl py-3 items-center"
              >
                <Trash2 size={16} color="#DC2626" />
                <Text className="text-xs font-semibold text-red-600 mt-1">
                  Remove
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

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide">
        <View className="flex-1 bg-white px-5 pt-14">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <X size={26} />
            </TouchableOpacity>
            <Text className="text-xl font-semibold ml-4">
              Add Payment Method
            </Text>
          </View>

          {/* Type Selector */}
          <View className="flex-row gap-3 mb-6">
            {["card", "momo"].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t as PaymentType)}
                className={`flex-1 py-4 rounded-xl items-center ${
                  type === t ? "bg-black" : "bg-gray-100"
                }`}
              >
                {t === "card" ? (
                  <CreditCard color={type === t ? "white" : "black"} />
                ) : (
                  <Phone color={type === t ? "white" : "black"} />
                )}
                <Text
                  className={`mt-2 font-semibold ${
                    type === t ? "text-white" : "text-black"
                  }`}
                >
                  {t === "card" ? "Card" : "MoMo"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Card Fields */}
          {type === "card" && (
            <>
              <TextInput
                placeholder="Cardholder Name"
                onChangeText={(t) => setForm({ ...form, cardName: t })}
                className="bg-gray-100 rounded-xl px-4 py-4 mb-4"
              />
              <TextInput
                placeholder="Card Number"
                keyboardType="number-pad"
                onChangeText={(t) => setForm({ ...form, cardNumber: t })}
                className="bg-gray-100 rounded-xl px-4 py-4 mb-4"
              />
              <View className="flex-row gap-3">
                <TextInput
                  placeholder="MM/YY"
                  onChangeText={(t) => setForm({ ...form, expiry: t })}
                  className="flex-1 bg-gray-100 rounded-xl px-4 py-4"
                />
                <TextInput
                  placeholder="CVV"
                  keyboardType="number-pad"
                  onChangeText={(t) => setForm({ ...form, cvv: t })}
                  className="flex-1 bg-gray-100 rounded-xl px-4 py-4"
                />
              </View>
            </>
          )}

          {/* MoMo Fields */}
          {type === "momo" && (
            <>
              <Text className="font-semibold mb-3">Select Network</Text>
              <View className="flex-row gap-3 mb-4">
                {["MTN", "Telecel", "AT"].map((n) => (
                  <TouchableOpacity
                    key={n}
                    onPress={() =>
                      setForm({ ...form, network: n as MomoNetwork })
                    }
                    className={`flex-1 py-4 rounded-xl items-center ${
                      form.network === n ? "bg-black" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        form.network === n ? "text-white" : "text-black"
                      }`}
                    >
                      {n}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Phone Number"
                keyboardType="phone-pad"
                onChangeText={(t) => setForm({ ...form, phone: t })}
                className="bg-gray-100 rounded-xl px-4 py-4"
              />
            </>
          )}

          <TouchableOpacity
            onPress={handleSave}
            className="bg-black py-4 rounded-full mt-8"
          >
            <Text className="text-white text-center font-semibold text-base">
              Save Payment Method
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
