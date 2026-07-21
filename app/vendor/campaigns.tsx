import { AccountEmptyState, AccountListCard } from "@/components/account/AccountUi";
import {
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import {
  fetchVendorCampaignOptIns,
  type VendorCampaignOptIn,
} from "@/services/storeService";
import { rMS, rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function statusTone(
  status: string,
  colors: { dangerText: string; warningText: string; textMuted: string; text: string },
) {
  if (status === "approved") return colors.text;
  if (status === "rejected") return colors.dangerText;
  if (status === "pending") return colors.warningText;
  return colors.textMuted;
}

export default function VendorCampaignsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { contentMaxWidth } = useResponsive();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const [optIns, setOptIns] = useState<VendorCampaignOptIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptIns = useCallback(async () => {
    if (!hasVendorAccess) return;
    setError(null);
    try {
      const next = await fetchVendorCampaignOptIns(session);
      setOptIns(next);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "We couldn't load campaign opt-ins.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [hasVendorAccess, session]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(optIns.length === 0);
      void loadOptIns();
      return undefined;
    }, [loadOptIns]),
  );

  const stats = useMemo(
    () => ({
      pending: optIns.filter((item) => item.status === "pending").length,
      approved: optIns.filter((item) => item.status === "approved").length,
      rejected: optIns.filter((item) => item.status === "rejected").length,
    }),
    [optIns],
  );

  if (isCheckingVendorAccess || !hasVendorAccess) {
    return (
      <VendorScreenShell title="Campaigns" loading loadingLabel="Loading campaigns..." />
    );
  }

  return (
    <VendorScreenShell title="Campaigns">
      <FlatList
        data={optIns}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              void loadOptIns().finally(() => setIsRefreshing(false));
            }}
          />
        }
        contentContainerStyle={[
          vendorStyles.listContent,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        ListHeaderComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth, gap: rV(12) }]}>
            <VendorPageIntro
              title="Campaign opt-ins"
              subtitle="Track merchandising campaign submissions and review status."
              stats={[
                { value: stats.pending, label: "Pending" },
                { value: stats.approved, label: "Approved" },
                { value: stats.rejected, label: "Rejected" },
              ]}
              error={error}
            />
            <TouchableOpacity
              onPress={() => router.push("/vendor/flash-sales" as any)}
              style={{ alignSelf: "flex-start" }}
            >
              <Text
                style={{
                  fontFamily: Fonts.textBold,
                  fontSize: rMS(13),
                  color: colors.primary,
                }}
              >
                Open flash sales →
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountEmptyState
              icon="megaphone-outline"
              title={
                isLoading
                  ? "Loading campaigns"
                  : error
                    ? "Couldn't load campaigns"
                    : "No campaign opt-ins yet"
              }
              message={
                error ??
                "When you submit products to merchandising campaigns, their status will show here."
              }
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountListCard>
              <Text
                style={{
                  fontFamily: Fonts.titleBold,
                  fontSize: rMS(14),
                  color: colors.text,
                }}
                numberOfLines={2}
              >
                {item.campaignTitle}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: Fonts.text,
                  fontSize: rMS(12),
                  color: colors.textMuted,
                }}
                numberOfLines={2}
              >
                {item.productTitle}
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: Fonts.textBold,
                  fontSize: rMS(12),
                  color: statusTone(item.status, colors),
                  textTransform: "capitalize",
                }}
              >
                {item.status.replace(/_/g, " ")}
              </Text>
              {item.reviewNotes ? (
                <Text
                  style={{
                    marginTop: 4,
                    fontFamily: Fonts.text,
                    fontSize: rMS(12),
                    color: colors.textMuted,
                  }}
                >
                  {item.reviewNotes}
                </Text>
              ) : null}
            </AccountListCard>
          </View>
        )}
      />
    </VendorScreenShell>
  );
}
