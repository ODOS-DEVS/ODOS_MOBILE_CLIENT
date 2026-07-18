import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { PaymentMethod } from "@/context/ProfileContext";
import type { CustomerWallet } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import {
  buildWalletPaymentMethod,
  WALLET_CHECKOUT_PAYMENT_ID,
} from "@/utils/checkoutPayment";
import { OrderSelectableRow } from "@/components/orders/OrderUi";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CheckoutPaymentSectionProps = {
  wallet: CustomerWallet | null;
  paymentMethods: PaymentMethod[];
  selectedPaymentId: string | null;
  selectedPayment: PaymentMethod | null;
  orderTotal: number;
  onSelectWallet: () => void;
  onSelectMethod: (id: string) => void;
  onManagePayments: () => void;
};

function describePayment(method: PaymentMethod | null, wallet: CustomerWallet | null) {
  if (!method) {
    return {
      title: "Choose payment method",
      subtitle: "Wallet, card, or MoMo",
      icon: "card-outline" as const,
      tag: undefined as string | undefined,
    };
  }

  if (method.type === "wallet" || method.id === WALLET_CHECKOUT_PAYMENT_ID) {
    const balance = wallet?.available_balance ?? 0;
    return {
      title: "ODOS Wallet",
      subtitle: `Instant checkout · ₵${balance.toFixed(2)} available`,
      icon: "wallet-outline" as const,
      tag: "Wallet",
    };
  }

  if (method.type === "card") {
    return {
      title: method.label,
      subtitle: "Card payment",
      icon: "card-outline" as const,
      tag: "Card",
    };
  }

  return {
    title: method.label,
    subtitle: method.network ? `${method.network} MoMo` : "Mobile money",
    icon: "phone-portrait-outline" as const,
    tag: "MoMo",
  };
}

export default function CheckoutPaymentSection({
  wallet,
  paymentMethods,
  selectedPaymentId,
  selectedPayment,
  orderTotal,
  onSelectWallet: _onSelectWallet,
  onSelectMethod: _onSelectMethod,
  onManagePayments,
}: CheckoutPaymentSectionProps) {
  const { colors } = useTheme();
  const walletMethod = buildWalletPaymentMethod(wallet);
  const activePayment =
    selectedPayment ??
    (selectedPaymentId === WALLET_CHECKOUT_PAYMENT_ID ? walletMethod : null) ??
    paymentMethods.find((method) => method.id === selectedPaymentId) ??
    null;
  const copy = describePayment(activePayment, wallet);
  const walletInsufficient = Boolean(
    activePayment?.type === "wallet" && wallet && wallet.available_balance < orderTotal,
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          gap: rV(10),
        },
        note: {
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
          lineHeight: rMS(17),
          color: colors.warningText,
        },
        browseBtn: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(6),
          paddingVertical: rV(8),
        },
        browseText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.primary,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <OrderSelectableRow
        icon={copy.icon}
        tag={copy.tag}
        title={copy.title}
        subtitle={
          walletInsufficient
            ? `Balance ₵${wallet!.available_balance.toFixed(2)} · Need ₵${orderTotal.toFixed(2)}`
            : copy.subtitle
        }
        onPress={onManagePayments}
      />
      {walletInsufficient ? (
        <Text style={styles.note}>
          Top up your wallet or choose another payment method to continue.
        </Text>
      ) : null}
      <Pressable style={styles.browseBtn} onPress={onManagePayments}>
        <Ionicons name="swap-horizontal-outline" size={rMS(14)} color={colors.primary} />
        <Text style={styles.browseText}>
          {activePayment ? "Change payment method" : "Browse payment methods"}
        </Text>
      </Pressable>
    </View>
  );
}
