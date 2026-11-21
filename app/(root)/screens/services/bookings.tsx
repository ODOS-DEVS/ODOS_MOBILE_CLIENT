import ProfileHeader from "@/components/profile/ProfileHeader";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { fetchMyBookings } from "@/services/serviceMarketplaceService";
import { rMS, rS, rV } from "@/styles/responsive";
import type { Booking, BookingStatus } from "@/types/service";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * The customer's bookings.
 *
 * Status is shown as what the customer should *do*, not as the backend's
 * enum. "Awaiting payment" and "Confirm the work" are instructions;
 * "pending_payment" and "completed" are implementation details that happen
 * to be visible.
 */

const STATUS_COPY: Record<BookingStatus, { label: string; tone: "info" | "good" | "warn" | "bad" }> = {
  pending_provider: { label: "Waiting on provider", tone: "info" },
  pending_payment: { label: "Awaiting payment", tone: "warn" },
  confirmed: { label: "Confirmed", tone: "good" },
  in_progress: { label: "In progress", tone: "info" },
  // The provider says it is done; the customer still has to release the money.
  completed: { label: "Confirm the work", tone: "warn" },
  cancelled: { label: "Cancelled", tone: "bad" },
  declined: { label: "Declined", tone: "bad" },
  expired: { label: "Expired", tone: "bad" },
  disputed: { label: "Under review", tone: "bad" },
};

function formatWhen(iso?: string | null): string | null {
  if (!iso) {
    return null;
  }
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MyBookingsScreen() {
  const { colors } = useTheme();
  const { accessToken } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }
    try {
      setBookings(await fetchMyBookings(accessToken));
    } catch {
      // The empty state covers a failed load; a toast on a list the reader
      // may have only glanced at is noise.
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void load();
      return undefined;
    }, [load]),
  );

  const toneStyle = useCallback(
    (tone: "info" | "good" | "warn" | "bad") =>
      tone === "good"
        ? styles.pillGood
        : tone === "warn"
          ? styles.pillWarn
          : tone === "bad"
            ? styles.pillBad
            : styles.pillInfo,
    [styles],
  );

  return (
    <View style={styles.screen}>
      <ProfileHeader title="My bookings" />

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: rV(32), flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              void load().finally(() => setIsRefreshing(false));
            }}
          />
        }
        renderItem={({ item }) => {
          const copy = STATUS_COPY[item.status];
          const when = formatWhen(item.scheduledStartAt);
          return (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() =>
                router.push({
                  pathname: "/(root)/screens/services/booking/[bookingId]" as never,
                  params: { bookingId: item.id },
                })
              }
            >
              <View style={styles.row}>
                <View style={styles.rowCopy}>
                  <View style={styles.rowTop}>
                    <Text style={styles.number} numberOfLines={1}>
                      {item.bookingNumber}
                    </Text>
                    <View style={[styles.pill, toneStyle(copy.tone)]}>
                      <Text style={[styles.pillText, toneStyle(copy.tone)]}>
                        {copy.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.meta} numberOfLines={1}>
                    {when ? `${when} · ` : ""}₵{item.totalAmount.toFixed(2)}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={rMS(16)}
                  color={colors.iconMuted}
                />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centre}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.centre}>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyBody}>
                Services you book will appear here.
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(root)/screens/services" as never)}
              >
                <Text style={styles.emptyLink}>Browse services</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.screen },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(12),
      paddingHorizontal: rS(16),
      paddingVertical: rV(14),
      backgroundColor: colors.card,
    },
    rowCopy: { flex: 1, minWidth: 0, gap: rV(5) },
    rowTop: { flexDirection: "row", alignItems: "center", gap: rS(8) },
    number: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: colors.text,
    },
    meta: { fontFamily: Fonts.text, fontSize: rMS(12.5), color: colors.textMuted },

    pill: {
      paddingHorizontal: rS(9),
      paddingVertical: rV(4),
      borderRadius: rMS(7),
    },
    pillText: { fontFamily: Fonts.titleBold, fontSize: rMS(10.5) },
    pillInfo: { backgroundColor: colors.infoSoft, color: colors.infoText },
    pillGood: { backgroundColor: colors.successSoft, color: colors.successText },
    pillWarn: { backgroundColor: colors.warningSoft, color: colors.warningText },
    pillBad: { backgroundColor: colors.dangerSoft, color: colors.dangerText },

    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: rS(16),
    },
    centre: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: rV(6),
      paddingHorizontal: rS(32),
    },
    emptyTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(15),
      color: colors.text,
    },
    emptyBody: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      lineHeight: rMS(19),
      color: colors.textMuted,
      textAlign: "center",
    },
    emptyLink: {
      marginTop: rV(10),
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13.5),
      color: colors.primary,
    },
  });
}
