import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function formatCurrency(value: number) {
  return `₵${value.toFixed(2)}`;
}

export default function OrderSuccessScreen() {
  const params = useLocalSearchParams();
  const orderNumber = getParam(params.orderNumber) ?? "ORD-000000";
  const orderId = getParam(params.orderId) ?? "";
  const total = Number(getParam(params.total) ?? 0);
  const itemCount = Number(getParam(params.itemCount) ?? 1);
  const eta = getParam(params.eta) ?? "Estimated delivery in 2–3 days";

  return (
    <View style={styles.container}>
      <ProfileHeader title="Order Confirmed" showBackButton={false} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={rMS(72)} color="#15803D" />
          </View>
          <Text style={styles.title}>Your order is in</Text>
          <Text style={styles.subtitle}>
            We’ve received everything successfully and started preparing it for delivery.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order number</Text>
            <Text style={styles.summaryValue}>#{orderNumber}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total paid</Text>
            <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowLast]}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryEta}>{eta}</Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="mail-unread-outline" size={rMS(18)} color={AppColors.primary} />
          <Text style={styles.noteText}>
            We’ll keep your order updated in My Orders as it moves through processing and delivery.
          </Text>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>What happens next</Text>
          <View style={styles.timelineStep}>
            <Ionicons name="checkmark-circle" size={rMS(18)} color="#16A34A" />
            <Text style={styles.timelineText}>Your order has been placed successfully.</Text>
          </View>
          <View style={styles.timelineStep}>
            <Ionicons name="radio-button-on" size={rMS(18)} color="#2563EB" />
            <Text style={styles.timelineText}>We’re preparing it for delivery now.</Text>
          </View>
          <View style={styles.timelineStep}>
            <Ionicons name="ellipse-outline" size={rMS(18)} color="#A0AEC0" />
            <Text style={styles.timelineText}>You’ll be able to confirm delivery once it arrives.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.88}
          onPress={() =>
            router.replace({
              pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
              params: { orderId },
            })
          }
        >
          <Text style={styles.primaryButtonText}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.88}
          onPress={() => router.replace("/(root)/(tabs)")}
        >
          <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: rS(18),
    paddingTop: rV(22),
    paddingBottom: rV(150),
  },
  hero: {
    alignItems: "center",
    paddingHorizontal: rS(12),
    marginBottom: rV(22),
  },
  iconWrap: {
    width: rMS(108),
    height: rMS(108),
    borderRadius: rMS(54),
    backgroundColor: "#EAF7EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rV(18),
  },
  title: {
    fontSize: rMS(26),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
    marginBottom: rV(8),
    textAlign: "center",
  },
  subtitle: {
    fontSize: rMS(13),
    lineHeight: rMS(20),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    textAlign: "center",
    maxWidth: rS(300),
  },
  summaryCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(22),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    marginBottom: rV(14),
    borderWidth: 1,
    borderColor: "#E7EBF0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: rS(12),
    paddingVertical: rV(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E7EBF0",
  },
  summaryRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  summaryLabel: {
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  summaryValue: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  summaryEta: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: "#15803D",
    textAlign: "right",
    flex: 1,
  },
  noteCard: {
    backgroundColor: "#EEF4FF",
    borderRadius: rMS(18),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
  },
  noteText: {
    flex: 1,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    fontFamily: Fonts.text,
    color: AppColors.text,
  },
  timelineCard: {
    marginTop: rV(14),
    backgroundColor: AppColors.white,
    borderRadius: rMS(18),
    paddingHorizontal: rS(14),
    paddingVertical: rV(16),
    borderWidth: 1,
    borderColor: "#E7EBF0",
    gap: rV(12),
  },
  timelineTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
  },
  timelineText: {
    flex: 1,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: AppColors.white,
    paddingHorizontal: rS(18),
    paddingTop: rV(14),
    paddingBottom: rV(26),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E7EBF0",
    gap: rV(10),
  },
  primaryButton: {
    minHeight: rV(52),
    borderRadius: rMS(16),
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  secondaryButton: {
    minHeight: rV(52),
    borderRadius: rMS(16),
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
});
