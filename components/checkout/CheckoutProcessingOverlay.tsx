import LoadingSpinner from "@/components/loaders/LoadingSpinner";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { formatOrderMoney } from "@/components/orders/OrderUi";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import Reanimated from "react-native-reanimated";

export type CheckoutProcessingMode = "wallet" | "paystack";

type CheckoutProcessingOverlayProps = {
  visible: boolean;
  mode: CheckoutProcessingMode;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
};

function BreakdownRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "discount" | "total";
}) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: rS(12) }}>
      <Text style={{ fontFamily: Fonts.text, fontSize: rMS(12.5), color: colors.textMuted }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: accent === "total" ? Fonts.titleBold : Fonts.title,
          fontSize: rMS(12.5),
          color:
            accent === "discount"
              ? colors.successText
              : accent === "total"
                ? colors.text
                : colors.textSecondary,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function CheckoutProcessingOverlay({
  visible,
  mode,
  subtotal,
  shipping,
  discount,
  total,
}: CheckoutProcessingOverlayProps) {
  const { colors } = useTheme();
  const isWallet = mode === "wallet";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.52)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: rS(24),
        },
        card: {
          width: "100%",
          maxWidth: rS(340),
          borderRadius: rMS(24),
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: "rgba(255,255,255,0.22)",
        },
        inner: {
          paddingHorizontal: rS(22),
          paddingTop: rV(24),
          paddingBottom: rV(22),
          alignItems: "center",
          gap: rV(14),
        },
        iconWrap: {
          width: rMS(56),
          height: rMS(56),
          borderRadius: rMS(18),
          backgroundColor: "rgba(255,255,255,0.9)",
          alignItems: "center",
          justifyContent: "center",
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(18),
          color: colors.text,
          textAlign: "center",
        },
        subtitle: {
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(19),
          color: colors.textMuted,
          textAlign: "center",
        },
        breakdown: {
          width: "100%",
          gap: rV(8),
          paddingHorizontal: rS(14),
          paddingVertical: rV(12),
          borderRadius: rMS(16),
          backgroundColor: "rgba(255,255,255,0.72)",
        },
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
          marginVertical: rV(2),
        },
      }),
    [colors],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Reanimated.View style={styles.card}>
          <LinearGradient
            colors={[colors.accentSoft, "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.inner}
          >
            <Reanimated.View style={styles.iconWrap}>
              <Ionicons
                name={isWallet ? "wallet" : "shield-checkmark"}
                size={rMS(28)}
                color={colors.primary}
              />
            </Reanimated.View>

            <Text style={styles.title}>
              {isWallet ? "Processing wallet payment" : "Confirming payment"}
            </Text>
            <Text style={styles.subtitle}>
              {isWallet
                ? "Deducting from your ODOS wallet and placing your order…"
                : "Confirming your payment and preparing your order…"}
            </Text>

            <View style={styles.breakdown}>
              <BreakdownRow label="Products" value={formatOrderMoney(subtotal)} />
              <BreakdownRow
                label="Delivery"
                value={shipping === 0 ? "FREE" : formatOrderMoney(shipping)}
              />
              {discount > 0 ? (
                <BreakdownRow
                  label="Voucher savings"
                  value={`-${formatOrderMoney(discount).slice(1)}`}
                  accent="discount"
                />
              ) : null}
              <View style={styles.divider} />
              <BreakdownRow label="Total" value={formatOrderMoney(total)} accent="total" />
            </View>

            <LoadingSpinner
              label={isWallet ? "Paying with wallet…" : "Almost there…"}
              sublabel="Please keep the app open"
            />
          </LinearGradient>
        </Reanimated.View>
      </View>
    </Modal>
  );
}
