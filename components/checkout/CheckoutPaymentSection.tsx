import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { PaymentMethod } from "@/context/ProfileContext";
import type { CustomerWallet } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import {
  buildWalletPaymentMethod,
  WALLET_CHECKOUT_PAYMENT_ID,
} from "@/utils/checkoutPayment";
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

function PaymentOption({
  active,
  icon,
  title,
  subtitle,
  badge,
  disabled,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  badge?: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
          paddingHorizontal: rS(12),
          paddingVertical: rV(12),
          borderRadius: rMS(14),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.accentSoft : colors.card,
          opacity: disabled ? 0.55 : 1,
        },
        iconShell: {
          width: rMS(40),
          height: rMS(40),
          borderRadius: rMS(12),
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: active ? colors.primary : colors.surfaceMuted,
        },
        copy: {
          flex: 1,
          minWidth: 0,
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13.5),
          color: colors.text,
        },
        subtitle: {
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          color: colors.textMuted,
          marginTop: rV(2),
        },
        radio: {
          width: rMS(20),
          height: rMS(20),
          borderRadius: 999,
          borderWidth: 2,
          borderColor: active ? colors.primary : colors.border,
          alignItems: "center",
          justifyContent: "center",
        },
        radioInner: {
          width: rMS(10),
          height: rMS(10),
          borderRadius: 999,
          backgroundColor: colors.primary,
        },
        badge: {
          alignSelf: "flex-start",
          marginTop: rV(4),
          paddingHorizontal: rS(8),
          paddingVertical: rV(2),
          borderRadius: 999,
          backgroundColor: colors.warningSoft,
        },
        badgeText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10),
          color: colors.warningText,
        },
      }),
    [active, colors, disabled],
  );

  return (
    <Pressable style={styles.row} onPress={onPress} disabled={disabled}>
      <View style={styles.iconShell}>
        <Ionicons name={icon} size={rMS(18)} color={active ? "#FFFFFF" : colors.textMuted} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.radio}>{active ? <View style={styles.radioInner} /> : null}</View>
    </Pressable>
  );
}

export default function CheckoutPaymentSection({
  wallet,
  paymentMethods,
  selectedPaymentId,
  selectedPayment,
  orderTotal,
  onSelectWallet,
  onSelectMethod,
  onManagePayments,
}: CheckoutPaymentSectionProps) {
  const { colors } = useTheme();
  const walletMethod = buildWalletPaymentMethod(wallet);
  const walletActive =
    selectedPaymentId === WALLET_CHECKOUT_PAYMENT_ID || selectedPayment?.type === "wallet";
  const walletInsufficient = Boolean(wallet && wallet.available_balance < orderTotal);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          gap: rV(10),
        },
        manageBtn: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(6),
          paddingVertical: rV(10),
        },
        manageText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.primary,
        },
        note: {
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
          lineHeight: rMS(17),
          color: colors.textMuted,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      {walletMethod ? (
        <PaymentOption
          active={walletActive}
          icon="wallet-outline"
          title="ODOS Wallet"
          subtitle={
            walletInsufficient
              ? `Balance ₵${wallet!.available_balance.toFixed(2)} · Need ₵${orderTotal.toFixed(2)}`
              : `Instant checkout · ₵${wallet!.available_balance.toFixed(2)} available`
          }
          badge={walletInsufficient ? "Top up or choose another method" : "No Paystack redirect"}
          disabled={walletInsufficient}
          onPress={onSelectWallet}
        />
      ) : null}

      {paymentMethods.map((method) => {
        const active = selectedPaymentId === method.id;
        return (
          <PaymentOption
            key={method.id}
            active={active}
            icon={method.type === "card" ? "card-outline" : "phone-portrait-outline"}
            title={method.label}
            subtitle={
              method.type === "card"
                ? "Pay securely via Paystack"
                : `${method.network ?? "MoMo"} · Paystack checkout`
            }
            onPress={() => onSelectMethod(method.id)}
          />
        );
      })}

      {paymentMethods.length === 0 && !walletMethod ? (
        <Text style={styles.note}>Add a card or MoMo wallet, or top up your ODOS wallet.</Text>
      ) : null}

      <Pressable style={styles.manageBtn} onPress={onManagePayments}>
        <Ionicons name="settings-outline" size={rMS(14)} color={colors.primary} />
        <Text style={styles.manageText}>Manage wallet & payment methods</Text>
      </Pressable>
    </View>
  );
}
