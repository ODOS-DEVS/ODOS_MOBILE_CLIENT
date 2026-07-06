import ScreenLoader from "@/components/loaders/ScreenLoader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { verifyWalletTopupRequest } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

type TopupState = "verifying" | "cancelled" | "pending" | "failed" | "error" | "success";

function TopupIcon({ state }: { state: TopupState }) {
  if (state === "success") {
    return <Ionicons name="checkmark-circle" size={rMS(72)} color="#16A34A" />;
  }
  if (state === "cancelled") {
    return <Ionicons name="close-circle" size={rMS(72)} color="#D97706" />;
  }
  if (state === "pending") {
    return <Ionicons name="time" size={rMS(72)} color="#2563EB" />;
  }
  return <Ionicons name="alert-circle" size={rMS(72)} color="#DC2626" />;
}

export default function WalletTopupReturnScreen() {
  const params = useLocalSearchParams();
  const { accessToken, isHydrating } = useAuth();
  const { refreshProfileData } = useProfile();
  const { refreshActivity } = useActivityFeed();
  const { showSuccessToast } = useToast();
  const [state, setState] = useState<TopupState>("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [resultMeta, setResultMeta] = useState<{
    amount: number;
    currency: string;
    paymentLabel: string | null;
    balanceAfter: number | null;
  } | null>(null);

  const reference = getParam(params.reference) ?? getParam(params.trxref) ?? "";
  const isCancelled = getParam(params.cancelled) === "1";

  const copy = useMemo(() => {
    if (state === "success") {
      return {
        title: "Wallet funded successfully",
        body:
          "Payment confirmed. Your wallet balance is updated and ready for checkout.",
      };
    }
    if (state === "cancelled") {
      return {
        title: "Top-up cancelled",
        body: "No money was added to your wallet.",
      };
    }
    if (state === "pending") {
      return {
        title: "Top-up still processing",
        body: "We're still waiting for payment confirmation. Try refreshing shortly.",
      };
    }
    if (state === "failed") {
      return {
        title: "Top-up not completed",
        body: "We couldn't confirm this top-up payment.",
      };
    }
    return {
      title: "Unable to verify top-up",
      body: errorMessage || "Please try again from your wallet screen.",
    };
  }, [errorMessage, state]);

  useEffect(() => {
    if (isHydrating) {
      return;
    }
    if (isCancelled) {
      setState("cancelled");
      return;
    }
    if (!reference) {
      setState("error");
      setErrorMessage("Missing top-up reference from the payment callback.");
      return;
    }
    if (!accessToken) {
      setState("error");
      setErrorMessage("Please sign in again so we can verify this top-up.");
      return;
    }

    let isMounted = true;
    const verifyTopup = async () => {
      try {
        const result = await verifyWalletTopupRequest(accessToken, reference);
        if (!isMounted) {
          return;
        }
        await refreshProfileData();
        setResultMeta({
          amount: result.amount,
          currency: result.currency,
          paymentLabel: result.payment_label,
          balanceAfter: result.wallet?.available_balance ?? null,
        });
        if (result.status === "paid") {
          setState("success");
          void refreshActivity({ silent: true });
          showSuccessToast("Wallet funded successfully.");
          return;
        }
        if (result.status === "pending") {
          setState("pending");
          return;
        }
        if (result.status === "cancelled") {
          setState("cancelled");
          return;
        }
        setState("failed");
        setErrorMessage(result.message || "Top-up was not successful.");
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setState("failed");
        setErrorMessage(
          error instanceof Error && error.message ? error.message : "We couldn't verify this top-up.",
        );
      }
    };

    void verifyTopup();
    return () => {
      isMounted = false;
    };
  }, [accessToken, isCancelled, isHydrating, reference, refreshActivity, refreshProfileData, showSuccessToast]);

  if (state === "verifying") {
    return <ScreenLoader label="Confirming your wallet top-up..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <TopupIcon state={state} />
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.body}>{copy.body}</Text>

        {resultMeta ? (
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Top-up details</Text>
            <Text style={styles.metaValue}>
              {resultMeta.currency} {resultMeta.amount.toFixed(2)}
              {resultMeta.paymentLabel ? ` via ${resultMeta.paymentLabel}` : ""}
            </Text>
            {resultMeta.balanceAfter != null ? (
              <>
                <Text style={[styles.metaLabel, styles.metaLabelSpaced]}>New balance</Text>
                <Text style={styles.metaValue}>
                  {resultMeta.currency} {resultMeta.balanceAfter.toFixed(2)}
                </Text>
              </>
            ) : null}
          </View>
        ) : null}

        {reference ? (
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Reference</Text>
            <Text style={styles.metaValue}>{reference}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {state === "pending" ? (
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.86}
              onPress={() => router.replace({ pathname: "/wallet/topup-return" as any, params: { reference } })}
            >
              <Text style={styles.primaryButtonText}>Refresh status</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.86}
            onPress={() =>
              router.replace(
                "/(root)/screens/profileScreens/Account/Wallet" as any,
              )
            }
          >
            <Text style={styles.secondaryButtonText}>Back to wallet</Text>
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
  iconWrap: { alignItems: "center", marginBottom: rV(16) },
  title: {
    fontSize: rMS(22),
    lineHeight: rMS(28),
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
  metaLabelSpaced: { marginTop: rV(12) },
  metaValue: {
    marginTop: rV(8),
    fontSize: rMS(13),
    lineHeight: rMS(19),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  actions: { marginTop: rV(20), gap: rV(10) },
  primaryButton: {
    borderRadius: rMS(18),
    backgroundColor: AppColors.primary,
    paddingVertical: rV(15),
    alignItems: "center",
  },
  primaryButtonText: { fontSize: rMS(14), fontFamily: Fonts.textBold, color: AppColors.white },
  secondaryButton: {
    borderRadius: rMS(18),
    backgroundColor: "#0F172A",
    paddingVertical: rV(15),
    alignItems: "center",
  },
  secondaryButtonText: { fontSize: rMS(14), fontFamily: Fonts.textBold, color: AppColors.white },
});
