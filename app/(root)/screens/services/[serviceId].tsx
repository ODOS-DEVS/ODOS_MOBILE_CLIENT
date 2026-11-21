import ProductGallery from "@/components/product/ProductGallery";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import {
  createBooking,
  fetchService,
  quoteBooking,
} from "@/services/serviceMarketplaceService";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import {
  formatPriceLabel,
  needsSlotSelection,
  primaryActionLabel,
  type BookingQuote,
  type ServiceDetail,
} from "@/types/service";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * A service listing.
 *
 * Two rules drive the whole screen:
 *
 *   1. The primary action comes from `bookingType`, never from the screen.
 *      A quote-only service must never offer "Book now", and deciding that
 *      here rather than per-button is what guarantees it.
 *   2. Every figure shown is the backend's. Selecting a package or an extra
 *      re-quotes against the server rather than adding numbers locally —
 *      the total the customer reads is the total they will be charged.
 */

export default function ServiceDetailScreen() {
  const params = useLocalSearchParams<{ serviceId?: string }>();
  const serviceId = Array.isArray(params.serviceId)
    ? params.serviceId[0]
    : params.serviceId;

  const { colors } = useTheme();
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [packageId, setPackageId] = useState<string | null>(null);
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!serviceId) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const detail = await fetchService(serviceId);
        if (cancelled) {
          return;
        }
        setService(detail);
        // Preselect the cheapest package so the price shown is real rather
        // than a dash until the customer happens to tap something.
        if (detail.pricingModel === "package" && detail.packages.length > 0) {
          const cheapest = [...detail.packages].sort((a, b) => a.price - b.price)[0];
          setPackageId(cheapest.id);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "We couldn't load this service.",
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
  }, [serviceId]);

  const selectedAddons = useMemo(
    () =>
      Object.entries(addonQty)
        .filter(([, qty]) => qty > 0)
        .map(([addonId, quantity]) => ({ addonId, quantity })),
    [addonQty],
  );

  // Re-price on the server whenever the configuration changes. Nothing is
  // summed locally, so the figure on screen is the figure that will be
  // charged.
  useEffect(() => {
    if (!service || service.pricingModel === "quote") {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsQuoting(true);
      void quoteBooking(service.id, {
        packageId: packageId ?? undefined,
        addons: selectedAddons,
      })
        .then((result) => {
          if (!cancelled) {
            setQuote(result);
          }
        })
        .catch(() => {
          // Leave the last good quote on screen rather than blanking the
          // price because one re-quote failed.
        })
        .finally(() => {
          if (!cancelled) {
            setIsQuoting(false);
          }
        });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [service, packageId, selectedAddons]);

  const handlePrimaryAction = useCallback(async () => {
    if (!service) {
      return;
    }
    if (!accessToken) {
      showToast("Sign in to book a service.", "error");
      return;
    }

    // Quote and consultation services never book directly — they open a
    // conversation instead.
    if (service.bookingType === "quote" || service.bookingType === "consultation") {
      router.push({
        pathname: "/(root)/screens/services/quote" as never,
        params: { serviceId: service.id },
      });
      return;
    }

    if (needsSlotSelection(service.bookingType)) {
      router.push({
        pathname: "/(root)/screens/services/book" as never,
        params: {
          serviceId: service.id,
          packageId: packageId ?? "",
          addons: JSON.stringify(selectedAddons),
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = await createBooking(service.id, accessToken, {
        packageId: packageId ?? undefined,
        addons: selectedAddons,
      });
      router.push({
        pathname: "/(root)/screens/services/booking/[bookingId]" as never,
        params: { bookingId: booking.id },
      });
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "We couldn't create that booking.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [accessToken, packageId, selectedAddons, service, showToast]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ProfileHeader title="Service" />
        <View style={styles.centre}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (loadError || !service) {
    return (
      <View style={styles.screen}>
        <ProfileHeader title="Service" />
        <View style={styles.centre}>
          <Ionicons name="cube-outline" size={rMS(34)} color={colors.iconMuted} />
          <Text style={styles.emptyTitle}>
            {loadError ?? "This service is not available"}
          </Text>
        </View>
      </View>
    );
  }

  const galleryImages = service.images
    .filter((image) => image.imageUrl)
    .map((image) => ({ uri: image.imageUrl as string }));

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Service" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + rV(110) }}
      >
        <ProductGallery
          images={galleryImages}
          activeIndex={activeImage}
          onActiveIndexChange={setActiveImage}
          onPressImage={() => undefined}
          idPrefix={`service-${service.id}`}
          horizontalPadding={horizontalPadding}
          topInset={0}
        />

        <View style={[styles.body, { paddingHorizontal: horizontalPadding }]}>
          <Text style={styles.title}>{service.title}</Text>

          <View style={styles.metaLine}>
            <Text style={styles.price}>{formatPriceLabel(service)}</Text>
            {service.rating ? (
              <>
                <Text style={styles.dim}>·</Text>
                <Ionicons name="star" size={rMS(13)} color={colors.warningText} />
                <Text style={styles.dim}>
                  {service.rating.toFixed(1)} ({service.reviewCount})
                </Text>
              </>
            ) : null}
            {service.durationMinutes ? (
              <>
                <Text style={styles.dim}>·</Text>
                <Text style={styles.dim}>{service.durationMinutes} min</Text>
              </>
            ) : null}
          </View>

          {service.description ? (
            <Text style={styles.description}>{service.description}</Text>
          ) : null}

          {service.packages.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose a package</Text>
              {service.packages.map((pkg) => {
                const active = packageId === pkg.id;
                return (
                  <TouchableOpacity
                    key={pkg.id}
                    activeOpacity={0.85}
                    onPress={() => setPackageId(pkg.id)}
                  >
                    <View style={[styles.option, active && styles.optionActive]}>
                      <View style={styles.optionCopy}>
                        <Text style={styles.optionTitle}>{pkg.title}</Text>
                        {pkg.inclusions?.length ? (
                          <Text style={styles.optionBody} numberOfLines={3}>
                            {pkg.inclusions.join(" · ")}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={styles.optionPrice}>₵{pkg.price.toFixed(2)}</Text>
                      <Ionicons
                        name={active ? "radio-button-on" : "radio-button-off"}
                        size={rMS(18)}
                        color={active ? colors.text : colors.iconMuted}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {service.addons.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add extras</Text>
              {service.addons.map((addon) => {
                const qty = addonQty[addon.id] ?? 0;
                return (
                  <View key={addon.id} style={styles.option}>
                    <View style={styles.optionCopy}>
                      <Text style={styles.optionTitle}>{addon.title}</Text>
                      <Text style={styles.optionBody}>
                        ₵{addon.price.toFixed(2)}
                        {addon.durationMinutes
                          ? ` · +${addon.durationMinutes} min`
                          : ""}
                      </Text>
                    </View>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        hitSlop={8}
                        disabled={qty === 0}
                        onPress={() =>
                          setAddonQty((current) => ({
                            ...current,
                            [addon.id]: Math.max(0, qty - 1),
                          }))
                        }
                      >
                        <Ionicons
                          name="remove"
                          size={rMS(16)}
                          color={qty === 0 ? colors.iconMuted : colors.text}
                        />
                      </TouchableOpacity>
                      <Text style={styles.stepperValue}>{qty}</Text>
                      <TouchableOpacity
                        hitSlop={8}
                        disabled={qty >= addon.maxQuantity}
                        onPress={() =>
                          setAddonQty((current) => ({
                            ...current,
                            [addon.id]: Math.min(addon.maxQuantity, qty + 1),
                          }))
                        }
                      >
                        <Ionicons
                          name="add"
                          size={rMS(16)}
                          color={
                            qty >= addon.maxQuantity ? colors.iconMuted : colors.text
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {service.cancellationPolicy ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cancellation</Text>
              <Text style={styles.description}>{service.cancellationPolicy}</Text>
            </View>
          ) : null}

          {/* Stated plainly, because it is the reason a customer should feel
              safe paying in full before the work happens. */}
          {service.paymentTiming === "upfront" ? (
            <View style={styles.escrowNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={rMS(16)}
                color={colors.successText}
              />
              <Text style={styles.escrowText}>
                Odos holds your payment and only releases it to the provider
                once you confirm the work is done.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, rV(10)) }]}>
        <View style={styles.barCopy}>
          <Text style={styles.barLabel}>
            {service.pricingModel === "quote" ? "Price" : "Total"}
          </Text>
          <Text style={styles.barAmount}>
            {service.pricingModel === "quote"
              ? "On request"
              : quote
                ? `₵${quote.totalAmount.toFixed(2)}`
                : formatPriceLabel(service)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.cta, (isSubmitting || isQuoting) && styles.ctaBusy]}
          activeOpacity={0.9}
          disabled={isSubmitting}
          onPress={() => void handlePrimaryAction()}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.onInverseSurface} />
          ) : (
            <Text style={styles.ctaText}>
              {primaryActionLabel(service.bookingType)}
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
    centre: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: rV(10),
      paddingHorizontal: rS(32),
    },
    emptyTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(15),
      color: colors.text,
      textAlign: "center",
    },

    body: { paddingTop: rV(16), gap: rV(6) },
    title: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(21),
      lineHeight: rMS(28),
      color: colors.text,
    },
    metaLine: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: rS(6),
      marginTop: rV(4),
    },
    price: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(15),
      color: colors.text,
    },
    dim: { fontFamily: Fonts.text, fontSize: rMS(12.5), color: colors.textMuted },
    description: {
      fontFamily: Fonts.text,
      fontSize: rMS(13.5),
      lineHeight: rMS(21),
      color: colors.textSecondary,
      marginTop: rV(8),
    },

    section: {
      marginTop: rV(20),
      paddingTop: rV(16),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      gap: rV(10),
    },
    sectionTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14.5),
      color: colors.text,
    },

    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(12),
      paddingHorizontal: rS(14),
      paddingVertical: rV(13),
      borderRadius: rMS(12),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    optionActive: { borderColor: colors.text, borderWidth: 1.5 },
    optionCopy: { flex: 1, minWidth: 0, gap: rV(3) },
    optionTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13.5),
      color: colors.text,
    },
    optionBody: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      lineHeight: rMS(18),
      color: colors.textMuted,
    },
    optionPrice: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.text,
    },

    stepper: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(12),
      paddingHorizontal: rS(10),
      paddingVertical: rV(6),
      borderRadius: rMS(9),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
    },
    stepperValue: {
      minWidth: rS(16),
      textAlign: "center",
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.text,
    },

    escrowNote: {
      flexDirection: "row",
      gap: rS(9),
      marginTop: rV(20),
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
    barAmount: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(19),
      color: colors.text,
    },
    cta: {
      minWidth: rS(150),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: rS(20),
      paddingVertical: rV(14),
      borderRadius: rMS(13),
      backgroundColor: colors.inverseSurface,
    },
    ctaBusy: { opacity: 0.7 },
    ctaText: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: colors.onInverseSurface,
    },
  });
}
