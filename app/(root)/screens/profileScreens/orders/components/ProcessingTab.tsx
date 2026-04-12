import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const processingOrders = [
  {
    id: "ORD-10519",
    title: "Elegant Handbag",
    category: "Bags",
    eta: "Arriving Tomorrow",
    progress: 0.72,
    image: require("@/assets/images/handbag.png"),
  },
  {
    id: "ORD-10503",
    title: "Men's Analog Watch",
    category: "Accessories",
    eta: "Arriving in 2 days",
    progress: 0.4,
    image: require("@/assets/images/watch1.png"),
  },
];

export default function ProcessingTab() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {processingOrders.map((item) => (
        <View key={item.id} style={styles.card} className="shadow-sm">
          <View style={styles.topRow}>
            <View style={styles.imageWrap}>
              <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>
            <View style={styles.info}>
              <Text style={styles.orderId}>#{item.id}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.sub}>{item.category}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>In Transit</Text>
            </View>
          </View>

          <View style={styles.progressMetaRow}>
            <Text style={styles.etaText}>{item.eta}</Text>
            <Text style={styles.percentText}>{Math.round(item.progress * 100)}%</Text>
          </View>
          <View style={styles.trackBar}>
            <View style={[styles.trackFill, { width: `${Math.round(item.progress * 100)}%` }]} />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.85}>
              <Ionicons name="location-outline" size={rMS(14)} color={AppColors.text} />
              <Text style={styles.outlineBtnText}>Track Package</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.solidBtn} activeOpacity={0.85}>
              <Text style={styles.solidBtnText}>View Details</Text>
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
