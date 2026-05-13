import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  useProfile,
  type MomoNetwork,
  type PaymentType,
} from "@/context/ProfileContext";
import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "@/utils/navigation";
import { CreditCard, Phone, Plus, Star, Trash2, X } from "lucide-react-native";
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

type WalletFieldErrors = Partial<
  Record<"cardName" | "cardNumber" | "expiry" | "cvv" | "network" | "phone", string>
>;

function validateWalletForm(
  type: PaymentType,
  form: Record<string, string>,
): WalletFieldErrors {
  const errors: WalletFieldErrors = {};

  if (type === "card") {
    const cardDigits = (form.cardNumber ?? "").replace(/\D/g, "");
    if (!form.cardName?.trim() || form.cardName.trim().length < 2) {
      errors.cardName = "Enter the cardholder name.";
    }
    if (cardDigits.length < 12 || cardDigits.length > 19) {
      errors.cardNumber = "Enter a valid card number.";
    }
    if (!/^\d{2}\/\d{2}$/.test(form.expiry ?? "")) {
      errors.expiry = "Use MM/YY format.";
    } else {
      const month = Number((form.expiry ?? "").slice(0, 2));
      if (month < 1 || month > 12) {
        errors.expiry = "Expiry month must be between 01 and 12.";
      }
    }
    if (!/^\d{3,4}$/.test(form.cvv ?? "")) {
      errors.cvv = "Enter a valid CVV.";
    }
  } else {
    const phoneDigits = (form.phone ?? "").replace(/\D/g, "");
    if (!form.network) {
      errors.network = "Choose a network.";
    }
    if (phoneDigits.length < 10) {
      errors.phone = "Enter a valid MoMo number.";
    }
  }

  return errors;
}

export default function WalletScreen() {
  const {
    paymentMethods,
    addPayment,
    isSyncingProfileData,
    refreshProfileData,
    removePayment,
    setDefaultPayment,
    setCheckoutPaymentId,
  } = useProfile();

  const params = useLocalSearchParams();
  const fromCheckout = getParam(params.fromCheckout) === "1";

  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<PaymentType>("card");
  const [form, setForm] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<WalletFieldErrors>({});

  const resetForm = () => {
    setForm({});
    setType("card");
    setFieldErrors({});
  };

  React.useEffect(() => {
    void refreshProfileData();
  }, [refreshProfileData]);

  const handleSave = async () => {
    let savedPaymentId: string | null = null;
    const validationErrors = validateWalletForm(type, form);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      if (type === "card") {
        const { cardName, cardNumber, expiry } = form;
        savedPaymentId = await addPayment({
          type: "card",
          label: `**** ${cardNumber.slice(-4)}`,
          isDefault: paymentMethods.length === 0,
          cardName,
          cardNumber,
          expiry,
        });
      } else {
        const { network, phone } = form;
        savedPaymentId = await addPayment({
          type: "momo",
          label: `${network} MoMo`,
          isDefault: paymentMethods.length === 0,
          network: network as MomoNetwork,
          phone,
        });
      }
      if (fromCheckout && savedPaymentId) {
        setCheckoutPaymentId(savedPaymentId);
        resetForm();
        setShowModal(false);
        goBackOr(router, { fallback: "/(root)/(tabs)/cart" as any });
        return;
      }
      resetForm();
      setShowModal(false);
    } catch (error) {
      Alert.alert(
        "Couldn't save payment method",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Remove payment method?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removePayment(id),
      },
    ]);
  };

  const handleUseForCheckout = (id: string) => {
    setCheckoutPaymentId(id);
    goBackOr(router, { fallback: "/(root)/(tabs)/cart" as any });
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ProfileHeader
        title={fromCheckout ? "Choose Payment" : "Wallet"}
        fallbackHref={fromCheckout ? ("/(root)/(tabs)/cart" as any) : "/(root)/(tabs)/profile"}
      />

      {!isSyncingProfileData && paymentMethods.length === 0 && (
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

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {paymentMethods.map((p) => (
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
              {fromCheckout && (
                <TouchableOpacity
                  onPress={() => handleUseForCheckout(p.id)}
                  className="flex-1 bg-black rounded-xl py-3 items-center"
                >
                  <Text className="text-white text-sm font-semibold">
                    Use this method
                  </Text>
                </TouchableOpacity>
              )}
              {!fromCheckout && (
                <>
                  {!p.isDefault && (
                    <TouchableOpacity
                      onPress={() => setDefaultPayment(p.id)}
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
              Add Payment Method
            </Text>
          </View>

          <View className="flex-row gap-3 mb-6">
            {(["card", "momo"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setType(t);
                  setFieldErrors({});
                }}
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

          {type === "card" && (
            <>
              <TextInput
                placeholder="Cardholder Name"
                value={form.cardName ?? ""}
                onChangeText={(t) => {
                  setForm({ ...form, cardName: t });
                  setFieldErrors((current) => ({ ...current, cardName: undefined }));
                }}
                className="bg-gray-100 rounded-xl px-4 py-4 mb-4"
              />
              {fieldErrors.cardName ? (
                <Text className="text-red-500 text-xs -mt-2 mb-3">{fieldErrors.cardName}</Text>
              ) : null}
              <TextInput
                placeholder="Card Number"
                keyboardType="number-pad"
                value={form.cardNumber ?? ""}
                onChangeText={(t) => {
                  setForm({ ...form, cardNumber: t });
                  setFieldErrors((current) => ({ ...current, cardNumber: undefined }));
                }}
                className="bg-gray-100 rounded-xl px-4 py-4 mb-4"
              />
              {fieldErrors.cardNumber ? (
                <Text className="text-red-500 text-xs -mt-2 mb-3">{fieldErrors.cardNumber}</Text>
              ) : null}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextInput
                    placeholder="MM/YY"
                    value={form.expiry ?? ""}
                    onChangeText={(t) => {
                      setForm({ ...form, expiry: t });
                      setFieldErrors((current) => ({ ...current, expiry: undefined }));
                    }}
                    className="bg-gray-100 rounded-xl px-4 py-4"
                  />
                  {fieldErrors.expiry ? (
                    <Text className="text-red-500 text-xs mt-2">{fieldErrors.expiry}</Text>
                  ) : null}
                </View>
                <View className="flex-1">
                  <TextInput
                    placeholder="CVV"
                    keyboardType="number-pad"
                    value={form.cvv ?? ""}
                    onChangeText={(t) => {
                      setForm({ ...form, cvv: t });
                      setFieldErrors((current) => ({ ...current, cvv: undefined }));
                    }}
                    className="bg-gray-100 rounded-xl px-4 py-4"
                  />
                  {fieldErrors.cvv ? (
                    <Text className="text-red-500 text-xs mt-2">{fieldErrors.cvv}</Text>
                  ) : null}
                </View>
              </View>
            </>
          )}

          {type === "momo" && (
            <>
              <Text className="font-semibold mb-3">Select Network</Text>
              <View className="flex-row gap-3 mb-4">
                {(["MTN", "Telecel", "AT"] as const).map((n) => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => {
                      setForm({ ...form, network: n });
                      setFieldErrors((current) => ({ ...current, network: undefined }));
                    }}
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
              {fieldErrors.network ? (
                <Text className="text-red-500 text-xs -mt-2 mb-3">{fieldErrors.network}</Text>
              ) : null}
              <TextInput
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={form.phone ?? ""}
                onChangeText={(t) => {
                  setForm({ ...form, phone: t });
                  setFieldErrors((current) => ({ ...current, phone: undefined }));
                }}
                className="bg-gray-100 rounded-xl px-4 py-4"
              />
              {fieldErrors.phone ? (
                <Text className="text-red-500 text-xs mt-2">{fieldErrors.phone}</Text>
              ) : null}
            </>
          )}

          <TouchableOpacity
            onPress={handleSave}
            className="bg-black py-4 rounded-full mt-8"
            disabled={isSaving}
            style={{ opacity: isSaving ? 0.7 : 1 }}
          >
            <Text className="text-white text-center font-semibold text-base">
              {isSaving ? "Saving..." : "Save Payment Method"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
