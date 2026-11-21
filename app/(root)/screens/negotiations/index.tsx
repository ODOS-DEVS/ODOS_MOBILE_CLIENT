import CommerceImage from "@/components/media/CommerceImage";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useTheme } from "@/context/ThemeContext";
import { listNegotiations, type Negotiation, type NegotiationActor } from "@/services/negotiationService";
import { rV, useResponsive } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

const money = (value?: number | null) =>
  value == null ? "—" : `GH₵${value.toLocaleString()}`;

const STATUS_LABEL: Record<Negotiation["status"], string> = {
  open: "In progress",
  agreed: "Price agreed",
  completed: "Bought",
  rejected: "Declined",
  withdrawn: "Withdrawn",
  expired: "Expired",
};

/**
 * Every negotiation this account is part of, as shopper and as seller.
 *
 * One screen rather than two: a vendor is usually also a shopper, and the role toggle is
 * cheaper than making them find a second list in a different part of the app. The API scopes
 * each side to the caller, so neither tab can show anyone else's haggling.
 */
export default function NegotiationsScreen() {
  const { colors } = useTheme();
  const { horizontalPadding } = useResponsive();

  const [role, setRole] = useState<NegotiationActor>("customer");
  const [rows, setRows] = useState<Negotiation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nothing is set before the first await. The React compiler rejects a synchronous setState
  // inside an effect body, and the spinners are owned by the handlers that start the work:
  // `isLoading` begins true, the role switch sets it again, and pull-to-refresh sets its own.
  const load = useCallback(async (nextRole: NegotiationActor) => {
    try {
      const next = await listNegotiations(nextRole);
      setRows(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't load your negotiations.");
      setRows([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(role);
  }, [role, load]);

  const renderRow = ({ item }: { item: Negotiation }) => {
    const latest = item.agreement?.agreedUnitPrice ?? item.latestOffer?.unitPrice ?? null;
    const needsMe = item.awaiting === role;

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(root)/screens/negotiations/[id]" as any,
            params: { id: item.id },
          })
        }
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: rV(12),
          padding: rV(12),
          marginBottom: rV(10),
          borderRadius: rV(16),
          borderWidth: 1,
          borderColor: needsMe ? colors.primary : colors.border,
          backgroundColor: colors.card,
        }}
      >
        <CommerceImage
          source={item.productImageUrl ? { uri: item.productImageUrl } : undefined}
          style={{ width: rV(54), height: rV(54), borderRadius: rV(12) }}
          contentFit="cover"
          placeholderColor={colors.imagePlaceholder}
          trackingId={`negotiation-${item.id}`}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ color: colors.text, fontWeight: "600", fontSize: rV(14) }}>
            {item.productTitle}
          </Text>
          <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: rV(11), marginTop: 2 }}>
            {role === "vendor" ? (item.customerName ?? "Shopper") : (item.storeName ?? "Seller")} ·{" "}
            {item.reference}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: needsMe ? colors.primary : colors.textMuted,
              fontSize: rV(11),
              marginTop: 4,
              fontWeight: needsMe ? "600" : "400",
            }}
          >
            {needsMe ? "Your reply is needed" : STATUS_LABEL[item.status]}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: rV(14) }}>
            {money(latest)}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: rV(11),
              textDecorationLine: "line-through",
            }}
          >
            {money(item.listedUnitPrice)}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <ProfileHeader title="Negotiations" fallbackHref="/(root)/(tabs)/profile" />

      <View
        style={{
          flexDirection: "row",
          gap: rV(8),
          paddingHorizontal: horizontalPadding,
          paddingVertical: rV(10),
        }}
      >
        {(["customer", "vendor"] as const).map((option) => {
          const active = role === option;
          return (
            <Pressable
              key={option}
              onPress={() => {
                if (role === option) return;
                setIsLoading(true);
                setRole(option);
              }}
              style={{
                paddingHorizontal: rV(16),
                paddingVertical: rV(8),
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? colors.text : colors.border,
                backgroundColor: active ? colors.text : "transparent",
              }}
            >
              <Text
                style={{
                  color: active ? colors.screen : colors.textMuted,
                  fontSize: rV(12),
                  fontWeight: "600",
                }}
              >
                {option === "customer" ? "My offers" : "Offers to me"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: rV(40) }} color={colors.primary} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: rV(32),
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                void load(role);
              }}
            />
          }
          ListEmptyComponent={
            <Text
              style={{
                color: colors.textMuted,
                textAlign: "center",
                marginTop: rV(40),
                fontSize: rV(13),
                paddingHorizontal: rV(24),
              }}
            >
              {error ??
                (role === "customer"
                  ? "No offers yet. Find a product marked “Price negotiable” and make the seller an offer."
                  : "No one has made you an offer yet.")}
            </Text>
          }
        />
      )}
    </View>
  );
}
