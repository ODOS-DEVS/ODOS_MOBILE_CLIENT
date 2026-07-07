import { AccountEmptyState } from "@/components/account/AccountUi";
import VendorReturnCard from "@/components/vendor/VendorReturnCard";
import VendorReturnQueueTabs from "@/components/vendor/VendorReturnQueueTabs";
import {
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { fetchVendorReturns } from "@/services/storeService";
import { rV, useResponsive } from "@/styles/responsive";
import type { VendorReturnQueueTab, VendorReturnRequest } from "@/types/store";
import {
  filterVendorReturnsByTab,
  isOpenVendorReturn,
} from "@/utils/vendorReturns";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VendorReturnsScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { hasVendorAccess, isCheckingVendorAccess, session } =
    useRequireVendor();
  const [returns, setReturns] = useState<VendorReturnRequest[]>([]);
  const [activeTab, setActiveTab] = useState<VendorReturnQueueTab>("open");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReturns = useCallback(async () => {
    if (!hasVendorAccess) {
      return;
    }

    setError(null);
    try {
      const next = await fetchVendorReturns(session);
      setReturns(next);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "We couldn't load return requests.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [hasVendorAccess, session]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(returns.length === 0);
      void loadReturns();
      return undefined;
    }, [loadReturns, returns.length]),
  );

  const counts = useMemo(
    () => ({
      open: returns.filter((item) => isOpenVendorReturn(item.status)).length,
      resolved: returns.filter((item) => !isOpenVendorReturn(item.status))
        .length,
    }),
    [returns],
  );

  const filteredReturns = useMemo(
    () => filterVendorReturnsByTab(returns, activeTab),
    [activeTab, returns],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadReturns();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadReturns]);

  if (isCheckingVendorAccess) {
    return (
      <VendorScreenShell
        title="Returns"
        loading
        loadingLabel="Loading returns..."
      />
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  if (isLoading && returns.length === 0) {
    return (
      <VendorScreenShell
        title="Returns"
        loading
        loadingLabel="Loading returns..."
      />
    );
  }

  return (
    <VendorScreenShell title="Returns">
      <FlatList
        data={filteredReturns}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
          />
        }
        contentContainerStyle={[
          vendorStyles.content,
          {
            paddingBottom: insets.bottom + rV(28),
            maxWidth: contentMaxWidth,
            alignSelf: "center",
            width: "100%",
          },
        ]}
        ListHeaderComponent={
          <View style={vendorStyles.sectionBlock}>
            <VendorPageIntro
              title="Track shopper return requests"
              subtitle="Review return and refund requests for your products and update their status."
              error={error}
            />
            <VendorReturnQueueTabs
              activeTab={activeTab}
              openCount={counts.open}
              resolvedCount={counts.resolved}
              onChange={setActiveTab}
            />
          </View>
        }
        renderItem={({ item }) => (
          <VendorReturnCard
            item={item}
            onPress={() =>
              router.push({
                pathname: "/vendor/returns/[returnId]" as any,
                params: { returnId: item.id },
              })
            }
          />
        )}
        ListEmptyComponent={
          <AccountEmptyState
            icon="return-down-back-outline"
            title={
              activeTab === "open"
                ? "No open returns"
                : "No resolved returns yet"
            }
            message={
              activeTab === "open"
                ? "When shoppers request a return on your products, it will appear here."
                : "Completed or rejected return requests will show up in this tab."
            }
          />
        }
      />
    </VendorScreenShell>
  );
}
