import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const cancelledOrders = [
  {
    id: "ORD-10440",
    title: "Silk Summer Dress",
    category: "Clothing",
    amount: 180,
    cancelledOn: "Cancelled on Feb 01, 2026",
    reason: "Payment timeout",
    image: require("@/assets/images/dress.png"),
  },
  {
    id: "ORD-10390",
    title: "Women Tote Bag",
    category: "Bags",
    amount: 140,
    cancelledOn: "Cancelled on Jan 27, 2026",
    reason: "Out of stock",
    image: require("@/assets/images/handbag.png"),
  },
];

export default function CancelledTab() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {cancelledOrders.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.imageWrap}>
              <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>
            <View style={styles.info}>
              <Text style={styles.orderId}>#{item.id}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.sub}>{item.category}</Text>
              <Text style={styles.dateText}>{item.cancelledOn}</Text>
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
            <Text style={styles.reasonText}>Reason: {item.reason}</Text>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.amountText}>₵{item.amount.toFixed(2)}</Text>
            <TouchableOpacity style={styles.retryBtn} activeOpacity={0.85}>
              <Text style={styles.retryBtnText}>Order Again</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
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
