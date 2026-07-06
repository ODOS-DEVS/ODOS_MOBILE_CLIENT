import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { PaymentMethod, PaymentType } from "@/context/ProfileContext";
import type { WalletTransaction } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Reanimated, { FadeInDown, FadeInRight } from "react-native-reanimated";

export type WalletTab = "wallet" | "methods";

type WalletPaymentHeroProps = {
  balance: number;
  currency: string;
  lifetimeTopups: number;
  lifetimeSpend: number;
  transactionCount: number;
};

export function WalletPaymentHero({
  balance,
  currency,
  lifetimeTopups,
  lifetimeSpend,
  transactionCount,
}: WalletPaymentHeroProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: rMS(22),
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        inner: {
          paddingHorizontal: rS(18),
          paddingVertical: rV(18),
          gap: rV(14),
        },
        topRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
        },
        iconWrap: {
          width: rMS(44),
          height: rMS(44),
          borderRadius: rMS(14),
          backgroundColor: "rgba(255,255,255,0.88)",
          alignItems: "center",
          justifyContent: "center",
        },
        copy: {
          flex: 1,
        },
        label: {
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          color: colors.textMuted,
        },
        balance: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(28),
          color: colors.text,
          marginTop: rV(2),
        },
        currency: {
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          color: colors.textMuted,
        },
        statsRow: {
          flexDirection: "row",
          gap: rS(8),
        },
        stat: {
          flex: 1,
          backgroundColor: "rgba(255,255,255,0.78)",
          borderRadius: rMS(14),
          paddingVertical: rV(10),
          paddingHorizontal: rS(8),
          alignItems: "center",
        },
        statValue: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.text,
        },
        statLabel: {
          fontFamily: Fonts.text,
          fontSize: rMS(10),
          color: colors.textMuted,
          marginTop: rV(2),
          textAlign: "center",
        },
      }),
    [colors],
  );

  const formatMoney = (value: number) =>
    `${currency === "GHS" ? "₵" : currency}${value.toFixed(2)}`;

  return (
    <Reanimated.View entering={FadeInDown.duration(300)} style={styles.wrap}>
      <LinearGradient
        colors={[colors.accentSoft, "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inner}
      >
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="wallet" size={rMS(22)} color={colors.primary} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.label}>Available balance</Text>
            <Text style={styles.balance}>{formatMoney(balance)}</Text>
            <Text style={styles.currency}>ODOS in-app wallet · {currency}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatMoney(lifetimeTopups)}</Text>
            <Text style={styles.statLabel}>Top-ups</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatMoney(lifetimeSpend)}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{transactionCount}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>
      </LinearGradient>
    </Reanimated.View>
  );
}

type WalletPaymentTabsProps = {
  active: WalletTab;
  onChange: (tab: WalletTab) => void;
};

export function WalletPaymentTabs({ active, onChange }: WalletPaymentTabsProps) {
  const { colors } = useTheme();
  const tabs: { key: WalletTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "wallet", label: "Wallet", icon: "wallet-outline" },
    { key: "methods", label: "Payment", icon: "card-outline" },
  ];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          gap: rS(8),
        },
        tab: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(6),
          paddingVertical: rV(11),
          borderRadius: rMS(14),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        tabActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        tabText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.textSecondary,
        },
        tabTextActive: {
          color: "#FFFFFF",
        },
      }),
    [colors],
  );

  return (
    <Reanimated.View entering={FadeInDown.delay(60).duration(260)} style={styles.row}>
      {tabs.map((tab, index) => {
        const isActive = active === tab.key;
        return (
          <Reanimated.View
            key={tab.key}
            entering={FadeInRight.delay(index * 50).duration(220)}
            style={{ flex: 1 }}
          >
            <Pressable
              style={[styles.tab, isActive ? styles.tabActive : null]}
              onPress={() => onChange(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={rMS(16)}
                color={isActive ? "#FFFFFF" : colors.textMuted}
              />
              <Text style={[styles.tabText, isActive ? styles.tabTextActive : null]}>
                {tab.label}
              </Text>
            </Pressable>
          </Reanimated.View>
        );
      })}
    </Reanimated.View>
  );
}

type WalletAmountChipsProps = {
  amounts: number[];
  selected: number;
  onSelect: (amount: number) => void;
};

export function WalletAmountChips({ amounts, selected, onSelect }: WalletAmountChipsProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: rS(8),
        },
        chip: {
          paddingHorizontal: rS(14),
          paddingVertical: rV(10),
          borderRadius: rMS(14),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        chipActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        chipText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.text,
        },
        chipTextActive: {
          color: "#FFFFFF",
        },
      }),
    [colors],
  );

  return (
    <View style={styles.row}>
      {amounts.map((amount) => {
        const active = selected === amount;
        return (
          <Pressable
            key={amount}
            style={[styles.chip, active ? styles.chipActive : null]}
            onPress={() => onSelect(amount)}
          >
            <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
              ₵{amount}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type WalletTopupMethodToggleProps = {
  value: "card" | "momo";
  onChange: (value: "card" | "momo") => void;
};

export function WalletTopupMethodToggle({ value, onChange }: WalletTopupMethodToggleProps) {
  const { colors } = useTheme();
  const options: { key: "card" | "momo"; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "card", label: "Card", icon: "card-outline" },
    { key: "momo", label: "Mobile Money", icon: "phone-portrait-outline" },
  ];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          gap: rS(8),
        },
        btn: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(6),
          paddingVertical: rV(11),
          borderRadius: rMS(14),
          backgroundColor: colors.surfaceMuted,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        btnActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        text: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.text,
        },
        textActive: {
          color: "#FFFFFF",
        },
      }),
    [colors],
  );

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = value === option.key;
        return (
          <Pressable
            key={option.key}
            style={[styles.btn, active ? styles.btnActive : null]}
            onPress={() => onChange(option.key)}
          >
            <Ionicons
              name={option.icon}
              size={rMS(15)}
              color={active ? "#FFFFFF" : colors.textMuted}
            />
            <Text style={[styles.text, active ? styles.textActive : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type WalletCustomAmountInputProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function WalletCustomAmountInput({ value, onChangeText }: WalletCustomAmountInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
          backgroundColor: colors.card,
          borderRadius: rMS(16),
          paddingHorizontal: rS(14),
          paddingVertical: rV(12),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        prefix: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(18),
          color: colors.primary,
        },
        input: {
          flex: 1,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(18),
          color: colors.text,
          padding: 0,
        },
        hint: {
          marginTop: rV(6),
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.textMuted,
        },
      }),
    [colors],
  );

  return (
    <View>
      <View style={styles.wrap}>
        <Text style={styles.prefix}>₵</Text>
        <TextInput
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onChangeText}
          placeholder="0.00"
          placeholderTextColor={colors.placeholder}
          style={styles.input}
        />
      </View>
      <Text style={styles.hint}>Enter any amount — minimum ₵1</Text>
    </View>
  );
}

type WalletSavedMethodPickerProps = {
  methods: PaymentMethod[];
  paymentType: "card" | "momo";
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddMethod: () => void;
};

export function WalletSavedMethodPicker({
  methods,
  paymentType,
  selectedId,
  onSelect,
  onAddMethod,
}: WalletSavedMethodPickerProps) {
  const { colors } = useTheme();
  const filtered = methods.filter((m) => m.type === paymentType);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        label: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.text,
          marginBottom: rV(8),
        },
        empty: {
          padding: rS(14),
          borderRadius: rMS(14),
          backgroundColor: colors.surfaceMuted,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          gap: rV(8),
        },
        emptyText: {
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          lineHeight: rMS(18),
          color: colors.textMuted,
        },
        addBtn: {
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: rS(4),
          paddingHorizontal: rS(10),
          paddingVertical: rV(6),
          borderRadius: 999,
          backgroundColor: colors.primary,
        },
        addText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11),
          color: "#FFFFFF",
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(10),
          paddingHorizontal: rS(12),
          paddingVertical: rV(11),
          borderRadius: rMS(14),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          marginBottom: rV(8),
        },
        rowActive: {
          borderColor: colors.primary,
          backgroundColor: colors.accentSoft,
        },
        title: {
          flex: 1,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.text,
        },
        meta: {
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.textMuted,
          marginTop: rV(2),
        },
        badge: {
          paddingHorizontal: rS(8),
          paddingVertical: rV(4),
          borderRadius: 999,
          backgroundColor: colors.primary,
        },
        badgeText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10),
          color: "#FFFFFF",
        },
      }),
    [colors],
  );

  if (filtered.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          No saved {paymentType === "card" ? "cards" : "MoMo wallets"} yet. Add one in the Payment
          tab to fund your wallet.
        </Text>
        <Pressable style={styles.addBtn} onPress={onAddMethod}>
          <Ionicons name="add" size={rMS(14)} color="#FFFFFF" />
          <Text style={styles.addText}>Add payment method</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.label}>
        Fund with saved {paymentType === "card" ? "card" : "MoMo"}
      </Text>
      {filtered.map((method) => {
        const active = selectedId === method.id;
        return (
          <Pressable
            key={method.id}
            style={[styles.row, active ? styles.rowActive : null]}
            onPress={() => onSelect(method.id)}
          >
            <Ionicons
              name={method.type === "card" ? "card-outline" : "phone-portrait-outline"}
              size={rMS(18)}
              color={active ? colors.primary : colors.textMuted}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{method.label}</Text>
              <Text style={styles.meta}>
                {method.type === "card"
                  ? `**** ${method.cardLast4 ?? "****"}`
                  : `${method.network ?? "MoMo"} · ${method.phone ?? ""}`}
              </Text>
            </View>
            {active ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Selected</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

type WalletTopupButtonProps = {
  loading: boolean;
  paymentType: "card" | "momo";
  onPress: () => void;
};

export function WalletTopupButton({ loading, paymentType, onPress }: WalletTopupButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: rS(8),
        backgroundColor: colors.primary,
        borderRadius: rMS(16),
        paddingVertical: rV(14),
        opacity: loading ? 0.7 : 1,
      }}
    >
      <Ionicons name="add-circle-outline" size={rMS(18)} color="#FFFFFF" />
      <Text style={{ fontFamily: Fonts.titleBold, fontSize: rMS(14), color: "#FFFFFF" }}>
        {loading ? "Opening secure checkout…" : `Top up via ${paymentType === "card" ? "Card" : "MoMo"}`}
      </Text>
    </Pressable>
  );
}

function txIcon(title: string): keyof typeof Ionicons.glyphMap {
  const lower = title.toLowerCase();
  if (lower.includes("top") || lower.includes("fund")) return "arrow-down-circle-outline";
  if (lower.includes("refund")) return "return-down-back-outline";
  if (lower.includes("order") || lower.includes("purchase")) return "bag-handle-outline";
  return "swap-horizontal-outline";
}

type WalletTransactionItemProps = {
  tx: WalletTransaction;
  index: number;
};

export function WalletTransactionItem({ tx, index }: WalletTransactionItemProps) {
  const { colors } = useTheme();
  const isCredit = tx.amount >= 0;
  const icon = txIcon(tx.title);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
          paddingVertical: rV(12),
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        iconShell: {
          width: rMS(40),
          height: rMS(40),
          borderRadius: rMS(12),
          backgroundColor: isCredit ? colors.successSoft : colors.dangerSoft,
          alignItems: "center",
          justifyContent: "center",
        },
        copy: {
          flex: 1,
          minWidth: 0,
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.text,
        },
        meta: {
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.textMuted,
          marginTop: rV(2),
        },
        amountCol: {
          alignItems: "flex-end",
        },
        amount: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: isCredit ? colors.successText : colors.dangerText,
        },
        balance: {
          fontFamily: Fonts.text,
          fontSize: rMS(10),
          color: colors.placeholder,
          marginTop: rV(2),
        },
      }),
    [colors, isCredit],
  );

  return (
    <Reanimated.View entering={FadeInDown.delay(Math.min(index * 35, 200)).duration(240)}>
      <View style={styles.row}>
        <View style={styles.iconShell}>
          <Ionicons
            name={icon}
            size={rMS(18)}
            color={isCredit ? colors.successText : colors.dangerText}
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            {tx.title}
          </Text>
          <Text style={styles.meta}>
            {new Date(tx.created_at).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.amountCol}>
          <Text style={styles.amount}>
            {isCredit ? "+" : "-"}₵{Math.abs(tx.amount).toFixed(2)}
          </Text>
          <Text style={styles.balance}>Bal ₵{tx.balance_after.toFixed(2)}</Text>
        </View>
      </View>
    </Reanimated.View>
  );
}

type PaymentMethodCardProps = {
  payment: PaymentMethod;
  fromCheckout: boolean;
  onUse?: () => void;
  onSetDefault?: () => void;
  onRemove?: () => void;
  index: number;
};

export function PaymentMethodCard({
  payment,
  fromCheckout,
  onUse,
  onSetDefault,
  onRemove,
  index,
}: PaymentMethodCardProps) {
  const { colors } = useTheme();
  const isCard = payment.type === "card";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: rMS(18),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: payment.isDefault ? colors.primary : colors.border,
          padding: rS(14),
          gap: rV(12),
          shadowColor: colors.shadow,
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        },
        top: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
        },
        iconShell: {
          width: rMS(44),
          height: rMS(44),
          borderRadius: rMS(14),
          backgroundColor: isCard ? colors.infoSoft : colors.successSoft,
          alignItems: "center",
          justifyContent: "center",
        },
        copy: {
          flex: 1,
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14),
          color: colors.text,
        },
        subtitle: {
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          color: colors.textMuted,
          marginTop: rV(2),
        },
        defaultBadge: {
          alignSelf: "flex-start",
          marginTop: rV(6),
          paddingHorizontal: rS(8),
          paddingVertical: rV(3),
          borderRadius: 999,
          backgroundColor: colors.primary,
        },
        defaultText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10),
          color: "#FFFFFF",
        },
        actions: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: rS(8),
        },
        actionPrimary: {
          flex: 1,
          minWidth: rS(120),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(5),
          paddingVertical: rV(10),
          borderRadius: rMS(12),
          backgroundColor: colors.primary,
        },
        actionPrimaryText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: "#FFFFFF",
        },
        actionSecondary: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(4),
          paddingHorizontal: rS(12),
          paddingVertical: rV(10),
          borderRadius: rMS(12),
          backgroundColor: colors.surfaceMuted,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        actionSecondaryText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.text,
        },
        actionDanger: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(4),
          paddingHorizontal: rS(12),
          paddingVertical: rV(10),
          borderRadius: rMS(12),
          backgroundColor: colors.dangerSoft,
        },
        actionDangerText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.dangerText,
        },
      }),
    [colors, isCard, payment.isDefault],
  );

  return (
    <Reanimated.View entering={FadeInDown.delay(Math.min(index * 40, 240)).duration(260)}>
      <View style={styles.wrap}>
        <View style={styles.top}>
          <View style={styles.iconShell}>
            <Ionicons
              name={isCard ? "card-outline" : "phone-portrait-outline"}
              size={rMS(20)}
              color={isCard ? colors.infoText : colors.successText}
            />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{payment.label}</Text>
            <Text style={styles.subtitle}>
              {isCard
                ? `Debit / credit · **** ${payment.cardLast4 ?? "****"}`
                : `${payment.network ?? "Mobile"} money · ${payment.phone ?? ""}`}
            </Text>
            {payment.isDefault ? (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.actions}>
          {fromCheckout && onUse ? (
            <Pressable style={styles.actionPrimary} onPress={onUse}>
              <Ionicons name="checkmark-circle-outline" size={rMS(15)} color="#FFFFFF" />
              <Text style={styles.actionPrimaryText}>Use at checkout</Text>
            </Pressable>
          ) : (
            <>
              {!payment.isDefault && onSetDefault ? (
                <Pressable style={styles.actionSecondary} onPress={onSetDefault}>
                  <Ionicons name="star-outline" size={rMS(14)} color={colors.text} />
                  <Text style={styles.actionSecondaryText}>Set default</Text>
                </Pressable>
              ) : null}
              {onRemove ? (
                <Pressable style={styles.actionDanger} onPress={onRemove}>
                  <Ionicons name="trash-outline" size={rMS(14)} color={colors.dangerText} />
                  <Text style={styles.actionDangerText}>Remove</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      </View>
    </Reanimated.View>
  );
}

type WalletCheckoutCardProps = {
  balance: number;
  onUse: () => void;
};

export function WalletCheckoutCard({ balance, onUse }: WalletCheckoutCardProps) {
  const { colors } = useTheme();

  return (
    <Reanimated.View entering={FadeInDown.duration(280)}>
      <LinearGradient
        colors={[colors.accentSoft, colors.card]}
        style={{
          borderRadius: rMS(18),
          padding: rS(16),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          gap: rV(12),
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: rS(12) }}>
          <View
            style={{
              width: rMS(44),
              height: rMS(44),
              borderRadius: rMS(14),
              backgroundColor: colors.successSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="wallet-outline" size={rMS(22)} color={colors.successText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.titleBold, fontSize: rMS(15), color: colors.text }}>
              ODOS Wallet
            </Text>
            <Text style={{ fontFamily: Fonts.text, fontSize: rMS(13), color: colors.textMuted }}>
              ₵{balance.toFixed(2)} available
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onUse}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: rS(6),
            backgroundColor: colors.primary,
            borderRadius: rMS(14),
            paddingVertical: rV(12),
          }}
        >
          <Ionicons name="checkmark-circle-outline" size={rMS(16)} color="#FFFFFF" />
          <Text style={{ fontFamily: Fonts.titleBold, fontSize: rMS(13), color: "#FFFFFF" }}>
            Pay with wallet
          </Text>
        </Pressable>
      </LinearGradient>
    </Reanimated.View>
  );
}

type PaymentMethodsSummaryProps = {
  total: number;
  cards: number;
  momo: number;
};

export function PaymentMethodsSummary({ total, cards, momo }: PaymentMethodsSummaryProps) {
  const { colors } = useTheme();

  return (
    <Reanimated.View entering={FadeInDown.duration(280)}>
      <View
        style={{
          flexDirection: "row",
          gap: rS(8),
        }}
      >
        {[
          { label: "Saved", value: total, icon: "layers-outline" as const },
          { label: "Cards", value: cards, icon: "card-outline" as const },
          { label: "MoMo", value: momo, icon: "phone-portrait-outline" as const },
        ].map((stat) => (
          <View
            key={stat.label}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: rV(12),
              borderRadius: rMS(14),
              backgroundColor: colors.card,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            }}
          >
            <Ionicons name={stat.icon} size={rMS(16)} color={colors.primary} />
            <Text
              style={{
                fontFamily: Fonts.titleBold,
                fontSize: rMS(16),
                color: colors.text,
                marginTop: rV(4),
              }}
            >
              {stat.value}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.text,
                fontSize: rMS(10),
                color: colors.textMuted,
              }}
            >
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </Reanimated.View>
  );
}

export function WalletSectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        borderRadius: rMS(18),
        backgroundColor: colors.card,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: rS(14),
        gap: rV(12),
      }}
    >
      <View>
        <Text style={{ fontFamily: Fonts.titleBold, fontSize: rMS(14), color: colors.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontFamily: Fonts.text,
              fontSize: rMS(12),
              lineHeight: rMS(18),
              color: colors.textMuted,
              marginTop: rV(4),
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function WalletPaymentTypeToggle({
  type,
  onChange,
}: {
  type: PaymentType;
  onChange: (type: PaymentType) => void;
}) {
  const { colors } = useTheme();
  const options: { key: PaymentType; label: string }[] = [
    { key: "card", label: "Card" },
    { key: "momo", label: "MoMo" },
  ];

  return (
    <View style={{ flexDirection: "row", gap: rS(8) }}>
      {options.map((option) => {
        const active = type === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={{
              flex: 1,
              paddingVertical: rV(12),
              borderRadius: rMS(14),
              alignItems: "center",
              backgroundColor: active ? colors.primary : colors.surfaceMuted,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: active ? colors.primary : colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.titleBold,
                fontSize: rMS(13),
                color: active ? "#FFFFFF" : colors.text,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function WalletNetworkPicker({
  value,
  onChange,
  error,
}: {
  value?: string;
  onChange: (network: "MTN" | "Telecel" | "AT") => void;
  error?: string;
}) {
  const { colors } = useTheme();
  const networks = ["MTN", "Telecel", "AT"] as const;

  return (
    <View>
      <Text
        style={{
          marginBottom: rV(8),
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.textSecondary,
        }}
      >
        Mobile network
      </Text>
      <View style={{ flexDirection: "row", gap: rS(8) }}>
        {networks.map((network) => {
          const active = value === network;
          return (
            <Pressable
              key={network}
              onPress={() => onChange(network)}
              style={{
                flex: 1,
                paddingVertical: rV(10),
                borderRadius: rMS(12),
                alignItems: "center",
                backgroundColor: active ? colors.primary : colors.surfaceMuted,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.titleBold,
                  fontSize: rMS(12),
                  color: active ? "#FFFFFF" : colors.text,
                }}
              >
                {network}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text
          style={{
            marginTop: rV(6),
            fontFamily: Fonts.text,
            fontSize: rMS(11),
            color: colors.dangerText,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function WalletVerifiedHint() {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: rS(6) }}>
      <Ionicons name="checkmark-circle" size={rMS(14)} color={colors.successText} />
      <Text style={{ fontFamily: Fonts.titleBold, fontSize: rMS(12), color: colors.successText }}>
        Number verified
      </Text>
    </View>
  );
}
