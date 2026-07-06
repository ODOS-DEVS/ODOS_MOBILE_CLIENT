import ScreenLoader from "@/components/loaders/ScreenLoader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { verifyCheckoutSessionRequest, type PaymentVerification } from "@/hooks/useOrders";
import { useDeliveryStore } from "@/stores/deliveryStore";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

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

function ResultIcon({ state }: { state: VerificationState }) {
  if (state === "cancelled") {
    return <Ionicons name="close-circle" size={rMS(72)} color="#D97706" />;
  }
  if (state === "pending") {
    return <Ionicons name="time" size={rMS(72)} color="#2563EB" />;
  }
  return <Ionicons name="alert-circle" size={rMS(72)} color="#DC2626" />;
}

export default function PaymentReturnScreen() {
  const params = useLocalSearchParams();
  const { accessToken, isHydrating } = useAuth();
  const { clearCart } = useCart();
  const { clearCheckoutSelection } = useProfile();
  const { resetDeliveryMethod } = useDeliveryStore();
  const { showToast } = useToast();

  const [verificationState, setVerificationState] =
    useState<VerificationState>("verifying");
  const [verification, setVerification] = useState<PaymentVerification | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

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

    let isMounted = true;
    const authToken = accessToken;
    const paymentReference = reference;

    async function verifyPayment() {
      setVerificationState("verifying");
      try {
        const result = await verifyCheckoutSessionRequest(
          authToken,
          paymentReference,
        );
        if (!isMounted) {
          return;
        }

        setVerification(result);
        if (result.payment_status === "paid") {
          if (result.order.source === "cart") {
            await clearCart();
          }
          clearCheckoutSelection();
          resetDeliveryMethod();
          showToast(result.message);
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
        if (!isMounted) {
          return;
        }

        setVerificationState("error");
        setErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "We couldn't verify that payment right now.",
        );
      }
    }

    void verifyPayment();
    return () => {
      isMounted = false;
    };
  }, [
    accessToken,
    clearCart,
    clearCheckoutSelection,
    isCancelled,
    isHydrating,
    reference,
    resetDeliveryMethod,
    showToast,
  ]);

  async function handleRefreshStatus() {
    if (!accessToken || !reference) {
      return;
    }
    const authToken = accessToken;
    const paymentReference = reference;
    setIsRefreshing(true);
    try {
      const result = await verifyCheckoutSessionRequest(
        authToken,
        paymentReference,
      );
      setVerification(result);
      if (result.payment_status === "paid") {
        if (result.order.source === "cart") {
          await clearCart();
        }
        clearCheckoutSelection();
        resetDeliveryMethod();
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

      setVerificationState(resolveVerificationState(result));
    } catch (error) {
      setVerificationState("error");
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "We couldn't refresh this payment status right now.",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  if (verificationState === "verifying") {
    return <ScreenLoader label="Confirming your payment..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <ResultIcon state={verificationState} />
        </View>
        <Text style={styles.title}>{resultCopy.title}</Text>
        <Text style={styles.body}>{resultCopy.body}</Text>

        {reference ? (
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Payment reference</Text>
            <Text style={styles.metaValue}>{reference}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {verificationState === "pending" ? (
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.86}
              onPress={() => void handleRefreshStatus()}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: rS(20),
    justifyContent: "center",
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(28),
    paddingHorizontal: rS(22),
    paddingVertical: rV(26),
    borderWidth: 1,
    borderColor: "#E5EAF0",
  },
  iconWrap: {
    alignItems: "center",
    marginBottom: rV(16),
  },
  title: {
    fontSize: rMS(24),
    lineHeight: rMS(30),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
    textAlign: "center",
  },
  body: {
    marginTop: rV(10),
    fontSize: rMS(13),
    lineHeight: rMS(20),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    textAlign: "center",
  },
  metaCard: {
    marginTop: rV(18),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    borderRadius: rMS(18),
    backgroundColor: "#F7F9FC",
    borderWidth: 1,
    borderColor: "#E6ECF3",
  },
  metaLabel: {
    fontSize: rMS(11),
    fontFamily: Fonts.title,
    color: AppColors.subtext[100],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    marginTop: rV(8),
    fontSize: rMS(13),
    lineHeight: rMS(19),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  actions: {
    marginTop: rV(20),
    gap: rV(10),
  },
  primaryButton: {
    borderRadius: rMS(18),
    backgroundColor: AppColors.primary,
    paddingVertical: rV(15),
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  secondaryButton: {
    borderRadius: rMS(18),
    backgroundColor: "#0F172A",
    paddingVertical: rV(15),
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  ghostButton: {
    borderRadius: rMS(18),
    borderWidth: 1,
    borderColor: "#DCE3EA",
    paddingVertical: rV(14),
    alignItems: "center",
  },
  ghostButtonText: {
    fontSize: rMS(13),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
});
