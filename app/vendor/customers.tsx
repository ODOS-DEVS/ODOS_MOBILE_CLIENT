import { AccountEmptyState, AccountListCard } from "@/components/account/AccountUi";
import {
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { fetchVendorCustomers } from "@/services/vendorService";
import { useWorkspaceModeStore } from "@/stores/workspaceModeStore";
import type { VendorCustomer } from "@/types/vendor";
import { rMS, rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { FlatList, Linking, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VendorCustomersScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { contentMaxWidth } = useResponsive();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const workspaceMode = useWorkspaceModeStore((state) => state.mode);
  const [customers, setCustomers] = useState<VendorCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const customersCountRef = useRef(0);
  customersCountRef.current = customers.length;

  const load = useCallback(async () => {
    try {
      setError(null);
      const rows = await fetchVendorCustomers(session);
      setCustomers(rows);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load customers.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      if (!hasVendorAccess) return undefined;
      if (customersCountRef.current === 0) {
        setIsLoading(true);
      }
      void load();
      return undefined;
    }, [hasVendorAccess, load]),
  );

  const openOrders = () => {
    if (workspaceMode === "sell_only") {
      router.push("/(root)/(tabs)/seller-orders" as any);
      return;
    }
    router.push("/vendor/orders" as any);
  };

  if (isCheckingVendorAccess || !hasVendorAccess) {
    return (
      <VendorScreenShell title="Customers" loading loadingLabel="Loading customers..." />
    );
  }

  return (
    <VendorScreenShell title="Customers">
      <FlatList
        data={customers}
        keyExtractor={(item) => item.customerKey}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              void load();
            }}
          />
        }
        contentContainerStyle={[
          vendorStyles.listContent,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        ListHeaderComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <VendorPageIntro
              title="Your buyers"
              subtitle="Tap a name to open orders. Contact details come from delivery info."
              stats={[
                { value: customers.length, label: "Buyers" },
                {
                  value: customers.filter((item) => item.orderCount > 1).length,
                  label: "Repeat",
                },
              ]}
              error={error}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountEmptyState
              icon="people-outline"
              title={
                isLoading
                  ? "Loading customers"
                  : error
                    ? "Couldn't load customers"
                    : "No buyers yet"
              }
              message={
                error ??
                "When shoppers complete orders with your products, they will appear here."
              }
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountListCard>
              <View style={{ gap: rV(6) }}>
                <TouchableOpacity onPress={openOrders} activeOpacity={0.82}>
                  <Text
                    style={{
                      fontFamily: Fonts.titleBold,
                      fontSize: rMS(15),
                      color: colors.text,
                    }}
                  >
                    {item.customerName}
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontFamily: Fonts.text,
                      fontSize: rMS(12.5),
                      color: colors.textMuted,
                    }}
                  >
                    {item.orderCount} order{item.orderCount === 1 ? "" : "s"} ·{" "}
                    {item.currency} {item.totalSpent.toLocaleString()}
                  </Text>
                  {item.lastOrderAt ? (
                    <Text
                      style={{
                        marginTop: 2,
                        fontFamily: Fonts.text,
                        fontSize: rMS(12),
                        color: colors.textMuted,
                      }}
                    >
                      Last order {new Date(item.lastOrderAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                  <Text
                    style={{
                      marginTop: rV(6),
                      fontFamily: Fonts.textBold,
                      fontSize: rMS(12),
                      color: colors.primary,
                    }}
                  >
                    View orders
                  </Text>
                </TouchableOpacity>
                {item.customerPhone ? (
                  <TouchableOpacity
                    onPress={() => void Linking.openURL(`tel:${item.customerPhone}`)}
                    style={{ marginTop: rV(2) }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.textBold,
                        fontSize: rMS(13),
                        color: colors.primary,
                      }}
                    >
                      Call {item.customerPhone}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </AccountListCard>
          </View>
        )}
      />
    </VendorScreenShell>
  );
}
