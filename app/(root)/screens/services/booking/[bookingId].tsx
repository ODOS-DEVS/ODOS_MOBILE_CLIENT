import ProfileHeader from "@/components/profile/ProfileHeader";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import {
  confirmBookingWork,
  fetchBooking,
  fetchBookingHold,
  startBookingCheckout,
  transitionBooking,
} from "@/services/serviceMarketplaceService";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type { Booking, BookingHold } from "@/types/service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * One booking, and the single thing the customer can do about it now.
 *
 * The action is derived from status rather than listing every possibility:
 * an unpaid booking offers payment, a finished one offers confirmation, and
 * everything else offers nothing. Showing four buttons and disabling three
 * makes the reader work out which one applies; showing one does not.
 *
 * Confirming is the money action — it releases what Odos is holding — so it
 * asks first, and says plainly what it will do.
 */

function formatWhen(iso?: string | null): string | null {
  if (!iso) {
    return null;
  }
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BookingDetailScreen() {
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const bookingId = Array.isArray(params.bookingId)
    ? params.bookingId[0]
    : params.bookingId;

  const { colors } = useTheme();
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [hold, setHold] = useState<BookingHold | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  const load = useCallback(async () => {
    if (!bookingId || !accessToken) {
      setIsLoading(false);
      return;
    }
    try {
      const [detail, heldInfo] = await Promise.all([
        fetchBooking(bookingId, accessToken),
        fetchBookingHold(bookingId, accessToken).catch(() => null),
      ]);
      setBooking(detail);
      setHold(heldInfo);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "We couldn't load that booking.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, bookingId, showToast]);

  useFocusEffect(
    useCallback(() => {
      void load();
      return undefined;
    }, [load]),
  );

  const handlePay = useCallback(async () => {
    if (!booking || !accessToken) {
      return;
    }
    setIsBusy(true);
    try {
      const checkout = await startBookingCheckout(booking.id, accessToken, {
        callbackUrl: "odosmobileexpo://payments/return",
      });
      await Linking.openURL(checkout.authorizationUrl);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "We couldn't start that payment.",
        "error",
      );
    } finally {
      setIsBusy(false);
    }
  }, [accessToken, booking, showToast]);

  const handleConfirm = useCallback(() => {
    if (!booking || !accessToken) {
      return;
    }
    Alert.alert(
      "Release the payment?",
      `This pays ₵${booking.totalAmount.toFixed(2)} to the provider and closes the booking. Only confirm once the work is done.`,
      [
        { text: "Not yet", style: "cancel" },
        {
          text: "Confirm",
          style: "default",
          onPress: () => {
            setIsBusy(true);
            void confirmBookingWork(booking.id, accessToken)
              .then((updated) => {
                setBooking(updated);
                showToast("Payment released to the provider.", "success");
                void load();
              })
              .catch((err: unknown) =>
                showToast(
                  err instanceof Error ? err.message : "We couldn't confirm that.",
                  "error",
                ),
              )
              .finally(() => setIsBusy(false));
          },
        },
      ],
    );
  }, [accessToken, booking, load, showToast]);

  const handleCancel = useCallback(() => {
    if (!booking || !accessToken) {
      return;
    }
    Alert.alert("Cancel this booking?", "The provider will be told.", [
      { text: "Keep it", style: "cancel" },
      {
        text: "Cancel booking",
        style: "destructive",
        onPress: () => {
          setIsBusy(true);
          void transitionBooking(booking.id, accessToken, "cancelled")
            .then((updated) => {
              setBooking(updated);
              showToast("Booking cancelled.");
            })
            .catch((err: unknown) =>
              showToast(
                err instanceof Error ? err.message : "We couldn't cancel that.",
                "error",
              ),
            )
            .finally(() => setIsBusy(false));
        },
      },
    ]);
  }, [accessToken, booking, showToast]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ProfileHeader title="Booking" />
        <View style={styles.centre}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.screen}>
        <ProfileHeader title="Booking" />
        <View style={styles.centre}>
          <Text style={styles.emptyTitle}>Booking not found</Text>
        </View>
      </View>
    );
  }

  const when = formatWhen(booking.scheduledStartAt);
  const canCancel = ["pending_provider", "pending_payment", "confirmed"].includes(
    booking.status,
  );

  return (
    <View style={styles.screen}>
      <ProfileHeader title={booking.bookingNumber} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: insets.bottom + rV(100),
        }}
      >
        {/* The hold is the headline: it is what reassures the customer
            before the work and what prompts them after it. */}
        {hold && hold.amountHeld > 0 ? (
          <View style={styles.holdCard}>
            <Ionicons
              name="shield-checkmark"
              size={rMS(20)}
              color={colors.successText}
            />
            <View style={styles.holdCopy}>
              <Text style={styles.holdAmount}>
                ₵{hold.amountHeld.toFixed(2)} held by Odos
              </Text>
              <Text style={styles.holdBody}>
                {hold.awaitingConfirmation
                  ? "Confirm the work to release it to the provider."
                  : "Released once you confirm the work is done."}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.block}>
          <Row label="Status" value={booking.status.replace(/_/g, " ")} styles={styles} />
          {when ? <Row label="When" value={when} styles={styles} /> : null}
          {booking.locationAddress ? (
            <Row label="Where" value={booking.locationAddress} styles={styles} />
          ) : null}
          <Row
            label="Total"
            value={`₵${booking.totalAmount.toFixed(2)}`}
            styles={styles}
          />
          <Row label="Payment" value={booking.paymentStatus} styles={styles} />
        </View>

        {booking.addons.length > 0 ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Extras</Text>
            {booking.addons.map((addon) => (
              <Row
                key={addon.title}
                label={`${addon.title}${addon.quantity > 1 ? ` ×${addon.quantity}` : ""}`}
                value={`₵${addon.lineTotal.toFixed(2)}`}
                styles={styles}
              />
            ))}
          </View>
        ) : null}

        {booking.customerNote ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Your note</Text>
            <Text style={styles.note}>{booking.customerNote}</Text>
          </View>
        ) : null}

        {canCancel ? (
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isBusy}
            onPress={handleCancel}
          >
            <Text style={styles.cancelLink}>Cancel this booking</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {booking.status === "pending_payment" || booking.status === "completed" ? (
        <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, rV(10)) }]}>
          <TouchableOpacity
            style={[styles.cta, isBusy && styles.ctaBusy]}
            activeOpacity={0.9}
            disabled={isBusy}
            onPress={
              booking.status === "pending_payment"
                ? () => void handlePay()
                : handleConfirm
            }
          >
            {isBusy ? (
              <ActivityIndicator size="small" color={colors.onInverseSurface} />
            ) : (
              <Text style={styles.ctaText}>
                {booking.status === "pending_payment"
                  ? `Pay ₵${booking.totalAmount.toFixed(2)}`
                  : "Confirm work & release payment"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

function Row({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.screen },
    centre: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(15),
      color: colors.text,
    },

    holdCard: {
      flexDirection: "row",
      gap: rS(11),
      marginTop: rV(16),
      padding: rS(14),
      borderRadius: rMS(14),
      backgroundColor: colors.successSoft,
    },
    holdCopy: { flex: 1, gap: rV(3) },
    holdAmount: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(15),
      color: colors.successText,
    },
    holdBody: {
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      lineHeight: rMS(19),
      color: colors.successText,
    },

    block: {
      marginTop: rV(22),
      paddingTop: rV(16),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      gap: rV(10),
    },
    blockTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: colors.text,
      marginBottom: rV(2),
    },
    row: { flexDirection: "row", alignItems: "flex-start", gap: rS(12) },
    rowLabel: {
      width: rS(92),
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      color: colors.textMuted,
    },
    rowValue: {
      flex: 1,
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.text,
      textTransform: "capitalize",
    },
    note: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      lineHeight: rMS(20),
      color: colors.textSecondary,
    },

    cancelLink: {
      marginTop: rV(26),
      textAlign: "center",
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.dangerText,
    },

    bar: {
      paddingHorizontal: rS(16),
      paddingTop: rV(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    cta: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: rV(15),
      borderRadius: rMS(13),
      backgroundColor: colors.inverseSurface,
    },
    ctaBusy: { opacity: 0.7 },
    ctaText: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14.5),
      color: colors.onInverseSurface,
    },
  });
}
