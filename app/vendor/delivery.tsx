import TextInputField from "@/components/TextInputField";
import KeyboardAwareScreen from "@/components/layout/KeyboardAwareScreen";
import { AccountSettingToggle } from "@/components/profile/ProfileHubUi";
import {
  AccountActionButton,
  AccountSectionCard,
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import {
  fetchVendorDeliverySettings,
  updateVendorDeliverySettings,
  type VendorDeliverySettings,
} from "@/services/vendorService";
import { rMS, rV, useResponsive } from "@/styles/responsive";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Where a shop sets what it charges to deliver.
 *
 * The shop sets the price because the shop pays the rider. A single
 * platform-wide fee was a number chosen by the one party not buying the
 * fuel — it overcharged the shop delivering two streets away and underpaid
 * the one crossing Accra.
 *
 * Every field is optional. Left blank, it uses the ODOS default shown as the
 * placeholder, which is exactly how the shop priced before this screen
 * existed.
 */

/** "" means "use the ODOS default"; "0" means "I charge nothing". */
function parseFeeInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInput(value: number | null): string {
  return value === null || value === undefined ? "" : String(value);
}

export default function VendorDeliveryPricingScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();

  const [settings, setSettings] = useState<VendorDeliverySettings | null>(null);
  // Starts true so the shell shows its loader on first paint, rather than
  // flashing an empty form for a frame before the fetch is kicked off.
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [economy, setEconomy] = useState("");
  const [express, setExpress] = useState("");
  const [sameDay, setSameDay] = useState("");
  const [threshold, setThreshold] = useState("");
  const [expressEnabled, setExpressEnabled] = useState(true);
  const [sameDayEnabled, setSameDayEnabled] = useState(true);

  const applySettings = useCallback((next: VendorDeliverySettings) => {
    setSettings(next);
    setEconomy(toInput(next.economyFee));
    setExpress(toInput(next.expressFee));
    setSameDay(toInput(next.sameDayFee));
    setThreshold(toInput(next.freeDeliveryThreshold));
    setExpressEnabled(next.expressEnabled);
    setSameDayEnabled(next.sameDayEnabled);
  }, []);

  useEffect(() => {
    if (!hasVendorAccess) {
      return;
    }
    let cancelled = false;
    // State is only touched from the promise callbacks below, never
    // synchronously in the effect body — a synchronous setState here would
    // schedule a second render before the first has even painted.
    void fetchVendorDeliverySettings(session)
      .then((next) => {
        if (cancelled || !next) {
          return;
        }
        applySettings(next);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Couldn't load your delivery prices.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [applySettings, hasVendorAccess, session]);

  const validationError = useMemo(() => {
    if (!settings) {
      return null;
    }
    const fields: [string, string][] = [
      [economy, "Standard"],
      [express, "Express"],
      [sameDay, "Same-day"],
    ];
    for (const [raw, label] of fields) {
      if (!raw.trim()) {
        continue;
      }
      const value = Number(raw.trim());
      if (!Number.isFinite(value) || value < 0) {
        return `${label} delivery needs to be a number, or blank to use the ODOS price.`;
      }
      if (value > settings.maxFee) {
        return `${label} delivery can't be more than GH₵${settings.maxFee.toFixed(0)}.`;
      }
    }
    if (threshold.trim()) {
      const value = Number(threshold.trim());
      if (!Number.isFinite(value) || value < 0) {
        return "Free delivery threshold needs to be a number, or blank for the ODOS default.";
      }
      if (value > settings.maxFreeDeliveryThreshold) {
        return `A threshold above GH₵${settings.maxFreeDeliveryThreshold.toFixed(
          0,
        )} isn't an offer anyone can use.`;
      }
    }
    return null;
  }, [economy, express, sameDay, settings, threshold]);

  /** What a shopper will see on the store card once this saves. */
  const previewBadge = useMemo(() => {
    if (!settings) {
      return null;
    }
    const thresholdValue = parseFeeInput(threshold) ?? settings.defaultFreeDeliveryThreshold;
    const economyValue = parseFeeInput(economy) ?? settings.defaultEconomyFee;
    if (thresholdValue <= 0 || economyValue <= 0) {
      return "Free delivery";
    }
    return `Free over GH₵${thresholdValue.toFixed(0)}`;
  }, [economy, settings, threshold]);

  const handleSave = useCallback(async () => {
    if (validationError) {
      showToast(validationError, "error");
      return;
    }
    setIsSaving(true);
    try {
      const next = await updateVendorDeliverySettings(session, {
        economyFee: parseFeeInput(economy),
        expressFee: parseFeeInput(express),
        sameDayFee: parseFeeInput(sameDay),
        freeDeliveryThreshold: parseFeeInput(threshold),
        expressEnabled,
        sameDayEnabled,
      });
      if (next) {
        applySettings(next);
      }
      showToast("Delivery prices updated.", "success");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Couldn't save your delivery prices.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    applySettings,
    economy,
    express,
    expressEnabled,
    sameDay,
    sameDayEnabled,
    session,
    showToast,
    threshold,
    validationError,
  ]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <VendorScreenShell
      title="Delivery pricing"
      loading={isCheckingVendorAccess || isLoading}
      loadingLabel="Loading your delivery prices..."
    >
      <KeyboardAwareScreen
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          vendorStyles.content,
          { paddingBottom: insets.bottom + rV(36) },
        ]}
      >
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
        <VendorPageIntro
          title="You set the price, you keep the fee"
          subtitle="You pay your own rider, so the delivery fee on your orders comes to you — on top of the goods, with no commission taken from it."
          error={error ?? undefined}
        />

        <View style={styles.explainerCard}>
          <Text style={styles.explainerTitle}>How this works</Text>
          <Text style={styles.explainerBody}>
            Leave a price blank to use the ODOS default shown in the box. Set 0 to
            deliver free. Anything you change applies to new orders only — orders
            already placed keep the price the customer was quoted.
          </Text>
          {previewBadge ? (
            <View style={styles.badgePreviewRow}>
              <Text style={styles.explainerBody}>Shoppers will see</Text>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{previewBadge}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <AccountSectionCard title="Your delivery fees">
          <TextInputField
            label="Standard delivery (GH₵)"
            icon="bicycle-outline"
            keyboardType="decimal-pad"
            value={economy}
            onChangeText={setEconomy}
            placeholder={settings ? settings.defaultEconomyFee.toFixed(2) : "19.00"}
            helperText={`ODOS default: GH₵${(settings?.defaultEconomyFee ?? 19).toFixed(2)}`}
          />
          <TextInputField
            label="Express delivery (GH₵)"
            icon="flash-outline"
            keyboardType="decimal-pad"
            value={express}
            onChangeText={setExpress}
            placeholder={settings ? settings.defaultExpressFee.toFixed(2) : "29.00"}
            helperText={`ODOS default: GH₵${(settings?.defaultExpressFee ?? 29).toFixed(2)}`}
          />
          <TextInputField
            label="Same-day delivery (GH₵)"
            icon="time-outline"
            keyboardType="decimal-pad"
            value={sameDay}
            onChangeText={setSameDay}
            placeholder={settings ? settings.defaultSameDayFee.toFixed(2) : "49.00"}
            helperText={`ODOS default: GH₵${(settings?.defaultSameDayFee ?? 49).toFixed(2)}`}
          />
        </AccountSectionCard>

        <AccountSectionCard title="Free delivery">
          <TextInputField
            label="Deliver free on orders above (GH₵)"
            icon="gift-outline"
            keyboardType="decimal-pad"
            value={threshold}
            onChangeText={setThreshold}
            placeholder={
              settings ? settings.defaultFreeDeliveryThreshold.toFixed(2) : "299.00"
            }
            helperText="Set 0 to always deliver free — that earns your store a 'Free delivery' badge, which is the strongest thing a shop can put on its card."
          />
        </AccountSectionCard>

        <AccountSectionCard title="What you can deliver">
          <AccountSettingToggle
            title="Offer express delivery"
            description="Turn off if you can't reliably deliver within 1–2 days. Customers with your items in their cart then won't see express at all."
            value={expressEnabled}
            onValueChange={setExpressEnabled}
          />
          <AccountSettingToggle
            title="Offer same-day delivery"
            description="Only available in the areas ODOS covers. Turn off if you can't get items out the same day."
            value={sameDayEnabled}
            onValueChange={setSameDayEnabled}
            isLast
          />
        </AccountSectionCard>

        {validationError ? (
          <Text style={styles.validationText}>{validationError}</Text>
        ) : null}

        <AccountActionButton
          label={isSaving ? "Saving..." : "Save delivery prices"}
          variant="primary"
          disabled={isSaving || !!validationError}
          onPress={handleSave}
        />
        </View>
      </KeyboardAwareScreen>
    </VendorScreenShell>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    explainerCard: {
      backgroundColor: colors.infoSoft,
      borderColor: colors.infoBorder,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: rMS(14),
      padding: rMS(14),
      gap: rV(6),
    },
    explainerTitle: {
      fontFamily: Fonts.title,
      fontSize: rMS(13),
      color: colors.infoText,
    },
    explainerBody: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.infoText,
      lineHeight: rMS(18),
    },
    badgePreviewRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rMS(8),
      marginTop: rV(4),
    },
    badgePill: {
      backgroundColor: colors.successSoft,
      paddingHorizontal: rMS(10),
      paddingVertical: rV(4),
      borderRadius: rMS(999),
    },
    badgePillText: {
      fontFamily: Fonts.title,
      fontSize: rMS(11),
      color: colors.successText,
    },
    validationText: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.dangerText,
    },
  });
}
