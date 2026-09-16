import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { Order, OrderPackage } from "@/hooks/useOrders";
import { rMS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type OrderPackagesCardProps = {
  order: Order;
  onConfirmPackage: (packageId: string) => void;
  onReportProblem: (packageId: string) => void;
  busyPackageId?: string | null;
};

type PackageTone = "neutral" | "info" | "success" | "warning" | "danger";

/**
 * What a customer sees when their order ships from more than one shop.
 *
 * Hidden entirely for single-shop orders, where the screen's existing status
 * card already says everything and a "1 of 1" list would be pure ceremony.
 *
 * Each shop gets its own row because each is genuinely independent: it has
 * its own rider, arrives on its own day, and is confirmed on its own. Showing
 * one shared status would be the interface telling the customer something
 * that is not true — which is exactly what the old single-status order did.
 */
export default function OrderPackagesCard({
  order,
  onConfirmPackage,
  onReportProblem,
  busyPackageId,
}: OrderPackagesCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const packages = order.packages ?? [];
  const live = packages.filter((pkg) => pkg.vendor_status !== "cancelled");

  const deliveredCount = live.filter((pkg) => pkg.delivery_status === "delivered").length;

  if (packages.length < 2) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {live.length} packages from {live.length} shops
        </Text>
        {deliveredCount > 0 ? (
          <Text style={styles.headerCount}>
            {deliveredCount} of {live.length} arrived
          </Text>
        ) : null}
      </View>
      <Text style={styles.subtitle}>
        Each shop delivers its own items, so they arrive separately. Confirm each
        one when it reaches you.
      </Text>

      {packages.map((pkg) => {
        const itemCount = pkg.item_ids?.length ?? 0;
        const status = describePackage(pkg);
        const canConfirm =
          pkg.delivery_status === "out_for_delivery" ||
          pkg.delivery_status === "customer_problem";
        const isBusy = busyPackageId === pkg.id;

        return (
          <View key={pkg.id} style={styles.packageRow}>
            <View style={styles.packageHead}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: toneBackground(colors, status.tone) },
                ]}
              >
                <Ionicons
                  name={status.icon}
                  size={rMS(16)}
                  color={toneForeground(colors, status.tone)}
                />
              </View>
              <View style={styles.packageCopy}>
                <Text style={styles.storeName} numberOfLines={1}>
                  {pkg.store_name ?? `Package ${pkg.package_number}`}
                </Text>
                <Text
                  style={[styles.statusLabel, { color: toneForeground(colors, status.tone) }]}
                >
                  {status.label}
                </Text>
                <Text style={styles.metaLine}>
                  {itemCount} {itemCount === 1 ? "item" : "items"} · GH₵
                  {pkg.items_subtotal.toFixed(2)}
                  {pkg.delivery_fee > 0
                    ? ` · GH₵${pkg.delivery_fee.toFixed(2)} delivery`
                    : " · free delivery"}
                </Text>
              </View>
            </View>

            {canConfirm ? (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.primaryAction, isBusy && styles.actionDisabled]}
                  activeOpacity={0.85}
                  disabled={isBusy}
                  onPress={() => onConfirmPackage(pkg.id)}
                >
                  {isBusy ? (
                    <ActivityIndicator size="small" color={colors.onPrimary} />
                  ) : (
                    <Text style={styles.primaryActionText}>I received this</Text>
                  )}
                </TouchableOpacity>
                {pkg.delivery_status === "out_for_delivery" ? (
                  <TouchableOpacity
                    style={styles.secondaryAction}
                    activeOpacity={0.85}
                    disabled={isBusy}
                    onPress={() => onReportProblem(pkg.id)}
                  >
                    <Text style={styles.secondaryActionText}>Report a problem</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function describePackage(pkg: OrderPackage): {
  label: string;
  tone: PackageTone;
  icon: keyof typeof Ionicons.glyphMap;
} {
  if (pkg.vendor_status === "cancelled") {
    return { label: "Cancelled by the shop", tone: "danger", icon: "close-circle-outline" };
  }
  switch (pkg.delivery_status) {
    case "delivered":
      return { label: "Delivered", tone: "success", icon: "checkmark-circle-outline" };
    case "out_for_delivery":
      return { label: "On the way to you", tone: "info", icon: "bicycle-outline" };
    case "customer_problem":
      return { label: "Problem reported — on hold", tone: "danger", icon: "alert-circle-outline" };
    case "rescheduled":
      return { label: "Rescheduled", tone: "warning", icon: "time-outline" };
    case "failed":
      return { label: "Delivery failed", tone: "danger", icon: "alert-circle-outline" };
    default:
      break;
  }
  // Still with the shop. The vendor stage is the more informative thing to
  // show here — "being packed" tells the customer more than "not dispatched".
  switch (pkg.vendor_status) {
    case "ready":
      return { label: "Packed, waiting for a rider", tone: "info", icon: "cube-outline" };
    case "processing":
      return { label: "Being packed", tone: "neutral", icon: "cube-outline" };
    case "confirmed":
      return { label: "Confirmed by the shop", tone: "neutral", icon: "cube-outline" };
    default:
      return { label: "Waiting for the shop", tone: "neutral", icon: "cube-outline" };
  }
}

function toneBackground(colors: ReturnType<typeof useTheme>["colors"], tone: PackageTone) {
  switch (tone) {
    case "success":
      return colors.successSoft;
    case "info":
      return colors.infoSoft;
    case "warning":
      return colors.warningSoft;
    case "danger":
      return colors.dangerSoft;
    default:
      return colors.accentSoft;
  }
}

function toneForeground(colors: ReturnType<typeof useTheme>["colors"], tone: PackageTone) {
  switch (tone) {
    case "success":
      return colors.successText;
    case "info":
      return colors.infoText;
    case "warning":
      return colors.warningText;
    case "danger":
      return colors.dangerText;
    default:
      return colors.textMuted;
  }
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: rMS(16),
      padding: rMS(14),
      gap: rV(4),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: rMS(8),
    },
    title: {
      fontFamily: Fonts.title,
      fontSize: rMS(14),
      color: colors.text,
      flex: 1,
    },
    headerCount: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: colors.textMuted,
    },
    subtitle: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: colors.textMuted,
      lineHeight: rMS(16),
      marginBottom: rV(6),
    },
    packageRow: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: rV(12),
      marginTop: rV(2),
      gap: rV(10),
    },
    packageHead: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: rMS(10),
    },
    iconWrap: {
      width: rMS(32),
      height: rMS(32),
      borderRadius: rMS(999),
      alignItems: "center",
      justifyContent: "center",
    },
    packageCopy: {
      flex: 1,
      gap: rV(2),
    },
    storeName: {
      fontFamily: Fonts.title,
      fontSize: rMS(13),
      color: colors.text,
    },
    statusLabel: {
      fontFamily: Fonts.textBold,
      fontSize: rMS(11),
    },
    metaLine: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: colors.textMuted,
    },
    actions: {
      flexDirection: "row",
      gap: rMS(8),
      paddingLeft: rMS(42),
    },
    primaryAction: {
      backgroundColor: colors.primary,
      paddingHorizontal: rMS(14),
      paddingVertical: rV(8),
      borderRadius: rMS(999),
      minWidth: rMS(120),
      alignItems: "center",
    },
    actionDisabled: {
      opacity: 0.6,
    },
    primaryActionText: {
      fontFamily: Fonts.title,
      fontSize: rMS(12),
      color: colors.onPrimary,
    },
    secondaryAction: {
      paddingHorizontal: rMS(12),
      paddingVertical: rV(8),
      borderRadius: rMS(999),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    secondaryActionText: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
    },
  });
}
