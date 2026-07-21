import ScreenLoader from "@/components/loaders/ScreenLoader";
import {
  AccountEmptyState,
  AccountFab,
  AccountFormSheet,
  useAccountStyles,
} from "@/components/account/AccountUi";
import PhoneVerificationField, {
  isPhoneVerificationRequired,
} from "@/components/profile/PhoneVerificationField";
import ProfileHeader from "@/components/profile/ProfileHeader";
import CardEntryForm from "@/components/wallet/CardEntryForm";
import {
  PaymentMethodCard,
  PaymentMethodsSummary,
  WalletAmountChips,
  WalletCheckoutCard,
  WalletCustomAmountInput,
  WalletNetworkPicker,
  WalletPaymentHero,
  WalletPaymentTabs,
  WalletPaymentTypeToggle,
  WalletSavedMethodPicker,
  WalletSectionCard,
  WalletTopupButton,
  WalletTopupMethodToggle,
  WalletTransactionItem,
  type WalletTab,
} from "@/components/wallet/WalletPaymentUi";
import {
  useProfile,
  type MomoNetwork,
  type PaymentType,
} from "@/context/ProfileContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { formatPhoneInput } from "@/utils/phone";
import { createWalletTopupSessionRequest } from "@/hooks/useOrders";
import { validateCardForm, type CardFieldErrors } from "@/utils/cardPayment";
import { rV } from "@/styles/responsive";
import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "@/utils/navigation";
import { WALLET_CHECKOUT_PAYMENT_ID } from "@/utils/checkoutPayment";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
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

type WalletFieldErrors = CardFieldErrors &
  Partial<Record<"network" | "phone", string>>;

function validateWalletForm(
  type: PaymentType,
  form: Record<string, string>,
): WalletFieldErrors {
  if (type === "card") {
    return validateCardForm({
      cardName: form.cardName ?? "",
      cardNumber: form.cardNumber ?? "",
      expiry: form.expiry ?? "",
      cvv: form.cvv ?? "",
    });
  }

  const errors: WalletFieldErrors = {};
  const phoneDigits = (form.phone ?? "").replace(/\D/g, "");
  if (!form.network) {
    errors.network = "Choose a network.";
  }
  if (phoneDigits.length < 10) {
    errors.phone = "Enter a valid MoMo number.";
  }
  return errors;
}

export default function WalletScreen() {
  const accountStyles = useAccountStyles();
  const {
    paymentMethods,
    customerWallet,
    addPayment,
    isLoadingProfileData,
    removePayment,
    setDefaultPayment,
    setCheckoutPaymentId,
  } = useProfile();
  const { accessToken } = useAuth();
  const { showErrorToast, showInfoToast } = useToast();

  const params = useLocalSearchParams();
  const fromCheckout = getParam(params.fromCheckout) === "1";

  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<WalletTab>(
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
  const momoPhoneVerificationRequired =
    type === "momo" && isPhoneVerificationRequired(momoPhoneVerification);

  const resetForm = () => {
    setForm({});
    setType("card");
    setFieldErrors({});
  };

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
        const normalizedCardNumber = cardNumber.replace(/\D/g, "");
        const lastFour = normalizedCardNumber.slice(-4);
        savedPaymentId = await addPayment({
          type: "card",
          label: `**** ${lastFour}`,
          isDefault: paymentMethods.length === 0,
          cardName: cardName.trim(),
          cardNumber: normalizedCardNumber,
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
        goBackOr(router, { fallback: "/(root)/screens/Checkout" as any });
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
    setCheckoutPaymentId(id === "wallet" ? WALLET_CHECKOUT_PAYMENT_ID : id);
    goBackOr(router, { fallback: "/(root)/screens/Checkout" as any });
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

  const parsedTopupAmount = Number(topupAmountInput.replace(/[^\d.]/g, ""));

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
      const amount = Number.isFinite(parsedTopupAmount) ? parsedTopupAmount : 0;
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
      showErrorToast(friendlyMessage);
    } finally {
      setIsToppingUp(false);
    }
  };

  const screenTitle = fromCheckout ? "Choose Payment" : "Wallet & Payment";

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader
        title={screenTitle}
        fallbackHref={fromCheckout ? ("/(root)/screens/Checkout" as any) : "/(root)/(tabs)/profile"}
      />

      {isLoadingProfileData && (fromCheckout || activeTab === "methods") ? (
        <ScreenLoader label="Loading payment methods..." />
      ) : (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[accountStyles.content, { gap: rV(14) }]}
      >
        {!fromCheckout ? (
          <WalletPaymentTabs active={activeTab} onChange={setActiveTab} />
        ) : null}

        {activeTab === "wallet" && !fromCheckout ? (
          <>
            <WalletPaymentHero
              balance={customerWallet?.available_balance ?? 0}
              currency={customerWallet?.currency ?? "GHS"}
              lifetimeTopups={customerWallet?.lifetime_topups ?? 0}
              lifetimeSpend={customerWallet?.lifetime_spend ?? 0}
              transactionCount={walletTx.length}
            />

            <WalletSectionCard
              title="Top up wallet"
              subtitle="Add funds instantly and pay faster at checkout. Secure payments via Paystack."
            >
              <WalletAmountChips
                amounts={[20, 50, 100, 200]}
                selected={parsedTopupAmount}
                onSelect={(amount) => setTopupAmountInput(String(amount))}
              />
              <WalletCustomAmountInput
                value={topupAmountInput}
                onChangeText={setTopupAmountInput}
              />
              <WalletTopupMethodToggle
                value={topupPaymentType}
                onChange={(method) => {
                  setTopupPaymentType(method);
                  setSelectedTopupMethodId(null);
                }}
              />
              <WalletSavedMethodPicker
                methods={paymentMethods}
                paymentType={topupPaymentType}
                selectedId={selectedTopupMethod?.id ?? null}
                onSelect={setSelectedTopupMethodId}
                onAddMethod={() => {
                  setActiveTab("methods");
                  resetForm();
                  setShowModal(true);
                }}
              />
              <WalletTopupButton
                loading={isToppingUp}
                paymentType={topupPaymentType}
                onPress={() => void handleTopup()}
              />
            </WalletSectionCard>

            <WalletSectionCard
              title="Recent activity"
              subtitle={
                walletTx.length === 0
                  ? "Your top-ups and wallet payments will appear here."
                  : undefined
              }
            >
              {walletTx.length === 0 ? (
                <Text style={accountStyles.cardSubtitle}>No wallet transactions yet.</Text>
              ) : (
                walletTx.slice(0, 10).map((tx, index) => (
                  <WalletTransactionItem key={tx.id} tx={tx} index={index} />
                ))
              )}
            </WalletSectionCard>
          </>
        ) : (
          <>
            {paymentMethods.length === 0 ? (
              <AccountEmptyState
                icon="card-outline"
                title="No payment methods yet"
                message="Save a card or mobile money wallet for quicker checkout on ODOS."
                actionLabel="Add payment method"
                onAction={() => {
                  resetForm();
                  setShowModal(true);
                }}
              />
            ) : null}

            <PaymentMethodsSummary
              total={paymentMethods.length}
              cards={cardCount}
              momo={momoCount}
            />

            {fromCheckout && customerWallet ? (
              <WalletCheckoutCard
                balance={customerWallet.available_balance}
                onUse={() => handleUseForCheckout(WALLET_CHECKOUT_PAYMENT_ID)}
              />
            ) : null}

            {paymentMethods.map((payment, index) => (
              <PaymentMethodCard
                key={payment.id}
                payment={payment}
                fromCheckout={fromCheckout}
                index={index}
                onUse={fromCheckout ? () => handleUseForCheckout(payment.id) : undefined}
                onSetDefault={
                  !fromCheckout && !payment.isDefault
                    ? () => setDefaultPayment(payment.id)
                    : undefined
                }
                onRemove={!fromCheckout ? () => handleDelete(payment.id) : undefined}
              />
            ))}
          </>
        )}
      </ScrollView>
      )}

      {!isLoadingProfileData && (activeTab === "methods" || fromCheckout) ? (
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
        subtitle="Save a card or MoMo wallet for faster checkout and wallet top-ups."
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        onSave={() => void handleSave()}
        saveLabel="Save payment method"
        isSaving={isSaving}
        saveDisabled={momoPhoneVerificationRequired}
        saveDisabledLabel="Verify number to save"
      >
        <WalletPaymentTypeToggle
          type={type}
          onChange={(nextType) => {
            setType(nextType);
            setFieldErrors({});
          }}
        />

        {type === "card" ? (
          <CardEntryForm
            values={{
              cardName: form.cardName ?? "",
              cardNumber: form.cardNumber ?? "",
              expiry: form.expiry ?? "",
              cvv: form.cvv ?? "",
            }}
            errors={fieldErrors}
            onChange={(field, value) => {
              setForm((current) => ({ ...current, [field]: value }));
            }}
            onClearError={(field) => {
              setFieldErrors((current) => ({ ...current, [field]: undefined }));
            }}
          />
        ) : (
          <>
            <WalletNetworkPicker
              value={form.network}
              onChange={(network) => {
                setForm({ ...form, network });
                setFieldErrors((current) => ({ ...current, network: undefined }));
              }}
              error={fieldErrors.network}
            />
            <PhoneVerificationField
              label="MoMo number"
              value={form.phone ?? ""}
              onChangeText={(value) => {
                setForm({ ...form, phone: formatPhoneInput(value) });
                setFieldErrors((current) => ({ ...current, phone: undefined }));
              }}
              fieldError={fieldErrors.phone}
              verification={momoPhoneVerification}
              verifiedTitle="Verified"
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
          </>
        )}
      </AccountFormSheet>
    </View>
  );
}
