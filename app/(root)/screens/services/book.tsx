import ProfileHeader from "@/components/profile/ProfileHeader";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import {
  createBooking,
  fetchService,
  fetchServiceSlots,
  quoteBooking,
  startBookingCheckout,
} from "@/services/serviceMarketplaceService";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type {
  BookingQuote,
  ServiceDetail,
  ServiceLocationMode,
  ServiceSlot,
} from "@/types/service";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Pick a time, confirm the details, pay.
 *
 * The fields shown adapt to the service: an online tutor is never asked for
 * a street address, and a service with no appointment length never shows a
 * calendar. Asking for information the booking cannot use is the fastest
 * way to make a short flow feel long.
 *
 * Slots come from the backend for the *chosen configuration*, so a Premium
 * package with two extra hours is offered only times it actually fits into.
 */

const DAYS_TO_OFFER = 14;

const LOCATION_LABELS: Record<ServiceLocationMode, string> = {
  provider: "At the provider",
  customer: "They come to me",
  remote: "Online",
  agreed: "We'll agree",
};

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BookServiceScreen() {
  const params = useLocalSearchParams<{
    serviceId?: string;
    packageId?: string;
    addons?: string;
  }>();
  const serviceId = Array.isArray(params.serviceId)
    ? params.serviceId[0]
    : params.serviceId;
  const packageId =
    (Array.isArray(params.packageId) ? params.packageId[0] : params.packageId) || undefined;

  const selectedAddons = useMemo(() => {
    const raw = Array.isArray(params.addons) ? params.addons[0] : params.addons;
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as { addonId: string; quantity: number }[];
    } catch {
      return [];
    }
  }, [params.addons]);

  const { colors } = useTheme();
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAYS_TO_OFFER }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
  }, []);

  const [activeDay, setActiveDay] = useState<string>(() => toDayKey(new Date()));

  /**
   * Slots cached per day, which does three things at once: it stops the
   * effect setting any state synchronously (the cascading-render rule),
   * it derives "loading" from the absence of an entry rather than a second
   * flag, and flipping back to a day already looked at costs no request.
   */
  const [slotsByDay, setSlotsByDay] = useState<Record<string, ServiceSlot[]>>({});
  const slots = slotsByDay[activeDay];
  const isLoadingSlots = slots === undefined;

  /**
   * The chosen slot, tagged with the day it was chosen on.
   *
   * Clearing the selection in an effect when the day changes would be
   * another synchronous setState; tagging it means a selection simply stops
   * applying once the reader moves to a different day.
   */
  const [selection, setSelection] = useState<{ day: string; slot: ServiceSlot } | null>(
    null,
  );
  const selectedSlot = selection && selection.day === activeDay ? selection.slot : null;

  const [locationMode, setLocationMode] = useState<ServiceLocationMode | null>(null);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!serviceId) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const [detail, priced] = await Promise.all([
          fetchService(serviceId),
          quoteBooking(serviceId, { packageId, addons: selectedAddons }),
        ]);
        if (cancelled) {
          return;
        }
        setService(detail);
        setQuote(priced);
        const modes = detail.locationModes ?? [];
        if (modes.length === 1) {
          setLocationMode(modes[0]);
        }
      } catch (err) {
        if (!cancelled) {
          showToast(
            err instanceof Error ? err.message : "We couldn't load that service.",
            "error",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  useEffect(() => {
    if (!serviceId || !service) {
      return;
    }
    if (slotsByDay[activeDay] !== undefined) {
      return;
    }
    let cancelled = false;
    void fetchServiceSlots(serviceId, {
      day: activeDay,
      packageId,
      addonIds: selectedAddons.flatMap((a) =>
        Array.from({ length: a.quantity }, () => a.addonId),
      ),
    })
      .then((result) => {
        if (!cancelled) {
          setSlotsByDay((current) => ({ ...current, [activeDay]: result }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          // An empty day and a failed lookup read the same to the customer;
          // both mean "pick another day".
          setSlotsByDay((current) => ({ ...current, [activeDay]: [] }));
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay, service, serviceId]);

  const needsAddress = locationMode === "customer";
  const locationModes = service?.locationModes ?? [];
  const canSubmit =
    Boolean(selectedSlot) &&
    (locationModes.length === 0 || Boolean(locationMode)) &&
    (!needsAddress || address.trim().length > 0);

  const handleSubmit = useCallback(async () => {
    if (!service || !selectedSlot || !accessToken) {
      return;
    }
    setIsSubmitting(true);
    try {
      const booking = await createBooking(service.id, accessToken, {
        packageId,
        addons: selectedAddons,
        startAt: selectedSlot.startAt,
        locationMode: locationMode ?? undefined,
        locationAddress: needsAddress ? address.trim() : undefined,
        customerNote: note.trim() || undefined,
      });

      // A request-type booking waits for the provider before any money is
      // taken, so there is nothing to pay for yet.
      if (booking.status !== "pending_payment") {
        router.replace({
          pathname: "/(root)/screens/services/booking/[bookingId]" as never,
          params: { bookingId: booking.id },
        });
        return;
      }

      const checkout = await startBookingCheckout(booking.id, accessToken, {
        callbackUrl: "odosmobileexpo://payments/return",
      });
      await Linking.openURL(checkout.authorizationUrl);
      router.replace({
        pathname: "/(root)/screens/services/booking/[bookingId]" as never,
        params: { bookingId: booking.id },
      });
    } catch (err) {
      // A lost slot comes back as a 409 with a readable message; surfacing
      // it verbatim tells the customer to pick another time rather than
      // leaving them staring at a failed request.
      showToast(
        err instanceof Error ? err.message : "We couldn't complete that booking.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    accessToken,
    address,
    locationMode,
    needsAddress,
    note,
    packageId,
    selectedAddons,
    selectedSlot,
    service,
    showToast,
  ]);

  if (isLoading || !service) {
    return (
      <View style={styles.screen}>
        <ProfileHeader title="Book" />
        <View style={styles.centre}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Book" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: insets.bottom + rV(110),
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.serviceName}>{service.title}</Text>
        {quote ? (
          <Text style={styles.serviceMeta}>
            {quote.durationMinutes} min · ₵{quote.totalAmount.toFixed(2)}
          </Text>
        ) : null}

        <Text style={styles.sectionTitle}>Pick a day</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayRow}
        >
          {days.map((date) => {
            const key = toDayKey(date);
            const active = key === activeDay;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.85}
                onPress={() => setActiveDay(key)}
              >
                <View style={[styles.day, active && styles.dayActive]}>
                  <Text style={[styles.dayText, active && styles.dayTextActive]}>
                    {formatDayLabel(date)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Pick a time</Text>
        {isLoadingSlots ? (
          <View style={styles.slotsLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : slots.length === 0 ? (
          <Text style={styles.emptySlots}>
            No times available that day. Try another.
          </Text>
        ) : (
          <View style={styles.slotGrid}>
            {slots.map((slot) => {
              const active = selectedSlot?.startAt === slot.startAt;
              return (
                <TouchableOpacity
                  key={slot.startAt}
                  activeOpacity={0.85}
                  onPress={() => setSelection({ day: activeDay, slot })}
                >
                  <View style={[styles.slot, active && styles.slotActive]}>
                    <Text style={[styles.slotText, active && styles.slotTextActive]}>
                      {formatTime(slot.startAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {locationModes.length > 1 ? (
          <>
            <Text style={styles.sectionTitle}>Where?</Text>
            <View style={styles.modeRow}>
              {locationModes.map((mode) => {
                const active = locationMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    activeOpacity={0.85}
                    onPress={() => setLocationMode(mode)}
                  >
                    <View style={[styles.mode, active && styles.modeActive]}>
                      <Text style={[styles.modeText, active && styles.modeTextActive]}>
                        {LOCATION_LABELS[mode]}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : null}

        {/* Only when someone actually has to travel to an address. */}
        {needsAddress ? (
          <>
            <Text style={styles.sectionTitle}>Your address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Where should the provider come?"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              multiline
            />
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Anything they should know?</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Optional"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />

        {service.paymentTiming === "upfront" ? (
          <View style={styles.escrowNote}>
            <Ionicons
              name="shield-checkmark-outline"
              size={rMS(16)}
              color={colors.successText}
            />
            <Text style={styles.escrowText}>
              You pay now and Odos holds the money. The provider is paid only
              after you confirm the work.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, rV(10)) }]}>
        <View style={styles.barCopy}>
          <Text style={styles.barLabel}>Total</Text>
          <Text style={styles.barAmount}>
            {quote ? `₵${quote.totalAmount.toFixed(2)}` : "—"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.cta, (!canSubmit || isSubmitting) && styles.ctaDisabled]}
          activeOpacity={0.9}
          disabled={!canSubmit || isSubmitting}
          onPress={() => void handleSubmit()}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.onInverseSurface} />
          ) : (
            <Text style={styles.ctaText}>
              {service.bookingType === "request" ? "Send request" : "Pay & book"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.screen },
    centre: { flex: 1, alignItems: "center", justifyContent: "center" },

    serviceName: {
      marginTop: rV(14),
      fontFamily: Fonts.titleBold,
      fontSize: rMS(17),
      color: colors.text,
    },
    serviceMeta: {
      marginTop: rV(3),
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      color: colors.textMuted,
    },

    sectionTitle: {
      marginTop: rV(22),
      marginBottom: rV(10),
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: colors.text,
    },

    dayRow: { gap: rS(8) },
    day: {
      paddingHorizontal: rS(14),
      paddingVertical: rV(10),
      borderRadius: rMS(10),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    dayActive: { backgroundColor: colors.inverseSurface, borderColor: colors.inverseSurface },
    dayText: { fontFamily: Fonts.titleBold, fontSize: rMS(12.5), color: colors.text },
    dayTextActive: { color: colors.onInverseSurface },

    slotsLoading: { paddingVertical: rV(20), alignItems: "center" },
    emptySlots: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      color: colors.textMuted,
      paddingVertical: rV(10),
    },
    slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: rS(8) },
    slot: {
      paddingHorizontal: rS(14),
      paddingVertical: rV(10),
      borderRadius: rMS(10),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    slotActive: { backgroundColor: colors.inverseSurface, borderColor: colors.inverseSurface },
    slotText: { fontFamily: Fonts.titleBold, fontSize: rMS(12.5), color: colors.text },
    slotTextActive: { color: colors.onInverseSurface },

    modeRow: { flexDirection: "row", flexWrap: "wrap", gap: rS(8) },
    mode: {
      paddingHorizontal: rS(14),
      paddingVertical: rV(10),
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    modeActive: { backgroundColor: colors.inverseSurface, borderColor: colors.inverseSurface },
    modeText: { fontFamily: Fonts.titleBold, fontSize: rMS(12.5), color: colors.text },
    modeTextActive: { color: colors.onInverseSurface },

    input: {
      minHeight: rV(70),
      textAlignVertical: "top",
      paddingHorizontal: rS(14),
      paddingVertical: rV(12),
      borderRadius: rMS(12),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBg,
      fontFamily: Fonts.text,
      fontSize: rMS(13.5),
      color: colors.text,
    },

    escrowNote: {
      flexDirection: "row",
      gap: rS(9),
      marginTop: rV(22),
      padding: rS(13),
      borderRadius: rMS(12),
      backgroundColor: colors.successSoft,
    },
    escrowText: {
      flex: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      lineHeight: rMS(19),
      color: colors.successText,
    },

    bar: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(14),
      paddingHorizontal: rS(16),
      paddingTop: rV(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    barCopy: { flex: 1, minWidth: 0 },
    barLabel: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    barAmount: { fontFamily: Fonts.titleBold, fontSize: rMS(19), color: colors.text },
    cta: {
      minWidth: rS(150),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: rS(20),
      paddingVertical: rV(14),
      borderRadius: rMS(13),
      backgroundColor: colors.inverseSurface,
    },
    ctaDisabled: { opacity: 0.45 },
    ctaText: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: colors.onInverseSurface,
    },
  });
}
