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
  accountStyles,
} from "@/components/account/AccountUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import {
  useProfile,
  type MomoNetwork,
  type PaymentType,
} from "@/context/ProfileContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "@/utils/navigation";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

  useEffect(() => {
    void refreshProfileData();
  }, [refreshProfileData]);

  const handleSave = async () => {
    const validationErrors = validateWalletForm(type, form);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      let savedPaymentId: string | null = null;
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

  const cardCount = paymentMethods.filter((item) => item.type === "card").length;
  const momoCount = paymentMethods.filter((item) => item.type === "momo").length;

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader
        title={fromCheckout ? "Choose Payment" : "Payment Methods"}
        fallbackHref={fromCheckout ? ("/(root)/(tabs)/cart" as any) : "/(root)/(tabs)/profile"}
      />

      {!isSyncingProfileData && paymentMethods.length === 0 ? (
        <AccountEmptyState
          icon="card-outline"
          title="No payment methods"
          message="Save a card or mobile money wallet for quicker checkout on ODOS."
          actionLabel="Add payment method"
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
            title="Saved payment methods"
            subtitle="Cards and MoMo wallets stay here for checkout. Paystack handles the live charge when you place an order."
            stats={[
              { value: paymentMethods.length, label: "Saved" },
              { value: cardCount, label: "Cards" },
              { value: momoCount, label: "MoMo" },
            ]}
          />

          {paymentMethods.map((payment) => (
            <AccountListCard key={payment.id}>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <AccountIconShell
                  icon={payment.type === "card" ? "card-outline" : "phone-portrait-outline"}
                  backgroundColor={payment.type === "card" ? "#EEF2FF" : "#ECFDF5"}
                  color={payment.type === "card" ? "#4F46E5" : "#059669"}
                />
                <View style={{ flex: 1 }}>
                  <View style={accountStyles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={accountStyles.cardTitle}>{payment.label}</Text>
                      <Text style={accountStyles.cardSubtitle}>
                        {payment.type === "card"
                          ? "Debit / credit card"
                          : `${payment.network ?? "Mobile"} money`}
                      </Text>
                    </View>
                    {payment.isDefault ? <AccountBadge label="Default" tone="dark" /> : null}
                  </View>
                </View>
              </View>

              <AccountActionRow>
                {fromCheckout ? (
                  <AccountActionButton
                    label="Use this method"
                    variant="primary"
                    onPress={() => handleUseForCheckout(payment.id)}
                  />
                ) : (
                  <>
                    {!payment.isDefault ? (
                      <AccountActionButton
                        label="Set default"
                        icon="star-outline"
                        onPress={() => setDefaultPayment(payment.id)}
                      />
                    ) : null}
                    <AccountActionButton
                      label="Remove"
                      variant="danger"
                      icon="trash-outline"
                      onPress={() => handleDelete(payment.id)}
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
        title="Add payment method"
        subtitle="Choose card or mobile money. Details are stored for faster checkout."
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        onSave={() => void handleSave()}
        saveLabel="Save payment method"
        isSaving={isSaving}
      >
        <View style={walletStyles.typeRow}>
          {(["card", "momo"] as const).map((option) => {
            const active = type === option;
            return (
              <TouchableOpacity
                key={option}
                style={[walletStyles.typeBtn, active && walletStyles.typeBtnActive]}
                onPress={() => {
                  setType(option);
                  setFieldErrors({});
                }}
                activeOpacity={0.88}
              >
                <Text style={[walletStyles.typeText, active && walletStyles.typeTextActive]}>
                  {option === "card" ? "Card" : "MoMo"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {type === "card" ? (
          <>
            <AccountFormField
              label="Cardholder name"
              placeholder="Name on card"
              value={form.cardName ?? ""}
              onChangeText={(value) => {
                setForm({ ...form, cardName: value });
                setFieldErrors((current) => ({ ...current, cardName: undefined }));
              }}
              error={fieldErrors.cardName}
            />
            <AccountFormField
              label="Card number"
              placeholder="0000 0000 0000 0000"
              keyboardType="number-pad"
              value={form.cardNumber ?? ""}
              onChangeText={(value) => {
                setForm({ ...form, cardNumber: value });
                setFieldErrors((current) => ({ ...current, cardNumber: undefined }));
              }}
              error={fieldErrors.cardNumber}
            />
            <View style={walletStyles.splitRow}>
              <View style={{ flex: 1 }}>
                <AccountFormField
                  label="Expiry"
                  placeholder="MM/YY"
                  value={form.expiry ?? ""}
                  onChangeText={(value) => {
                    setForm({ ...form, expiry: value });
                    setFieldErrors((current) => ({ ...current, expiry: undefined }));
                  }}
                  error={fieldErrors.expiry}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AccountFormField
                  label="CVV"
                  placeholder="123"
                  keyboardType="number-pad"
                  value={form.cvv ?? ""}
                  onChangeText={(value) => {
                    setForm({ ...form, cvv: value });
                    setFieldErrors((current) => ({ ...current, cvv: undefined }));
                  }}
                  error={fieldErrors.cvv}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={walletStyles.networkLabel}>Mobile network</Text>
            <View style={walletStyles.networkRow}>
              {(["MTN", "Telecel", "AT"] as const).map((network) => {
                const active = form.network === network;
                return (
                  <TouchableOpacity
                    key={network}
                    style={[walletStyles.networkBtn, active && walletStyles.networkBtnActive]}
                    onPress={() => {
                      setForm({ ...form, network });
                      setFieldErrors((current) => ({ ...current, network: undefined }));
                    }}
                    activeOpacity={0.88}
                  >
                    <Text
                      style={[walletStyles.networkText, active && walletStyles.networkTextActive]}
                    >
                      {network}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {fieldErrors.network ? (
              <Text style={walletStyles.error}>{fieldErrors.network}</Text>
            ) : null}
            <AccountFormField
              label="MoMo number"
              placeholder="Phone number"
              keyboardType="phone-pad"
              value={form.phone ?? ""}
              onChangeText={(value) => {
                setForm({ ...form, phone: value });
                setFieldErrors((current) => ({ ...current, phone: undefined }));
              }}
              error={fieldErrors.phone}
            />
          </>
        )}
      </AccountFormSheet>
    </View>
  );
}

const walletStyles = StyleSheet.create({
  typeRow: {
    flexDirection: "row",
    gap: rS(8),
    marginBottom: rV(14),
  },
  typeBtn: {
    flex: 1,
    minHeight: rV(44),
    borderRadius: rMS(14),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  typeBtnActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  typeText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: AppColors.text,
  },
  typeTextActive: {
    color: "#FFFFFF",
  },
  splitRow: {
    flexDirection: "row",
    gap: rS(10),
  },
  networkLabel: {
    marginBottom: rV(8),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: "#4B5563",
  },
  networkRow: {
    flexDirection: "row",
    gap: rS(8),
    marginBottom: rV(8),
  },
  networkBtn: {
    flex: 1,
    minHeight: rV(42),
    borderRadius: rMS(12),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  networkBtnActive: {
    backgroundColor: AppColors.text,
  },
  networkText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: AppColors.text,
  },
  networkTextActive: {
    color: "#FFFFFF",
  },
  error: {
    marginBottom: rV(10),
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#DC2626",
  },
});
