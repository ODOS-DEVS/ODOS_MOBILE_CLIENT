import ScreenLoader from "@/components/loaders/ScreenLoader";
import { AccountBadge, AccountEmptyState, AccountListCard } from "@/components/account/AccountUi";
import { formatVendorCurrency, VendorScreenShell } from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { fetchVendorReturn, updateVendorReturn } from "@/services/storeService";
import type { VendorReturnRequest } from "@/types/store";
import {
  formatVendorReturnStatus,
  formatVendorReturnType,
} from "@/utils/vendorReturns";
import { resolveApiMediaUrl } from "@/utils/media";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function VendorReturnDetailScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ returnId?: string | string[] }>();
  const returnId = getParam(params.returnId);
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const [item, setItem] = useState<VendorReturnRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReturn = useCallback(async () => {
    if (!hasVendorAccess || !returnId) {
      return;
    }

    setError(null);
    try {
      const next = await fetchVendorReturn(session, returnId);
      setItem(next);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "We couldn't load this return request.",
      );
      setItem(null);
    } finally {
      setIsLoading(false);
    }
  }, [hasVendorAccess, returnId, session]);

  useEffect(() => {
    setIsLoading(true);
    void loadReturn();
  }, [loadReturn]);

  const handleStatusUpdate = useCallback(
    async (status: string) => {
      if (!returnId) {
        return;
      }
      setIsUpdating(true);
      try {
        const next = await updateVendorReturn(session, returnId, { status });
        setItem(next);
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "We couldn't update this return request.",
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [returnId, session],
  );

  if (isCheckingVendorAccess) {
    return (
      <VendorScreenShell title="Return detail" loading loadingLabel="Loading return..." />
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  if (isLoading) {
    return (
      <VendorScreenShell title="Return detail">
        <View style={styles.loaderWrap}>
          <ScreenLoader label="Loading return request" />
        </View>
      </VendorScreenShell>
    );
  }

  if (error || !item) {
    return (
      <VendorScreenShell title="Return detail">
        <AccountEmptyState
          icon="alert-circle-outline"
          title="Return not found"
          message={error ?? "This return request could not be loaded."}
          actionLabel="Try again"
          onAction={() => {
            setIsLoading(true);
            void loadReturn();
          }}
        />
      </VendorScreenShell>
    );
  }

  const imageUri = resolveApiMediaUrl(item.productImageUrl) ?? item.productImageUrl;

  return (
    <VendorScreenShell title="Return detail">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + rV(28),
            maxWidth: contentMaxWidth,
            alignSelf: "center",
            width: "100%",
          },
        ]}
      >
        <AccountListCard style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
                {formatVendorReturnType(item.requestType)}
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>{item.productTitle}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {item.orderNumber} · Qty {item.quantity}
              </Text>
            </View>
            <AccountBadge label={formatVendorReturnStatus(item.status)} tone="warning" />
          </View>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}
        </AccountListCard>

        <AccountListCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Request details</Text>
          <DetailRow label="Customer" value={item.customerName || "ODOS Customer"} colors={colors} />
          <DetailRow label="Reason" value={item.reason} colors={colors} />
          {item.details ? (
            <DetailRow label="Details" value={item.details} colors={colors} />
          ) : null}
          {item.refundAmount != null ? (
            <DetailRow
              label="Refund amount"
              value={formatVendorCurrency(item.refundAmount)}
              colors={colors}
            />
          ) : null}
          {item.adminNote ? (
            <DetailRow label="Admin note" value={item.adminNote} colors={colors} />
          ) : null}
        </AccountListCard>

        {item.evidenceImageUrls && item.evidenceImageUrls.length > 0 ? (
          <AccountListCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Evidence photos</Text>
            <View style={styles.evidenceGrid}>
              {item.evidenceImageUrls.map((uri) => {
                const resolved = resolveApiMediaUrl(uri) ?? uri;
                return <Image key={resolved} source={{ uri: resolved }} style={styles.evidenceImage} />;
              })}
            </View>
          </AccountListCard>
        ) : null}

        {item.status === "requested" || item.status === "under_review" ? (
          <AccountListCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Take action</Text>
            <View style={styles.actionRow}>
              <ActionButton
                label="Reviewing"
                colors={colors}
                disabled={isUpdating}
                onPress={() => void handleStatusUpdate("under_review")}
              />
              <ActionButton
                label="Approve"
                colors={colors}
                primary
                disabled={isUpdating}
                onPress={() => void handleStatusUpdate("approved")}
              />
              <ActionButton
                label="Decline"
                colors={colors}
                disabled={isUpdating}
                onPress={() => void handleStatusUpdate("rejected")}
              />
            </View>
          </AccountListCard>
        ) : null}

        {item.status === "approved" ? (
          <AccountListCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Refund customer</Text>
            <Text style={[styles.footerNote, { color: colors.textMuted, marginBottom: rV(10) }]}>
              Mark refunded after the customer receives their money or wallet credit.
            </Text>
            <ActionButton
              label={isUpdating ? "Updating…" : "Mark refunded"}
              colors={colors}
              primary
              disabled={isUpdating}
              onPress={() => void handleStatusUpdate("refunded")}
            />
          </AccountListCard>
        ) : null}

        <Text style={[styles.footerNote, { color: colors.textMuted }]}>
          Customers are notified automatically when you update a return request.
        </Text>
      </ScrollView>
    </VendorScreenShell>
  );
}

function ActionButton({
  label,
  colors,
  primary = false,
  disabled = false,
  onPress,
}: {
  label: string;
  colors: { text: string; onPrimary: string; card: string; border: string };
  primary?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        {
          backgroundColor: primary ? colors.text : colors.card,
          borderColor: colors.border,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      disabled={disabled}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <Text style={{ color: primary ? colors.onPrimary : colors.text, fontFamily: Fonts.textBold }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DetailRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { text: string; textMuted: string };
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: rS(16),
    gap: rV(14),
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    minHeight: rV(220),
  },
  heroCard: {
    gap: rV(12),
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(12),
  },
  heroCopy: {
    flex: 1,
    gap: rV(4),
  },
  eyebrow: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    lineHeight: rMS(24),
  },
  subtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
  },
  image: {
    width: "100%",
    height: rV(180),
    borderRadius: rMS(14),
  },
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    marginBottom: rV(12),
  },
  detailRow: {
    gap: rV(4),
    marginBottom: rV(12),
  },
  detailLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  detailValue: {
    fontFamily: Fonts.title,
    fontSize: rMS(14),
    lineHeight: rMS(20),
  },
  evidenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
  },
  evidenceImage: {
    width: rMS(96),
    height: rMS(96),
    borderRadius: rMS(12),
  },
  footerNote: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    paddingHorizontal: rS(4),
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  actionButton: {
    paddingHorizontal: rS(14),
    paddingVertical: rV(10),
    borderRadius: rMS(12),
    borderWidth: StyleSheet.hairlineWidth,
  },
});
