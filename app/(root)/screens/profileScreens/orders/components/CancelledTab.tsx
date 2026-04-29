import { AppColors } from "@/constants/Colors";
import { resolveCatalogImage } from "@/constants/catalogImages";
import Fonts from "@/constants/Fonts";
import { Order } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function getPrimaryItem(order: Order) {
  return order.items[0];
}

function getImageSource(order: Order) {
  const primaryItem = getPrimaryItem(order);
  if (primaryItem?.image_key) {
    return resolveCatalogImage(primaryItem.image_key);
  }
  if (primaryItem?.image_url) {
    return { uri: primaryItem.image_url };
  }
  return null;
}

function formatCancelledDate(order: Order) {
  const value = order.cancelled_at ?? order.updated_at;
  return `Cancelled on ${new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export default function CancelledTab({
  orders,
}: {
  orders: Order[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No cancelled orders</Text>
          <Text style={styles.emptyText}>
            If an order is ever cancelled, the reason and total will appear here.
          </Text>
        </View>
      ) : (
        orders.map((item) => {
          const primaryItem = getPrimaryItem(item);
          const imageSource = getImageSource(item);

          return (
            <View key={item.id} style={styles.card} className="shadow-sm">
              <View style={styles.topRow}>
                <View style={styles.imageWrap}>
                  {imageSource ? (
                    <Image source={imageSource} style={styles.image} resizeMode="contain" />
                  ) : (
                    <Ionicons name="image-outline" size={rMS(28)} color={AppColors.subtext[100]} />
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.orderId}>#{item.order_number}</Text>
                  <Text style={styles.title}>{primaryItem?.title ?? "Order item"}</Text>
                  <Text style={styles.sub}>{primaryItem?.category ?? "Product"}</Text>
                  <Text style={styles.dateText}>{formatCancelledDate(item)}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Cancelled</Text>
                </View>
              </View>

              <View style={styles.reasonRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={rMS(14)}
                  color={AppColors.subtext[100]}
                />
                <Text style={styles.reasonText}>
                  Reason: {item.cancellation_reason || "Cancelled by the store"}
                </Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.amountText}>₵{item.total_amount.toFixed(2)}</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
                      params: { orderId: item.id },
                    })
                  }
                >
                  <Text style={styles.retryBtnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: rV(16),
  },
  emptyState: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    padding: rS(18),
  },
  emptyTitle: {
    fontSize: rMS(15),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    marginBottom: rV(6),
  },
  emptyText: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    lineHeight: rMS(18),
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    padding: rS(14),
    marginBottom: rV(10),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageWrap: {
    width: rMS(66),
    height: rMS(66),
    borderRadius: rMS(12),
    backgroundColor: "#F1F4F7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "84%",
    height: "84%",
  },
  info: {
    flex: 1,
    marginLeft: rS(12),
  },
  orderId: {
    fontSize: rMS(11),
    color: AppColors.subtext[100],
    fontFamily: Fonts.text,
  },
  title: {
    marginTop: rV(2),
    fontSize: rMS(15),
    color: AppColors.text,
    fontFamily: Fonts.title,
  },
  sub: {
    marginTop: rV(2),
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  dateText: {
    marginTop: rV(5),
    fontSize: rMS(11),
    color: "#B91C1C",
    fontFamily: Fonts.textBold,
  },
  badge: {
    backgroundColor: "#FEE2E2",
    borderRadius: rMS(999),
    paddingHorizontal: rS(9),
    paddingVertical: rV(4),
  },
  badgeText: {
    fontSize: rMS(10),
    color: "#B91C1C",
    fontFamily: Fonts.textBold,
  },
  reasonRow: {
    marginTop: rV(10),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
  },
  reasonText: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  footerRow: {
    marginTop: rV(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountText: {
    fontSize: rMS(16),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  retryBtn: {
    borderRadius: rMS(10),
    backgroundColor: AppColors.primary,
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
  },
  retryBtnText: {
    fontSize: rMS(12),
    color: AppColors.white,
    fontFamily: Fonts.textBold,
  },
});
