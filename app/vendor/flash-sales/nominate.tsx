import TextInputField from "@/components/TextInputField";
import { AccountEmptyState } from "@/components/account/AccountUi";
import {
  AccountActionButton,
  AccountListCard,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { useToast } from "@/context/ToastContext";
import { useFlashSaleEvents } from "@/hooks/useFlashSaleEvents";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { createVendorFlashSaleNomination } from "@/services/vendorFlashSaleService";
import { useStoreStore } from "@/stores/storeStore";
import { rV, useResponsive } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS } from "@/styles/responsive";

export default function VendorFlashSaleNominateScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const { products, fetchProducts, isLoadingProducts } = useStoreStore();
  const { events, isLoading: isLoadingEvents, primaryEvent } = useFlashSaleEvents();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [proposedPrice, setProposedPrice] = useState("");
  const [vendorNote, setVendorNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (hasVendorAccess) {
      void fetchProducts(session);
    }
  }, [fetchProducts, hasVendorAccess, session]);

  React.useEffect(() => {
    if (primaryEvent && !selectedEventId) {
      setSelectedEventId(primaryEvent.id);
    }
  }, [primaryEvent, selectedEventId]);

  const liveProducts = useMemo(
    () => products.filter((product) => product.status === "active"),
    [products],
  );

  const selectedProduct = liveProducts.find((product) => product.id === selectedProductId) ?? null;

  const handleSubmit = async () => {
    if (!selectedProductId) {
      showToast("Choose a live product to nominate.");
      return;
    }

    const parsedPrice = proposedPrice.trim() ? Number(proposedPrice) : undefined;
    if (parsedPrice != null && (!Number.isFinite(parsedPrice) || parsedPrice <= 0)) {
      showToast("Enter a valid flash sale price.");
      return;
    }

    if (
      parsedPrice != null &&
      selectedProduct &&
      parsedPrice >= selectedProduct.price
    ) {
      showToast("Flash sale price must be lower than the current price.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createVendorFlashSaleNomination(session, {
        productId: selectedProductId,
        eventId: selectedEventId,
        proposedPrice: parsedPrice ?? null,
        proposedOldPrice: selectedProduct?.price ?? null,
        vendorNote: vendorNote.trim() || null,
      });
      showToast("Nomination submitted for review.");
      router.replace("/vendor/flash-sales" as any);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't submit that nomination.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingVendorAccess || !hasVendorAccess) {
    return <VendorScreenShell title="Nominate product" loading loadingLabel="Loading..." />;
  }

  const isLoading = isLoadingProducts || isLoadingEvents;

  return (
    <VendorScreenShell title="Nominate product">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          vendorStyles.listContent,
          {
            paddingBottom: insets.bottom + rV(28),
          },
        ]}
      >
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth, gap: rV(14) }]}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : null}

          {!isLoading && liveProducts.length === 0 ? (
            <AccountEmptyState
              icon="cube-outline"
              title="No live products"
              message="Only approved live products can be nominated for flash sales."
              actionLabel="Manage products"
              onAction={() => router.push("/vendor/products" as any)}
            />
          ) : null}

          {liveProducts.length > 0 ? (
            <>
              <AccountListCard>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose product</Text>
                <View style={styles.optionList}>
                  {liveProducts.map((product) => {
                    const selected = selectedProductId === product.id;
                    return (
                      <TouchableOpacity
                        key={product.id}
                        activeOpacity={0.88}
                        onPress={() => setSelectedProductId(product.id)}
                        style={[
                          styles.optionRow,
                          {
                            borderColor: selected ? colors.primary : colors.cardBorder,
                            backgroundColor: selected ? colors.pill : "transparent",
                          },
                        ]}
                      >
                        <Text style={[styles.optionTitle, { color: colors.text }]} numberOfLines={1}>
                          {product.name}
                        </Text>
                        <Text style={[styles.optionMeta, { color: colors.textMuted }]}>
                          GHS {product.price.toFixed(2)} · Stock {product.stock}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </AccountListCard>

              <AccountListCard>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Flash event</Text>
                <View style={styles.optionList}>
                  {events.map((event) => {
                    const selected = selectedEventId === event.id;
                    return (
                      <TouchableOpacity
                        key={event.id}
                        activeOpacity={0.88}
                        onPress={() => setSelectedEventId(event.id)}
                        style={[
                          styles.optionRow,
                          {
                            borderColor: selected ? colors.primary : colors.cardBorder,
                            backgroundColor: selected ? colors.pill : "transparent",
                          },
                        ]}
                      >
                        <Text style={[styles.optionTitle, { color: colors.text }]} numberOfLines={1}>
                          {event.title}
                        </Text>
                        <Text style={[styles.optionMeta, { color: colors.textMuted }]}>
                          {event.productCount} products featured
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {events.length === 0 ? (
                    <Text style={[styles.optionMeta, { color: colors.textMuted }]}>
                      No active flash events right now. You can still submit an open nomination.
                    </Text>
                  ) : null}
                </View>
              </AccountListCard>

              <AccountListCard>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Flash pricing</Text>
                <TextInputField
                  label="Proposed flash price (GHS)"
                  value={proposedPrice}
                  onChangeText={setProposedPrice}
                  keyboardType="numeric"
                  placeholder={
                    selectedProduct
                      ? `Lower than GHS ${selectedProduct.price.toFixed(2)}`
                      : "Optional"
                  }
                />
                <TextInputField
                  label="Note for reviewers"
                  value={vendorNote}
                  onChangeText={setVendorNote}
                  placeholder="Why should this product be featured?"
                  multiline
                />
              </AccountListCard>

              <AccountActionButton
                label={isSubmitting ? "Submitting..." : "Submit nomination"}
                variant="primary"
                onPress={() => void handleSubmit()}
                disabled={isSubmitting}
              />
            </>
          ) : null}
        </View>
      </ScrollView>
    </VendorScreenShell>
  );
}

const styles = {
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    marginBottom: rV(12),
  },
  optionList: {
    gap: rV(8),
  },
  optionRow: {
    borderWidth: 1,
    borderRadius: rMS(14),
    paddingHorizontal: rV(14),
    paddingVertical: rV(12),
    gap: rV(4),
  },
  optionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
  },
  optionMeta: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
};
