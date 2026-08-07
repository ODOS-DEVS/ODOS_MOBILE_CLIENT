import ScreenLoader from "@/components/loaders/ScreenLoader";
import Fonts from "@/constants/Fonts";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { verifyWalletTopupRequest } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ThemeColors } from "@/constants/theme";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

// Auto-poll a stuck "pending" status a few times with backoff instead of
// relying entirely on the user noticing and tapping refresh.
const AUTO_POLL_DELAYS_MS = [5000, 10000, 20000];

type TopupState = "verifying" | "cancelled" | "pending" | "failed" | "error" | "success";

function TopupIcon({ state, colors }: { state: TopupState; colors: ThemeColors }) {
  if (state === "success") {
    return <Ionicons name="checkmark-circle" size={rMS(72)} color={colors.successText} />;
  }
  if (state === "cancelled") {
    return <Ionicons name="close-circle" size={rMS(72)} color={colors.warningText} />;
  }
  if (state === "pending") {
    return <Ionicons name="time" size={rMS(72)} color={colors.infoText} />;
  }
  return <Ionicons name="alert-circle" size={rMS(72)} color={colors.dangerText} />;
}

export default function WalletTopupReturnScreen() {
  const params = useLocalSearchParams();
  const { accessToken, isHydrating } = useAuth();
  const { refreshProfileData } = useProfile();
  const { refreshActivity } = useActivityFeed();
  const { showSuccessToast } = useToast();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, setState] = useState<TopupState>("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoPollAttempt, setAutoPollAttempt] = useState(0);
  useBlockBackNavigation(state === "verifying");
  const [resultMeta, setResultMeta] = useState<{
    amount: number;
    currency: string;
    paymentLabel: string | null;
    balanceAfter: number | null;
  } | null>(null);
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  const runVerification = useCallback(
    async ({ isInitial }: { isInitial: boolean }) => {
      if (!accessToken || !reference) {
        return;
      }
      if (isInitial) {
        setState("verifying");
      } else {
        setIsRefreshing(true);
      }
      try {
        const result = await verifyWalletTopupRequest(accessToken, reference);
        if (!isMountedRef.current) {
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
        if (!isMountedRef.current) {
          return;
        }
        setState("failed");
        setErrorMessage(
          error instanceof Error && error.message ? error.message : "We couldn't verify this top-up.",
        );
      } finally {
        if (isMountedRef.current) {
          setIsRefreshing(false);
        }
      }
    },
    [accessToken, reference, refreshActivity, refreshProfileData, showSuccessToast],
  );

  useEffect(() => {
    if (isHydrating) {
      return;
    }
    if (!reference) {
      // No reference means there's nothing to verify with the server — only now is
      // it safe to trust the client-side `cancelled` param at face value.
      if (isCancelled) {
        setState("cancelled");
        return;
      }
      setState("error");
      setErrorMessage("Missing top-up reference from the payment callback.");
      return;
    }
    if (!accessToken) {
      setState("error");
      setErrorMessage("Please sign in again so we can verify this top-up.");
      return;
    }

    void runVerification({ isInitial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, isCancelled, isHydrating, reference]);

  useEffect(() => {
    if (state !== "pending" || autoPollAttempt >= AUTO_POLL_DELAYS_MS.length) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setAutoPollAttempt((count) => count + 1);
      void runVerification({ isInitial: false });
    }, AUTO_POLL_DELAYS_MS[autoPollAttempt]);
    return () => clearTimeout(timer);
  }, [autoPollAttempt, runVerification, state]);

  if (state === "verifying") {
    return <ScreenLoader label="Confirming your wallet top-up..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <TopupIcon state={state} colors={colors} />
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

        {state === "pending" && autoPollAttempt < AUTO_POLL_DELAYS_MS.length ? (
          <Text style={styles.autoPollHint}>Automatically checking again shortly…</Text>
        ) : null}

        <View style={styles.actions}>
          {state === "pending" ? (
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.86}
              onPress={() => void runVerification({ isInitial: false })}
              disabled={isRefreshing}
            >
              <Text style={styles.primaryButtonText}>
                {isRefreshing ? "Refreshing..." : "Refresh status"}
              </Text>
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
    iconWrap: { alignItems: "center", marginBottom: rV(16) },
    title: {
      fontSize: rMS(22),
      lineHeight: rMS(28),
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
    metaLabelSpaced: { marginTop: rV(12) },
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
    actions: { marginTop: rV(20), gap: rV(10) },
    primaryButton: {
      borderRadius: rMS(18),
      backgroundColor: colors.primary,
      paddingVertical: rV(15),
      alignItems: "center",
    },
    primaryButtonText: { fontSize: rMS(14), fontFamily: Fonts.textBold, color: colors.onPrimary },
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
  });
}
