import ScreenLoader from "@/components/loaders/ScreenLoader";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useProfile } from "@/context/ProfileContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { verifyCheckoutSessionRequest, type PaymentVerification } from "@/hooks/useOrders";
import { useDeliveryStore } from "@/stores/deliveryStore";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ThemeColors } from "@/constants/theme";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

// Auto-poll a stuck "pending" status a few times with backoff, instead of
// leaving it entirely on the user to notice and tap refresh — the webhook
// is usually just a few seconds behind, so most "pending" screens resolve
// themselves before a person would even reach for the button.
const AUTO_POLL_DELAYS_MS = [5000, 10000, 20000];

type VerificationState = "verifying" | "cancelled" | "pending" | "failed" | "error";

function resolveVerificationState(result: PaymentVerification): VerificationState {
  if (
    result.payment_status === "cancelled" ||
    result.provider_status === "abandoned" ||
    result.provider_status === "cancelled"
  ) {
    return "cancelled";
  }
  if (result.payment_status === "pending") {
    return "pending";
  }
  return "failed";
}

function ResultIcon({ state, colors }: { state: VerificationState; colors: ThemeColors }) {
  if (state === "cancelled") {
    return <Ionicons name="close-circle" size={rMS(72)} color={colors.warningText} />;
  }
  if (state === "pending") {
    return <Ionicons name="time" size={rMS(72)} color={colors.infoText} />;
  }
  return <Ionicons name="alert-circle" size={rMS(72)} color={colors.dangerText} />;
}

export default function PaymentReturnScreen() {
  const params = useLocalSearchParams();
  const { accessToken, isHydrating } = useAuth();
  const { clearCart } = useCart();
  const { clearCheckoutSelection } = useProfile();
  const { resetDeliveryMethod } = useDeliveryStore();
  const { showToast } = useToast();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [verificationState, setVerificationState] =
    useState<VerificationState>("verifying");
  const [verification, setVerification] = useState<PaymentVerification | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoPollAttempt, setAutoPollAttempt] = useState(0);
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Block back navigation only while a verification request is actually in flight —
  // a gesture/hardware back mid-check could strand the app between "paid Paystack"
  // and "order confirmed here," inviting a confusing duplicate checkout attempt.
  useBlockBackNavigation(verificationState === "verifying");

  const orderId = getParam(params.orderId) ?? "";
  const reference =
    getParam(params.reference) ?? getParam(params.trxref) ?? "";
  const isCancelled = getParam(params.cancelled) === "1";

  const resultCopy = useMemo(() => {
    if (verificationState === "cancelled") {
      return {
        title: "Payment was cancelled",
        body:
          verification?.message ||
          "No money was confirmed yet, so your order is still waiting for payment.",
      };
    }
    if (verificationState === "pending") {
      return {
        title: "Payment still processing",
        body: verification?.message || "We’re still waiting for Paystack to finish confirming this payment.",
      };
    }
    if (verificationState === "failed") {
      return {
        title: "Payment not completed",
        body: verification?.message || "We couldn’t confirm that payment for this order.",
      };
    }
    return {
      title: "We couldn’t confirm payment",
      body: errorMessage || "Please try again from your orders list or checkout screen.",
    };
  }, [errorMessage, verification?.message, verificationState]);

  const runVerification = useCallback(
    async ({ isInitial }: { isInitial: boolean }) => {
      if (!accessToken || !reference) {
        return;
      }
      if (isInitial) {
        setVerificationState("verifying");
      } else {
        setIsRefreshing(true);
      }
      try {
        const result = await verifyCheckoutSessionRequest(accessToken, reference);
        if (!isMountedRef.current) {
          return;
        }

        setVerification(result);
        if (result.payment_status === "paid") {
          if (result.order.source === "cart") {
            await clearCart();
          }
          clearCheckoutSelection();
          resetDeliveryMethod();
          if (isInitial) {
            showToast(result.message);
          }
          router.replace({
            pathname: "/(root)/screens/order-success" as any,
            params: {
              orderId: result.order.id,
              orderNumber: result.order.order_number,
              total: String(result.order.total_amount),
              itemCount: String(
                result.order.items.reduce((sum, item) => sum + item.quantity, 0),
              ),
              eta: result.order.tracking_eta ?? "Estimated delivery in 2–3 days",
            },
          });
          return;
        }

        if (result.payment_status === "pending") {
          setVerificationState("pending");
          return;
        }

        setVerificationState(resolveVerificationState(result));
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }
        setVerificationState("error");
        setErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "We couldn't verify that payment right now.",
        );
      } finally {
        if (isMountedRef.current) {
          setIsRefreshing(false);
        }
      }
    },
    [accessToken, clearCart, clearCheckoutSelection, reference, resetDeliveryMethod, showToast],
  );

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    if (!reference) {
      setVerificationState(isCancelled ? "cancelled" : "error");
      if (!isCancelled) {
        setErrorMessage("Missing payment reference from the checkout redirect.");
      }
      return;
    }

    if (!accessToken) {
      setVerificationState("error");
      setErrorMessage("Please sign in again so we can verify that payment safely.");
      return;
    }

    void runVerification({ isInitial: true });
    // Only re-run this on the values that identify *which* payment to verify —
    // runVerification itself is stable enough via its own dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, isCancelled, isHydrating, reference]);

  useEffect(() => {
    if (verificationState !== "pending" || autoPollAttempt >= AUTO_POLL_DELAYS_MS.length) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setAutoPollAttempt((count) => count + 1);
      void runVerification({ isInitial: false });
    }, AUTO_POLL_DELAYS_MS[autoPollAttempt]);
    return () => clearTimeout(timer);
  }, [autoPollAttempt, runVerification, verificationState]);

  if (verificationState === "verifying") {
    return <ScreenLoader label="Confirming your payment..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <ResultIcon state={verificationState} colors={colors} />
        </View>
        <Text style={styles.title}>{resultCopy.title}</Text>
        <Text style={styles.body}>{resultCopy.body}</Text>

        {reference ? (
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Payment reference</Text>
            <Text style={styles.metaValue}>{reference}</Text>
          </View>
        ) : null}

        {verificationState === "pending" && autoPollAttempt < AUTO_POLL_DELAYS_MS.length ? (
          <Text style={styles.autoPollHint}>Automatically checking again shortly…</Text>
        ) : null}

        <View style={styles.actions}>
          {verificationState === "pending" ? (
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.86}
              onPress={() => void runVerification({ isInitial: false })}
              disabled={isRefreshing}
            >
              <Text style={styles.primaryButtonText}>
                {isRefreshing ? "Refreshing..." : "Refresh payment status"}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.86}
            onPress={() =>
              orderId
                ? router.replace({
                    pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
                    params: { orderId },
                  })
                : router.replace("/(root)/(tabs)" as any)
            }
          >
            <Text style={styles.secondaryButtonText}>
              {orderId ? "Open this order" : "Return to app"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ghostButton}
            activeOpacity={0.82}
            onPress={() => router.replace("/(root)/(tabs)" as any)}
          >
            <Text style={styles.ghostButtonText}>Continue shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.screen,
      paddingHorizontal: rS(20),
      justifyContent: "center",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: rMS(28),
      paddingHorizontal: rS(22),
      paddingVertical: rV(26),
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    iconWrap: {
      alignItems: "center",
      marginBottom: rV(16),
    },
    title: {
      fontSize: rMS(24),
      lineHeight: rMS(30),
      fontFamily: Fonts.titleBold,
      color: colors.text,
      textAlign: "center",
    },
    body: {
      marginTop: rV(10),
      fontSize: rMS(13),
      lineHeight: rMS(20),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
      textAlign: "center",
    },
    metaCard: {
      marginTop: rV(18),
      paddingHorizontal: rS(14),
      paddingVertical: rV(14),
      borderRadius: rMS(18),
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metaLabel: {
      fontSize: rMS(11),
      fontFamily: Fonts.title,
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    metaValue: {
      marginTop: rV(8),
      fontSize: rMS(13),
      lineHeight: rMS(19),
      fontFamily: Fonts.textBold,
      color: colors.text,
    },
    autoPollHint: {
      marginTop: rV(14),
      fontSize: rMS(11.5),
      fontFamily: Fonts.text,
      color: colors.textMuted,
      textAlign: "center",
    },
    actions: {
      marginTop: rV(20),
      gap: rV(10),
    },
    primaryButton: {
      borderRadius: rMS(18),
      backgroundColor: colors.primary,
      paddingVertical: rV(15),
      alignItems: "center",
    },
    primaryButtonText: {
      fontSize: rMS(14),
      fontFamily: Fonts.textBold,
      color: colors.onPrimary,
    },
    secondaryButton: {
      borderRadius: rMS(18),
      backgroundColor: colors.inverseSurface,
      paddingVertical: rV(15),
      alignItems: "center",
    },
    secondaryButtonText: {
      fontSize: rMS(14),
      fontFamily: Fonts.textBold,
      color: colors.onInverseSurface,
    },
    ghostButton: {
      borderRadius: rMS(18),
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: rV(14),
      alignItems: "center",
    },
    ghostButtonText: {
      fontSize: rMS(13),
      fontFamily: Fonts.title,
      color: colors.text,
    },
  });
}
