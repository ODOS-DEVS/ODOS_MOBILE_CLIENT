import { AppColors } from "@/constants/Colors";
import { resolveCatalogImage } from "@/constants/catalogImages";
import Fonts from "@/constants/Fonts";
import { Order } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

function formatDeliveredText(order: Order) {
  const value = order.delivered_at ?? order.placed_at;
  return `Delivered on ${new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export default function DeliveredTab({ orders }: { orders: Order[] }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No delivered orders yet</Text>
          <Text style={styles.emptyText}>
            Once orders are completed, their receipts and delivery details will show up here.
          </Text>
        </View>
      ) : (
        orders.map((item) => {
          const primaryItem = getPrimaryItem(item);
          const imageSource = getImageSource(item);

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              className="shadow-sm"
              onPress={() =>
                router.push({
                  pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
                  params: { orderId: item.id },
                })
              }
              activeOpacity={0.82}
            >
              <View style={styles.orderTop}>
                <View style={styles.imageWrap}>
                  {imageSource ? (
                    <Image source={imageSource} style={styles.image} resizeMode="contain" />
                  ) : (
                    <Ionicons name="image-outline" size={rMS(28)} color={AppColors.subtext[100]} />
                  )}
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>#{item.order_number}</Text>
                  <Text style={styles.title}>{primaryItem?.title ?? "Order item"}</Text>
                  <Text style={styles.sub}>{primaryItem?.category ?? "Product"}</Text>
                  <Text style={styles.deliveredOn}>{formatDeliveredText(item)}</Text>
                </View>
                <View style={styles.rightColumn}>
                  <View style={styles.badgeDelivered}>
                    <Text style={styles.badgeDeliveredText}>Delivered</Text>
                  </View>
                  <Text style={styles.price}>₵{item.total_amount.toFixed(2)}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={rMS(16)}
                    color={AppColors.subtext[100]}
                  />
                </View>
              </View>
            </TouchableOpacity>
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
  orderTop: {
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
  orderInfo: {
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
  deliveredOn: {
    marginTop: rV(5),
    fontSize: rMS(11),
    color: "#15803D",
    fontFamily: Fonts.textBold,
  },
  rightColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: rMS(66),
  },
  badgeDelivered: {
    backgroundColor: "#DCFCE7",
    borderRadius: rMS(999),
    paddingHorizontal: rS(9),
    paddingVertical: rV(4),
  },
  badgeDeliveredText: {
    fontSize: rMS(10),
    color: "#166534",
    fontFamily: Fonts.textBold,
  },
  price: {
    fontSize: rMS(16),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
});
