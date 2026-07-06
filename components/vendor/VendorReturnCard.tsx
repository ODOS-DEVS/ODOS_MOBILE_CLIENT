import { AccountBadge, AccountListCard } from "@/components/account/AccountUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { VendorReturnRequest } from "@/types/store";
import {
  formatVendorReturnStatus,
  formatVendorReturnType,
  isOpenVendorReturn,
} from "@/utils/vendorReturns";
import { resolveApiMediaUrl } from "@/utils/media";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type VendorReturnCardProps = {
  item: VendorReturnRequest;
  onPress: () => void;
};

function statusTone(status: string): "success" | "warning" | "neutral" {
  if (status === "approved" || status === "completed" || status === "refunded") {
    return "success";
  }
  if (isOpenVendorReturn(status)) {
    return "warning";
  }
  return "neutral";
}

export default function VendorReturnCard({ item, onPress }: VendorReturnCardProps) {
  const { colors } = useTheme();
  const imageUri = resolveApiMediaUrl(item.productImageUrl) ?? item.productImageUrl;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <AccountListCard style={styles.card}>
        <View style={styles.headerRow}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.imageFallback, { backgroundColor: colors.pill }]}>
              <Text style={[styles.imageFallbackText, { color: colors.textMuted }]}>Item</Text>
            </View>
          )}
          <View style={styles.copy}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {item.productTitle}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
              {item.orderNumber} · Qty {item.quantity}
            </Text>
            <Text style={[styles.reason, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.reason}
            </Text>
          </View>
          <AccountBadge label={formatVendorReturnStatus(item.status)} tone={statusTone(item.status)} />
        </View>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {formatVendorReturnType(item.requestType)}
        </Text>
      </AccountListCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: rV(8),
    marginBottom: rV(10),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
  },
  image: {
    width: rMS(56),
    height: rMS(56),
    borderRadius: rMS(12),
  },
  imageFallback: {
    width: rMS(56),
    height: rMS(56),
    borderRadius: rMS(12),
    alignItems: "center",
    justifyContent: "center",
  },
  imageFallbackText: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
  },
  copy: {
    flex: 1,
    gap: rV(3),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    lineHeight: rMS(18),
  },
  subtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  reason: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(17),
  },
  meta: {
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
});
