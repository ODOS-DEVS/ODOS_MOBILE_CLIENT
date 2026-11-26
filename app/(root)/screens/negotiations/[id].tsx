import CommerceImage from "@/components/media/CommerceImage";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import {
  acceptNegotiationOffer,
  counterNegotiationOffer,
  getNegotiation,
  rejectNegotiationOffer,
  withdrawNegotiationOffer,
  type Negotiation,
  type NegotiationActor,
  type NegotiationOffer,
} from "@/services/negotiationService";
import { rV, useResponsive } from "@/styles/responsive";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const money = (value?: number | null) => (value == null ? "—" : `GH₵${value.toLocaleString()}`);

const digitsOnly = (value: string) => value.replace(/[^0-9]/g, "");

function parseParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0]?.trim() ?? "") : (value?.trim() ?? "");
}

/** Server-issued seconds, so a wrong device clock cannot show a dead deal as live. */
function expiryLabel(seconds: number) {
  if (seconds <= 0) return "expired";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

/**
 * One negotiation, from whichever side is looking.
 *
 * The viewer's role comes from comparing the signed-in user to the negotiation's two parties
 * rather than from a route param, so a link shared between accounts cannot make someone appear
 * to be the other party. The server decides the same way and rejects anything inconsistent.
 */
export default function NegotiationDetailScreen() {
  const { colors } = useTheme();
  const { horizontalPadding } = useResponsive();
  const { user } = useAuth();
  const { addItemsToCart } = useCart();
  const params = useLocalSearchParams<{ id?: string }>();
  const negotiationId = parseParam(params.id);

  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [countering, setCountering] = useState(false);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(
    async (refreshing = false) => {
      if (!negotiationId) return;
      if (refreshing) setIsRefreshing(true);
      else setIsLoading(true);
      try {
        setNegotiation(await getNegotiation(negotiationId));
      } catch (err) {
        Alert.alert("Negotiation", err instanceof Error ? err.message : "Couldn't load that.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [negotiationId],
  );

  useEffect(() => {
    load();
  }, [load]);

  const run = async (action: () => Promise<Negotiation>, success: string) => {
    setBusy(true);
    try {
      setNegotiation(await action());
      setCountering(false);
      setPrice("");
      setNote("");
      Alert.alert("Negotiation", success);
    } catch (err) {
      Alert.alert("Negotiation", err instanceof Error ? err.message : "That didn't work.");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Put the agreed quantity in the basket at the agreed price.
   *
   * The price travels with the line for display and for the totals the order
   * endpoint checks; the server still resolves the agreement from the signed-in
   * shopper, so this cannot buy anything cheaper than the seller agreed to.
   */
  const addAgreed = async (then: "stay" | "checkout") => {
    const deal = negotiation?.agreement;
    if (!negotiation || !deal) return;
    setBusy(true);
    try {
      await addItemsToCart([
        {
          id: negotiation.productId,
          title: negotiation.productTitle,
          price: negotiation.listedUnitPrice,
          imageUrl: negotiation.productImageUrl ?? undefined,
          quantity: deal.quantity,
          negotiatedUnitPrice: deal.agreedUnitPrice,
          agreementReference: deal.reference,
        },
      ]);
      if (then === "checkout") {
        router.push({ pathname: "/screens/Checkout" as any, params: { mode: "cart" } });
        return;
      }
      Alert.alert(
        "Added to your basket",
        `${deal.quantity} ${deal.quantity === 1 ? "unit" : "units"} at ${money(
          deal.agreedUnitPrice,
        )} each. Keep shopping — the agreed price stays with it.`,
      );
    } catch (err) {
      Alert.alert(
        "We couldn't add that",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (isLoading || !negotiation) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        <ProfileHeader title="Negotiation" fallbackHref="/(root)/screens/negotiations" />
        <ActivityIndicator style={{ marginTop: rV(40) }} color={colors.primary} />
      </View>
    );
  }

  const viewerRole: NegotiationActor =
    user?.id && String(user.id) === negotiation.vendorUserId ? "vendor" : "customer";
  const pending = negotiation.latestOffer?.status === "pending" ? negotiation.latestOffer : null;
  const myMove = negotiation.awaiting === viewerRole;
  const mineIsPending = Boolean(pending && pending.actorRole === viewerRole);
  const agreement = negotiation.agreement;
  const live = agreement?.status === "accepted" && agreement.secondsRemaining > 0;

  const renderOffer = (offer: NegotiationOffer) => {
    const mine = offer.actorRole === viewerRole;
    return (
      <View
        key={offer.id}
        style={{
          alignSelf: mine ? "flex-end" : "flex-start",
          maxWidth: "88%",
          padding: rV(12),
          borderRadius: rV(14),
          marginBottom: rV(8),
          borderWidth: 1,
          borderColor: offer.status === "accepted" ? colors.successBorder : colors.border,
          backgroundColor: colors.card,
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: rV(10), textTransform: "uppercase" }}>
          {mine ? "You" : offer.actorRole === "vendor" ? "Seller" : "Buyer"} · {offer.status}
        </Text>
        <Text style={{ color: colors.text, fontWeight: "700", fontSize: rV(18), marginTop: 4 }}>
          {money(offer.unitPrice)} <Text style={{ fontSize: rV(12), fontWeight: "400" }}>each</Text>
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: rV(11), marginTop: 2 }}>
          {offer.quantity} × · {money(offer.unitPrice * offer.quantity)} total
        </Text>
        {offer.message ? (
          <Text style={{ color: colors.text, fontSize: rV(12), marginTop: 6 }}>
            “{offer.message}”
          </Text>
        ) : null}
      </View>
    );
  };

  const actionButton = (
    label: string,
    onPress: () => void,
    tone: "primary" | "ghost" = "primary",
  ) => (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={{
        flexGrow: 1,
        paddingVertical: rV(12),
        borderRadius: rV(12),
        alignItems: "center",
        opacity: busy ? 0.5 : 1,
        borderWidth: 1,
        borderColor: tone === "primary" ? colors.primary : colors.border,
        backgroundColor: tone === "primary" ? colors.primary : "transparent",
      }}
    >
      <Text
        style={{
          color: tone === "primary" ? colors.onPrimary : colors.text,
          fontWeight: "600",
          fontSize: rV(13),
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <ProfileHeader title="Negotiation" fallbackHref="/(root)/screens/negotiations" />
      <ScrollView
        contentContainerStyle={{ padding: horizontalPadding, paddingBottom: rV(40) }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} />}
      >
        <View
          style={{
            flexDirection: "row",
            gap: rV(12),
            padding: rV(12),
            borderRadius: rV(16),
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <CommerceImage
            source={
              negotiation.productImageUrl ? { uri: negotiation.productImageUrl } : undefined
            }
            style={{ width: rV(60), height: rV(60), borderRadius: rV(12) }}
            contentFit="cover"
            placeholderColor={colors.imagePlaceholder}
            trackingId={`negotiation-detail-${negotiation.id}`}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textMuted, fontSize: rV(10) }}>
              {negotiation.reference}
            </Text>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: rV(15), marginTop: 2 }}>
              {negotiation.productTitle}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: rV(11), marginTop: 2 }}>
              Listed at {money(negotiation.listedUnitPrice)}
            </Text>
          </View>
        </View>

        {agreement ? (
          <View
            style={{
              marginTop: rV(14),
              padding: rV(14),
              borderRadius: rV(16),
              borderWidth: 1,
              borderColor: live ? colors.successBorder : colors.border,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: rV(13) }}>
              {agreement.status === "used"
                ? "Bought at the agreed price"
                : live
                  ? "Price agreed"
                  : "This agreed price has expired"}
            </Text>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: rV(24), marginTop: 6 }}>
              {money(agreement.agreedUnitPrice)}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: rV(12), marginTop: 2 }}>
              {agreement.quantity} × · {money(agreement.agreedUnitPrice * agreement.quantity)} total
              {" · "}
              {agreement.reference}
            </Text>
            {live ? (
              <Text style={{ color: colors.primary, fontSize: rV(12), marginTop: 6 }}>
                {expiryLabel(agreement.secondsRemaining)}
                {viewerRole === "customer" ? " — only you can use this price." : ""}
              </Text>
            ) : null}
            {live && viewerRole === "customer" ? (
              /* Both of these put the agreed quantity in the basket at the
                 agreed price. This used to be a single button that only opened
                 the product page, so a shopper who had just finished haggling
                 had to find the item again, re-pick the quantity they had
                 already agreed, and add it -- with the list price shown
                 throughout. "Add to basket" leaves them shopping so a
                 negotiated item can travel with the rest of an order. */
              <View style={{ marginTop: rV(12), gap: rV(8) }}>
                {actionButton(
                  busy
                    ? "Adding..."
                    : `Buy now · ${money(agreement.agreedUnitPrice * agreement.quantity)}`,
                  () => void addAgreed("checkout"),
                )}
                {actionButton("Add to basket", () => void addAgreed("stay"), "ghost")}
                <Text style={{ color: colors.textMuted, fontSize: rV(10.5) }}>
                  {agreement.quantity} {agreement.quantity === 1 ? "unit" : "units"} at{" "}
                  {money(agreement.agreedUnitPrice)} each. Add other items to the same order if
                  you like — only this product is discounted.
                </Text>
              </View>
            ) : null}
            {agreement.orderNumber ? (
              <Text style={{ color: colors.textMuted, fontSize: rV(11), marginTop: 8 }}>
                Order {agreement.orderNumber}
              </Text>
            ) : null}
          </View>
        ) : null}

        <Text
          style={{
            color: colors.textMuted,
            fontSize: rV(11),
            textTransform: "uppercase",
            marginTop: rV(18),
            marginBottom: rV(8),
          }}
        >
          History
        </Text>
        {negotiation.offers.map(renderOffer)}

        {negotiation.status === "open" ? (
          <View
            style={{
              marginTop: rV(14),
              padding: rV(14),
              borderRadius: rV(16),
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            {myMove && pending ? (
              countering ? (
                <>
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: rV(13) }}>
                    Your price per unit
                  </Text>
                  <TextInput
                    value={price}
                    onChangeText={(value) => setPrice(digitsOnly(value))}
                    keyboardType="number-pad"
                    style={{
                      marginTop: rV(8),
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: rV(12),
                      padding: rV(12),
                      color: colors.text,
                    }}
                  />
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Optional message"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={500}
                    style={{
                      marginTop: rV(8),
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: rV(12),
                      padding: rV(12),
                      minHeight: rV(70),
                      color: colors.text,
                    }}
                  />
                  <View style={{ flexDirection: "row", gap: rV(8), marginTop: rV(12) }}>
                    {actionButton("Send", () =>
                      run(
                        () =>
                          counterNegotiationOffer(negotiation.id, {
                            unitPrice: Number(price),
                            message: note.trim() || null,
                          }),
                        "Counteroffer sent",
                      ),
                    )}
                    {actionButton("Cancel", () => setCountering(false), "ghost")}
                  </View>
                </>
              ) : (
                <>
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: rV(13) }}>
                    {pending.actorRole === "vendor" ? "The seller" : "The buyer"} proposed{" "}
                    {money(pending.unitPrice)} each for {pending.quantity}.
                  </Text>
                  <View style={{ flexDirection: "row", gap: rV(8), marginTop: rV(12) }}>
                    {actionButton(`Accept ${money(pending.unitPrice)}`, () =>
                      run(() => acceptNegotiationOffer(negotiation.id), "Price agreed"),
                    )}
                    {actionButton("Counter", () => setCountering(true), "ghost")}
                  </View>
                  <View style={{ marginTop: rV(8) }}>
                    {actionButton(
                      "Decline",
                      () =>
                        run(
                          () => rejectNegotiationOffer(negotiation.id),
                          "Offer declined",
                        ),
                      "ghost",
                    )}
                  </View>
                </>
              )
            ) : mineIsPending ? (
              <>
                <Text style={{ color: colors.textMuted, fontSize: rV(13) }}>
                  Waiting for {viewerRole === "customer" ? "the seller" : "the buyer"} to respond to
                  your {money(pending!.unitPrice)} offer.
                </Text>
                <View style={{ marginTop: rV(12) }}>
                  {actionButton(
                    "Withdraw my offer",
                    () =>
                      run(
                        () => withdrawNegotiationOffer(negotiation.id),
                        "Offer withdrawn",
                      ),
                    "ghost",
                  )}
                </View>
              </>
            ) : (
              <Text style={{ color: colors.textMuted, fontSize: rV(13) }}>
                No offer is on the table right now.
              </Text>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
