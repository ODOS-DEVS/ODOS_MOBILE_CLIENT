import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { VendorOrderAlertPayload } from "@/utils/vendorOrderAlertBus";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type VendorOrderAlertOverlayProps = {
  alert: VendorOrderAlertPayload | null;
  onDismiss: () => void;
  onAcknowledge?: (alert: VendorOrderAlertPayload) => void;
};

function formatAmount(value: number) {
  return `GHS ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function VendorOrderAlertOverlay({
  alert,
  onDismiss,
  onAcknowledge,
}: VendorOrderAlertOverlayProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(-24)).current;

  useEffect(() => {
    if (!alert) {
      return;
    }

    pulse.setValue(0);
    slide.setValue(-24);

    Animated.parallel([
      Animated.spring(slide, {
        toValue: 0,
        damping: 16,
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 4 },
      ),
    ]).start();
  }, [alert, pulse, slide]);

  const openOrderDetail = () => {
    if (!alert) {
      return;
    }
    onDismiss();
    router.push({
      pathname: "/vendor/orders/[orderId]" as any,
      params: { orderId: alert.orderId },
    });
  };

  const handleAcknowledge = () => {
    if (!alert) {
      return;
    }
    onAcknowledge?.(alert);
    onDismiss();
  };

  if (!alert) {
    return null;
  }

  const itemLabel = alert.productCount === 1 ? "item" : "items";
  const isReminder = alert.kind === "reminder";
  const isUrgent = isReminder && (alert.reminderMinutes ?? 0) >= 30;
  const gradientColors = isUrgent
    ? isDark
      ? (["#7F1D1D", "#991B1B", "#450A0A"] as const)
      : (["#DC2626", "#B91C1C", "#7F1D1D"] as const)
    : isReminder
      ? isDark
        ? (["#713F12", "#92400E", "#451A03"] as const)
        : (["#FB923C", "#EA580C", "#C2410C"] as const)
      : isDark
        ? (["#78350F", "#92400E", "#451A03"] as const)
        : (["#F59E0B", "#EA580C", "#C2410C"] as const);
  const eyebrow = isReminder
    ? isUrgent
      ? "Urgent order waiting"
      : `Reminder · ${alert.reminderMinutes ?? ""} min`
    : "New order received";
  const headline = isReminder
    ? `#${alert.orderNumber} needs action`
    : `#${alert.orderNumber}`;
  const bodyCopy = isReminder
    ? `This order has been waiting ${alert.reminderMinutes ?? "several"} minutes. Fulfill it before the shopper loses patience.`
    : "Fulfill this order before it stalls. Shoppers are waiting.";

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onDismiss} />

        <Animated.View
          style={[
            styles.sheetWrap,
            {
              paddingTop: insets.top + rV(8),
              transform: [{ translateY: slide }],
            },
          ]}
        >
          <LinearGradient colors={gradientColors} style={styles.card}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  opacity: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.18, 0.45],
                  }),
                  transform: [
                    {
                      scale: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.08],
                      }),
                    },
                  ],
                },
              ]}
            />

            <View style={styles.headerRow}>
              <View style={styles.iconShell}>
                <Ionicons name="receipt" size={rMS(22)} color="#FFFFFF" />
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text style={styles.orderNumber}>{headline}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onDismiss}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Dismiss order alert"
              >
                <Ionicons name="close" size={rMS(20)} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="cube-outline" size={rMS(14)} color="#FFFFFF" />
                <Text style={styles.metaText}>
                  {alert.productCount} {itemLabel}
                </Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="cash-outline" size={rMS(14)} color="#FFFFFF" />
                <Text style={styles.metaText}>{formatAmount(alert.totalAmount)}</Text>
              </View>
            </View>

            {alert.customerName ? (
              <Text style={styles.customerLine} numberOfLines={1}>
                From {alert.customerName}
              </Text>
            ) : null}

            <Text style={styles.body}>{bodyCopy}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: "rgba(255,255,255,0.35)" }]}
                onPress={onDismiss}
                activeOpacity={0.88}
              >
                <Text style={styles.secondaryLabel}>Later</Text>
              </TouchableOpacity>
              {onAcknowledge && alert.kind !== "reminder" ? (
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: "rgba(255,255,255,0.35)" }]}
                  onPress={handleAcknowledge}
                  activeOpacity={0.88}
                >
                  <Text style={styles.secondaryLabel}>Seen it</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.card }]}
                onPress={openOrderDetail}
                activeOpacity={0.9}
              >
                <Text style={[styles.primaryLabel, { color: colors.text }]}>Open order</Text>
                <Ionicons name="arrow-forward" size={rMS(16)} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.58)",
    justifyContent: "flex-start",
  },
  sheetWrap: {
    paddingHorizontal: rS(16),
  },
  card: {
    borderRadius: rMS(22),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    overflow: "hidden",
    gap: rV(12),
  },
  pulseRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: rMS(22),
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  iconShell: {
    width: rMS(46),
    height: rMS(46),
    borderRadius: rMS(15),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: rV(2),
  },
  eyebrow: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    letterSpacing: 0.45,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.82)",
  },
  orderNumber: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(24),
    lineHeight: rMS(28),
    color: "#FFFFFF",
  },
  closeButton: {
    width: rMS(34),
    height: rMS(34),
    borderRadius: rMS(17),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
    borderRadius: rMS(999),
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  metaText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12.5),
    color: "#FFFFFF",
  },
  customerLine: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    color: "rgba(255,255,255,0.88)",
  },
  body: {
    fontFamily: Fonts.text,
    fontSize: rMS(13.5),
    lineHeight: rMS(20),
    color: "rgba(255,255,255,0.9)",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
    marginTop: rV(4),
  },
  secondaryButton: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: rS(92),
    minHeight: rV(48),
    borderRadius: rMS(14),
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
    color: "#FFFFFF",
  },
  primaryButton: {
    flexGrow: 1.4,
    flexBasis: "45%",
    minWidth: rS(140),
    minHeight: rV(48),
    borderRadius: rMS(14),
    paddingHorizontal: rS(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(6),
  },
  primaryLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
  },
});
