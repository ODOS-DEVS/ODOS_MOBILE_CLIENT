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
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import {
  useProfile,
  type MomoNetwork,
  type PaymentType,
} from "@/context/ProfileContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { formatPhoneInput, validateGhanaPhone } from "@/utils/phone";
import {
  createWalletTopupSessionRequest,
} from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "@/utils/navigation";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

const getParam = (p: string | string[] | undefined) =>
  Array.isArray(p) ? p[0] : p;

function normalizeRouteParamsFromUrl(url: string) {
  const parsed = Linking.parse(url);
  const queryParams = parsed.queryParams ?? {};
  const normalizedParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(queryParams)) {
    if (typeof value === "string" && value.length > 0) {
      normalizedParams[key] = value;
      continue;
    }
    if (Array.isArray(value) && value[0]) {
      normalizedParams[key] = String(value[0]);
    }
  }
  return normalizedParams;
}

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
  const accountStyles = useAccountStyles();
  const {
    paymentMethods,
    customerWallet,
    addPayment,
    isSyncingProfileData,
    refreshProfileData,
    removePayment,
    setDefaultPayment,
    setCheckoutPaymentId,
  } = useProfile();
  const { accessToken } = useAuth();
  const { showErrorToast, showInfoToast } = useToast();

  const params = useLocalSearchParams();
  const fromCheckout = getParam(params.fromCheckout) === "1";

  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"wallet" | "methods">(
    fromCheckout ? "methods" : "wallet",
  );
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [topupAmountInput, setTopupAmountInput] = useState<string>("50");
  const [topupPaymentType, setTopupPaymentType] = useState<"card" | "momo">("card");
  const [selectedTopupMethodId, setSelectedTopupMethodId] = useState<string | null>(null);
  const [type, setType] = useState<PaymentType>("card");
  const [form, setForm] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<WalletFieldErrors>({});
  const momoPhoneVerification = usePhoneVerification(form.phone ?? "", {
    linkToProfile: false,
  });

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
    if (type === "momo" && !momoPhoneVerification.isVerified) {
      validationErrors.phone = "Verify this MoMo number before saving.";
    }
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
  const walletTx = customerWallet?.recent_transactions ?? [];
  const topupMethods = paymentMethods.filter((method) => method.type === topupPaymentType);
  const selectedTopupMethod =
    topupMethods.find((method) => method.id === selectedTopupMethodId) ??
    topupMethods.find((method) => method.isDefault) ??
    topupMethods[0] ??
    null;

  useEffect(() => {
    const nextDefault = paymentMethods.find((method) => method.type === topupPaymentType);
    setSelectedTopupMethodId(nextDefault?.id ?? null);
  }, [paymentMethods, topupPaymentType]);

  const handleTopup = async () => {
    if (!accessToken) {
      showErrorToast("Please sign in to top up your wallet.");
      return;
    }
    setIsToppingUp(true);
    try {
      const parsedAmount = Number(topupAmountInput.replace(/[^\d.]/g, ""));
      const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
      if (amount < 1) {
        showErrorToast("Enter a valid top-up amount.");
        return;
      }
      const callbackUrl = Linking.createURL("/wallet/topup-return");
      if (!selectedTopupMethod) {
        showErrorToast(
          topupPaymentType === "card"
            ? "Add or choose a saved card to fund your wallet."
            : "Add or choose a saved MoMo wallet to fund your wallet.",
        );
        setActiveTab("methods");
        return;
      }
      const session = await createWalletTopupSessionRequest(accessToken, {
        amount,
        payment_type: topupPaymentType,
        payment_label: selectedTopupMethod.label,
        payment_network: selectedTopupMethod.network ?? null,
        payment_phone: selectedTopupMethod.phone ?? null,
        payment_last4: selectedTopupMethod.cardLast4 ?? null,
        callback_url: callbackUrl,
        cancel_url: callbackUrl,
      });
      showInfoToast("Opening secure top-up...");
      const checkoutResult = await WebBrowser.openAuthSessionAsync(
        session.authorization_url,
        callbackUrl,
      );
      if (checkoutResult.type === "success" && checkoutResult.url) {
        router.replace({
          pathname: "/wallet/topup-return" as any,
          params: normalizeRouteParamsFromUrl(checkoutResult.url),
        });
        return;
      }
      if (checkoutResult.type === "cancel" || checkoutResult.type === "dismiss") {
        router.replace({
          pathname: "/wallet/topup-return" as any,
          params: {
            reference: session.reference,
          },
        });
      }
    } catch (error) {
      const rawMessage =
        error instanceof Error && error.message
          ? error.message
          : "We couldn't complete this top-up.";
      const friendlyMessage = rawMessage.toLowerCase().includes("channels")
        ? "Your selected payment route couldn't be started. Please switch between Card and MoMo, then try again."
        : rawMessage;
      showErrorToast(
        friendlyMessage,
      );
    } finally {
      setIsToppingUp(false);
    }
  };

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader
        title={fromCheckout ? "Choose Payment" : "Payment Methods"}
        fallbackHref={fromCheckout ? ("/(root)/(tabs)/cart" as any) : "/(root)/(tabs)/profile"}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={accountStyles.content}
      >
        <View style={walletStyles.tabs}>
          <TouchableOpacity
            activeOpacity={0.86}
            style={[walletStyles.tabBtn, activeTab === "wallet" && walletStyles.tabBtnActive]}
            onPress={() => setActiveTab("wallet")}
          >
            <Text
              style={[walletStyles.tabText, activeTab === "wallet" && walletStyles.tabTextActive]}
            >
              In-App Wallet
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.86}
            style={[walletStyles.tabBtn, activeTab === "methods" && walletStyles.tabBtnActive]}
            onPress={() => setActiveTab("methods")}
          >
            <Text
              style={[walletStyles.tabText, activeTab === "methods" && walletStyles.tabTextActive]}
            >
              Payment Methods
          </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "wallet" ? (
          <>
            <AccountInsightCard
              title="In-app wallet"
              subtitle="Top up once and pay instantly at checkout. You can still use card and MoMo gateways anytime."
              stats={[
                {
                  value: `₵${(customerWallet?.available_balance ?? 0).toFixed(2)}`,
                  label: "Balance",
                },
                { value: walletTx.length, label: "Transactions" },
                { value: "GHS", label: "Currency" },
              ]}
            />
            <AccountActionRow>
              {[20, 50, 100, 200].map((amount) => (
                <AccountActionButton
                  key={amount}
                  label={`₵${amount}`}
                  icon={Number(topupAmountInput) === amount ? "checkmark-circle-outline" : undefined}
                  onPress={() => setTopupAmountInput(String(amount))}
                />
              ))}
            </AccountActionRow>
            <AccountListCard>
              <Text style={accountStyles.sectionTitle}>Custom amount</Text>
              <View style={walletStyles.amountInputWrap}>
                <Text style={walletStyles.amountPrefix}>₵</Text>
                <TextInput
                  keyboardType="decimal-pad"
                  value={topupAmountInput}
                  onChangeText={setTopupAmountInput}
                  placeholder="Enter amount"
                  placeholderTextColor="#94A3B8"
                  style={walletStyles.amountInput}
                />
              </View>
              <Text style={walletStyles.amountHint}>
                Choose your preferred funding method before continuing.
                  </Text>
              <View style={walletStyles.topupMethodRow}>
                {(["card", "momo"] as const).map((method) => {
                  const active = topupPaymentType === method;
                  return (
                    <TouchableOpacity
                      key={method}
                      activeOpacity={0.86}
                      onPress={() => {
                        setTopupPaymentType(method);
                        setSelectedTopupMethodId(null);
                      }}
                      style={[
                        walletStyles.topupMethodBtn,
                        active && walletStyles.topupMethodBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          walletStyles.topupMethodText,
                          active && walletStyles.topupMethodTextActive,
                        ]}
                      >
                        {method === "card" ? "Card" : "Mobile Money"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={walletStyles.savedTopupMethodsWrap}>
                <Text style={walletStyles.savedTopupMethodsLabel}>
                  Use saved {topupPaymentType === "card" ? "card" : "MoMo"} details
                </Text>
                {topupMethods.length === 0 ? (
                  <Text style={walletStyles.savedTopupMethodsEmpty}>
                    No saved {topupPaymentType === "card" ? "cards" : "MoMo wallets"} yet. Add one in
                    the Payment Methods tab.
                  </Text>
                ) : (
                  topupMethods.map((method) => {
                    const active = selectedTopupMethod?.id === method.id;
                    return (
                  <TouchableOpacity
                        key={method.id}
                        activeOpacity={0.85}
                        onPress={() => setSelectedTopupMethodId(method.id)}
                        style={[
                          walletStyles.savedTopupMethodRow,
                          active && walletStyles.savedTopupMethodRowActive,
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={walletStyles.savedTopupMethodTitle}>{method.label}</Text>
                          <Text style={walletStyles.savedTopupMethodMeta}>
                            {method.type === "card"
                              ? `Card • **** ${method.cardLast4 ?? "****"}`
                              : `${method.network ?? "MoMo"} • ${method.phone ?? "Saved number"}`}
                    </Text>
                        </View>
                        {active ? (
                          <Text style={walletStyles.savedTopupMethodBadge}>Selected</Text>
                        ) : null}
                  </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </AccountListCard>
            <AccountActionRow>
              <AccountActionButton
                label={
                  isToppingUp
                    ? "Funding..."
                    : `Top up wallet (${topupPaymentType === "card" ? "Card" : "MoMo"})`
                }
                variant="primary"
                icon="wallet-outline"
                onPress={() => void handleTopup()}
              />
            </AccountActionRow>

            <AccountListCard>
              <Text style={accountStyles.sectionTitle}>Recent wallet transactions</Text>
              {walletTx.length === 0 ? (
                <Text style={accountStyles.cardSubtitle}>No wallet transactions yet.</Text>
              ) : (
                walletTx.slice(0, 8).map((tx) => (
                  <View key={tx.id} style={walletStyles.txRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={walletStyles.txTitle}>{tx.title}</Text>
                      <Text style={walletStyles.txMeta}>
                        {new Date(tx.created_at).toLocaleString()}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={[
                          walletStyles.txAmount,
                          tx.amount >= 0 ? walletStyles.txAmountCredit : walletStyles.txAmountDebit,
                        ]}
                      >
                        {tx.amount >= 0 ? "+" : ""}₵{Math.abs(tx.amount).toFixed(2)}
                      </Text>
                      <Text style={walletStyles.txMeta}>
                        Bal: ₵{tx.balance_after.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </AccountListCard>
          </>
        ) : (
          <>
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
            ) : null}

            <AccountInsightCard
              title="Saved payment methods"
              subtitle="Cards and MoMo wallets stay here for checkout. Paystack handles the live charge when you place an order."
              stats={[
                { value: paymentMethods.length, label: "Saved" },
                { value: cardCount, label: "Cards" },
                { value: momoCount, label: "MoMo" },
              ]}
            />

            {fromCheckout && customerWallet ? (
              <AccountListCard>
                <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                  <AccountIconShell
                    icon="wallet-outline"
                    backgroundColor="#ECFDF5"
                    color="#059669"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={accountStyles.cardTitle}>ODOS Wallet</Text>
                    <Text style={accountStyles.cardSubtitle}>
                      Available balance: ₵{customerWallet.available_balance.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <AccountActionRow>
                  <AccountActionButton
                    label="Use wallet for checkout"
                    variant="primary"
                    onPress={() => handleUseForCheckout("wallet")}
                  />
                </AccountActionRow>
              </AccountListCard>
            ) : null}

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
          </>
        )}
      </ScrollView>

      {activeTab === "methods" ? (
        <AccountFab
        onPress={() => {
          resetForm();
          setShowModal(true);
        }}
        />
      ) : null}

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
              placeholder="0541234567"
                keyboardType="phone-pad"
                value={form.phone ?? ""}
              onChangeText={(value) => {
                setForm({ ...form, phone: formatPhoneInput(value) });
                  setFieldErrors((current) => ({ ...current, phone: undefined }));
                momoPhoneVerification.setVerificationError("");
              }}
              error={fieldErrors.phone}
            />
            {momoPhoneVerification.isVerified && momoPhoneVerification.normalizedPhone ? (
              <Text style={walletStyles.verifiedHint}>Number verified</Text>
            ) : null}
            {momoPhoneVerification.showVerificationPanel &&
            momoPhoneVerification.normalizedPhone ? (
              <PhoneVerificationPanel
                phoneNumber={momoPhoneVerification.normalizedPhone}
                codeSent={momoPhoneVerification.codeSent}
                isSendingCode={momoPhoneVerification.isSendingCode}
                isVerifying={momoPhoneVerification.isVerifying}
                error={momoPhoneVerification.verificationError}
                onDismissError={() => momoPhoneVerification.setVerificationError("")}
                onSendCode={async () => {
                  const result = await momoPhoneVerification.handleSendCode();
                  if (result.success) {
                    showInfoToast(result.message || "Verification code sent.");
                  }
                }}
                onVerify={async (code) => {
                  const result = await momoPhoneVerification.handleVerify(code);
                  if (result.success) {
                    showInfoToast("MoMo number verified.");
                  }
                }}
              />
              ) : null}
            </>
          )}
      </AccountFormSheet>
    </View>
  );
}

const walletStyles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: rMS(14),
    padding: rS(4),
    marginBottom: rV(12),
    gap: rS(4),
  },
  tabBtn: {
    flex: 1,
    minHeight: rV(40),
    borderRadius: rMS(10),
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnActive: {
    backgroundColor: AppColors.white,
  },
  tabText: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
    color: "#6B7280",
  },
  tabTextActive: {
    color: AppColors.text,
  },
  amountInputWrap: {
    borderWidth: 1,
    borderColor: "#D8E0EA",
    borderRadius: rMS(14),
    minHeight: rV(50),
    paddingHorizontal: rS(12),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  amountPrefix: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
    marginRight: rS(6),
  },
  amountInput: {
    flex: 1,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
  },
  amountHint: {
    marginTop: rV(8),
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#64748B",
  },
  topupMethodRow: {
    flexDirection: "row",
    gap: rS(8),
    marginTop: rV(10),
  },
  topupMethodBtn: {
    flex: 1,
    minHeight: rV(42),
    borderRadius: rMS(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  topupMethodBtnActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  topupMethodText: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
    color: AppColors.text,
  },
  topupMethodTextActive: {
    color: AppColors.white,
  },
  savedTopupMethodsWrap: {
    marginTop: rV(12),
  },
  savedTopupMethodsLabel: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
    color: AppColors.text,
    marginBottom: rV(8),
  },
  savedTopupMethodsEmpty: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#64748B",
  },
  savedTopupMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#CBD5E1",
    borderRadius: rMS(12),
    paddingHorizontal: rS(12),
    paddingVertical: rV(10),
    marginBottom: rV(8),
    backgroundColor: "#F8FAFC",
  },
  savedTopupMethodRowActive: {
    borderColor: AppColors.text,
    backgroundColor: "#F1F5F9",
  },
  savedTopupMethodTitle: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
    color: AppColors.text,
  },
  savedTopupMethodMeta: {
    marginTop: rV(2),
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#64748B",
  },
  savedTopupMethodBadge: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(10),
    color: AppColors.white,
    backgroundColor: AppColors.text,
    borderRadius: rMS(999),
    paddingHorizontal: rS(8),
    paddingVertical: rV(4),
  },
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
  verifiedHint: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
    color: "#15803D",
    marginTop: rV(-4),
  },
  error: {
    marginBottom: rV(10),
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#DC2626",
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: rV(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    gap: rS(12),
  },
  txTitle: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
    color: AppColors.text,
  },
  txMeta: {
    marginTop: rV(2),
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#6B7280",
  },
  txAmount: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
  txAmountCredit: {
    color: "#059669",
  },
  txAmountDebit: {
    color: "#B91C1C",
  },
});
