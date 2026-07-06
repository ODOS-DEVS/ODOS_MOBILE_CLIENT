import { AccountEmptyState } from "@/components/account/AccountUi";
import VendorFlashSaleNominationCard from "@/components/vendor/VendorFlashSaleNominationCard";
import {
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { fetchVendorFlashSaleNominations } from "@/services/vendorFlashSaleService";
import type { VendorFlashSaleNomination } from "@/types/store";
import { rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Fonts from "@/constants/Fonts";
import { AppColors } from "@/constants/Colors";
import { rMS } from "@/styles/responsive";

export default function VendorFlashSalesScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const [nominations, setNominations] = useState<VendorFlashSaleNomination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNominations = useCallback(async () => {
    if (!hasVendorAccess) {
      return;
    }

    setError(null);
    try {
      const next = await fetchVendorFlashSaleNominations(session);
      setNominations(next);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "We couldn't load flash sale nominations.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [hasVendorAccess, session]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(nominations.length === 0);
      void loadNominations();
      return undefined;
    }, [loadNominations, nominations.length]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadNominations();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadNominations]);

  const stats = useMemo(() => {
    return {
      pending: nominations.filter((item) => item.status === "pending").length,
      approved: nominations.filter((item) => item.status === "approved").length,
      rejected: nominations.filter((item) => item.status === "rejected").length,
    };
  }, [nominations]);

  const nominateButton = (
    <TouchableOpacity
      onPress={() => router.push("/vendor/flash-sales/nominate" as any)}
      activeOpacity={0.82}
    >
      <Text style={styles.headerAction}>Nominate</Text>
    </TouchableOpacity>
  );

  if (isCheckingVendorAccess) {
    return (
      <VendorScreenShell
        title="Flash Sales"
        rightNode={nominateButton}
        loading
        loadingLabel="Loading flash sales..."
      />
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  if (isLoading && nominations.length === 0) {
    return (
      <VendorScreenShell
        title="Flash Sales"
        rightNode={nominateButton}
        loading
        loadingLabel="Loading flash sales..."
      />
    );
  }

  return (
    <VendorScreenShell title="Flash Sales" rightNode={nominateButton}>
      <FlatList
        data={nominations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void handleRefresh()} />
        }
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          vendorStyles.listContent,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        ListHeaderComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <VendorPageIntro
              title="Flash sale nominations"
              subtitle="Nominate live products for ODOS flash events. Approved picks go live with event pricing."
              stats={[
                { value: stats.pending, label: "Pending" },
                { value: stats.approved, label: "Approved" },
                { value: stats.rejected, label: "Declined" },
              ]}
              error={error}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountEmptyState
              icon="flash-outline"
              title="No nominations yet"
              message="Nominate a live product for the next flash sale event to reach more shoppers."
              actionLabel="Nominate product"
              onAction={() => router.push("/vendor/flash-sales/nominate" as any)}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <VendorFlashSaleNominationCard nomination={item} />
          </View>
        )}
      />
    </VendorScreenShell>
  );
}

const styles = {
  headerAction: {
    color: AppColors.primary,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
  },
};
