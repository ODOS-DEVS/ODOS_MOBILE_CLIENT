import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DeliveredOrder = {
  id: string;
  title: string;
  category: string;
  total: number;
  qty: number;
  deliveredOn: string;
  image: any;
};

const deliveredOrders: DeliveredOrder[] = [
  {
    id: "ORD-10492",
    title: "Karia Backpack",
    category: "Travel Bag",
    total: 98,
    qty: 1,
    deliveredOn: "Delivered on Feb 10, 2026",
    image: require("@/assets/images/backpack1.png"),
  },
  {
    id: "ORD-10311",
    title: "Classic Watch",
    category: "Accessories",
    total: 129,
    qty: 1,
    deliveredOn: "Delivered on Feb 02, 2026",
    image: require("@/assets/images/headset.png"),
  },
  {
    id: "ORD-10244",
    title: "Urban Sneakers",
    category: "Footwear",
    total: 88,
    qty: 1,
    deliveredOn: "Delivered on Jan 28, 2026",
    image: require("@/assets/images/shoe5.png"),
  },
];

export default function DeliveredTab() {
  const [selectedOrder, setSelectedOrder] = useState<DeliveredOrder | null>(null);

  if (selectedOrder) {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => setSelectedOrder(null)}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={rMS(16)} color={AppColors.secondary} />
          <Text style={styles.backLinkText}>Back to Delivered Orders</Text>
        </TouchableOpacity>

        <View style={styles.card} className="shadow-sm">
          <View style={styles.orderTop}>
            <View style={styles.imageWrap}>
              <Image source={selectedOrder.image} style={styles.image} resizeMode="contain" />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>#{selectedOrder.id}</Text>
              <Text style={styles.title}>{selectedOrder.title}</Text>
              <Text style={styles.sub}>{selectedOrder.category}</Text>
            </View>
            <View style={styles.badgeDelivered}>
              <Text style={styles.badgeDeliveredText}>Delivered</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Quantity</Text>
            <Text style={styles.metaValue}>{selectedOrder.qty}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Delivery Date</Text>
            <Text style={styles.metaValue}>{selectedOrder.deliveredOn.replace("Delivered on ", "")}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment</Text>
            <Text style={styles.metaValue}>MTN Mobile Money</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Shipping</Text>
            <Text style={styles.metaValue}>Regular Delivery</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.totalLabel}>Amount Paid</Text>
            <Text style={styles.totalValue}>₵{selectedOrder.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Download Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => router.push("/(root)/screens/profileScreens/Account/Reviews")}
          >
            <Text style={styles.primaryBtnText}>Rate Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {deliveredOrders.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          className="shadow-sm"
          onPress={() => setSelectedOrder(item)}
          activeOpacity={0.82}
        >
          <View style={styles.orderTop}>
            <View style={styles.imageWrap}>
              <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>#{item.id}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.sub}>{item.category}</Text>
              <Text style={styles.deliveredOn}>{item.deliveredOn}</Text>
            </View>
            <View style={styles.rightColumn}>
              <View style={styles.badgeDelivered}>
                <Text style={styles.badgeDeliveredText}>Delivered</Text>
              </View>
              <Text style={styles.price}>₵{item.total}</Text>
              <Ionicons
                name="chevron-forward"
                size={rMS(16)}
                color={AppColors.subtext[100]}
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: rV(16),
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
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rV(10),
    gap: rS(3),
  },
  backLinkText: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.textBold,
  },
  divider: {
    marginVertical: rV(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E8ECF1",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rV(8),
  },
  metaLabel: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  metaValue: {
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  totalLabel: {
    fontSize: rMS(14),
    color: AppColors.text,
    fontFamily: Fonts.title,
  },
  totalValue: {
    fontSize: rMS(16),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  actionsRow: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(4),
  },
  primaryBtn: {
    flex: 1,
    borderRadius: rMS(12),
    backgroundColor: AppColors.primary,
    paddingVertical: rV(13),
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: rMS(13),
    color: AppColors.white,
    fontFamily: Fonts.textBold,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: rMS(12),
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: "#D6DCE5",
    paddingVertical: rV(13),
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: rMS(13),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
});
