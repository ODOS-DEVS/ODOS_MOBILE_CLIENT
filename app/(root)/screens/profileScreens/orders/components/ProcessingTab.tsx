import { AppColors } from "@/constants/Colors";
import { resolveCatalogImage } from "@/constants/catalogImages";
import Fonts from "@/constants/Fonts";
import { Order } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

function formatPlacedDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function ProcessingTab({
  orders,
  onCancelOrder,
  isMutatingOrder,
}: {
  orders: Order[];
  onCancelOrder: (orderId: string) => Promise<unknown>;
  isMutatingOrder: boolean;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No active orders yet</Text>
          <Text style={styles.emptyText}>
            Orders you place will show up here while they’re being prepared and delivered.
          </Text>
        </View>
      ) : (
        orders.map((order) => {
          const item = getPrimaryItem(order);
          const imageSource = getImageSource(order);
          const progress = Math.round((order.progress ?? 0.18) * 100);

          return (
            <View key={order.id} style={styles.card} className="shadow-sm">
              <View style={styles.topRow}>
                <View style={styles.imageWrap}>
                  {imageSource ? (
                    <Image source={imageSource} style={styles.image} resizeMode="contain" />
                  ) : (
                    <Ionicons name="image-outline" size={rMS(28)} color={AppColors.subtext[100]} />
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.orderId}>#{order.order_number}</Text>
                  <Text style={styles.title}>{item?.title ?? "Order item"}</Text>
                  <Text style={styles.sub}>
                    {item?.category ?? "Product"} · Placed {formatPlacedDate(order.placed_at)}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>In Transit</Text>
                </View>
              </View>

              <View style={styles.progressMetaRow}>
                <Text style={styles.etaText}>{order.tracking_eta ?? "Preparing your delivery"}</Text>
                <Text style={styles.percentText}>{progress}%</Text>
              </View>
              <View style={styles.trackBar}>
                <View style={[styles.trackFill, { width: `${progress}%` }]} />
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.outlineBtn}
                  activeOpacity={0.85}
                  onPress={() =>
                    Alert.alert(
                      "Cancel this order?",
                      "We’ll move it to your cancelled orders list.",
                      [
                        { text: "Keep order", style: "cancel" },
                        {
                          text: "Cancel order",
                          style: "destructive",
                          onPress: () => {
                            void onCancelOrder(order.id);
                          },
                        },
                      ],
                    )
                  }
                  disabled={isMutatingOrder}
                >
                  <Ionicons name="location-outline" size={rMS(14)} color={AppColors.text} />
                  <Text style={styles.outlineBtnText}>
                    {isMutatingOrder ? "Updating..." : "Cancel Order"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.solidBtn}
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
                      params: { orderId: order.id },
                    })
                  }
                >
                  <Text style={styles.solidBtnText}>View Details</Text>
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
  badge: {
    backgroundColor: "#DBEAFE",
    borderRadius: rMS(999),
    paddingHorizontal: rS(9),
    paddingVertical: rV(4),
  },
  badgeText: {
    fontSize: rMS(10),
    color: "#1D4ED8",
    fontFamily: Fonts.textBold,
  },
  progressMetaRow: {
    marginTop: rV(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  etaText: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.textBold,
  },
  percentText: {
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  trackBar: {
    marginTop: rV(8),
    height: rMS(7),
    borderRadius: rMS(999),
    backgroundColor: "#E9EEF5",
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: rMS(999),
  },
  actionRow: {
    marginTop: rV(13),
    flexDirection: "row",
    gap: rS(10),
  },
  outlineBtn: {
    flex: 1,
    borderRadius: rMS(12),
    borderWidth: 1,
    borderColor: "#D6DCE5",
    backgroundColor: AppColors.white,
    paddingVertical: rV(11),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: rS(5),
  },
  outlineBtnText: {
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  solidBtn: {
    flex: 1,
    borderRadius: rMS(12),
    backgroundColor: AppColors.primary,
    paddingVertical: rV(11),
    alignItems: "center",
    justifyContent: "center",
  },
  solidBtnText: {
    fontSize: rMS(12),
    color: AppColors.white,
    fontFamily: Fonts.textBold,
  },
});
