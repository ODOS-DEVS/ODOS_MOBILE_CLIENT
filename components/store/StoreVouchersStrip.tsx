import StoreOfferCard from "@/components/cards/StoreOfferCard";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useVouchers, type StoreVoucherOffer } from "@/hooks/useVouchers";
import { rMS, rS, rV } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type StoreVouchersStripProps = {
  storeId: string;
  horizontalPadding: number;
};

export default function StoreVouchersStrip({
  storeId,
  horizontalPadding,
}: StoreVouchersStripProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { fetchStoreVouchers, claimVoucher } = useVouchers();
  const [offers, setOffers] = useState<StoreVoucherOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const loadOffers = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await fetchStoreVouchers(storeId);
      setOffers(items);
    } catch {
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStoreVouchers, storeId]);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  const handleClaim = useCallback(
    async (offer: StoreVoucherOffer) => {
      if (!user) {
        showToast("Sign in to save store offers.");
        return;
      }
      setClaimingId(offer.id);
      try {
        await claimVoucher(offer.id);
        setOffers((current) =>
          current.map((item) =>
            item.id === offer.id ? { ...item, claimed: true } : item,
          ),
        );
        showToast(`${offer.code} saved to your wallet.`);
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : "We couldn't save this offer.",
        );
      } finally {
        setClaimingId(null);
      }
    },
    [claimVoucher, showToast, user],
  );

  const handleUse = useCallback(
    (offer: StoreVoucherOffer) => {
      router.push({
        pathname: "/(root)/screens/profileScreens/Account/Vouchers" as never,
        params: { fromCheckout: "0", highlightCode: offer.code },
      });
    },
    [],
  );

  if (isLoading) {
    return (
      <View style={[styles.wrap, { paddingHorizontal: horizontalPadding }]}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  if (!offers.length) {
    return null;
  }

  return (
    <View style={[styles.wrap, { paddingHorizontal: horizontalPadding }]}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>Deals</Text>
        <Text style={[styles.title, { color: colors.text }]}>Store offers</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {offers.map((offer) => (
          <StoreOfferCard
            key={offer.id}
            offer={offer}
            isBusy={claimingId === offer.id}
            onClaim={handleClaim}
            onUse={handleUse}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: rV(16),
    gap: rV(10),
  },
  header: {
    gap: rV(4),
  },
  eyebrow: {
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingRight: rS(16),
    paddingBottom: rV(4),
  },
});
