import {
  AccountActionButton,
  AccountListCard,
  AccountSectionCard,
  accountStyles,
  formatOrderMoney,
  OrderSummaryRow,
  orderStyles,
} from "@/components/orders/OrderUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function OrderSuccessScreen() {
  const params = useLocalSearchParams();
  useBlockBackNavigation(true);
  const orderNumber = getParam(params.orderNumber) ?? "ORD-000000";
  const orderId = getParam(params.orderId) ?? "";
  const total = Number(getParam(params.total) ?? 0);
  const itemCount = Number(getParam(params.itemCount) ?? 1);
  const eta = getParam(params.eta) ?? "Estimated delivery in 2–3 days";

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Order Confirmed" showBackButton={false} />

      <ScrollView
        contentContainerStyle={[accountStyles.content, styles.scrollContent]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={rMS(72)} color="#15803D" />
          </View>
          <Text style={styles.title}>Your order is in</Text>
          <Text style={styles.subtitle}>
            We&apos;ve received everything successfully and started preparing it for delivery.
          </Text>
        </View>

        <AccountListCard>
          <OrderSummaryRow label="Order number" value={`#${orderNumber}`} />
          <OrderSummaryRow
            label="Items"
            value={`${itemCount} item${itemCount === 1 ? "" : "s"}`}
          />
          <OrderSummaryRow label="Total paid" value={formatOrderMoney(total)} />
          <OrderSummaryRow label="Delivery" value={eta} accent="success" last />
        </AccountListCard>

        <View style={styles.noteCard}>
          <Ionicons name="mail-unread-outline" size={rMS(18)} color={AppColors.primary} />
          <Text style={styles.noteText}>
            We&apos;ll keep your order updated in My Orders as it moves through processing and delivery.
          </Text>
        </View>

        <AccountSectionCard title="What happens next">
          <View style={styles.timelineStep}>
            <Ionicons name="checkmark-circle" size={rMS(18)} color="#16A34A" />
            <Text style={styles.timelineText}>Your order has been placed successfully.</Text>
          </View>
          <View style={styles.timelineStep}>
            <Ionicons name="radio-button-on" size={rMS(18)} color="#2563EB" />
            <Text style={styles.timelineText}>We&apos;re preparing it for delivery now.</Text>
          </View>
          <View style={styles.timelineStep}>
            <Ionicons name="ellipse-outline" size={rMS(18)} color="#A0AEC0" />
            <Text style={styles.timelineText}>
              You&apos;ll be able to confirm delivery once it arrives.
            </Text>
          </View>
        </AccountSectionCard>
      </ScrollView>

      <View style={orderStyles.stickyFooter}>
        <AccountActionButton
          label="Track Order"
          variant="primary"
          onPress={() =>
            router.replace({
              pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
              params: { orderId },
            })
          }
        />
        <AccountActionButton
          label="Continue Shopping"
          variant="secondary"
          onPress={() => router.replace("/(root)/(tabs)")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: rV(150),
  },
  hero: {
    alignItems: "center",
    paddingHorizontal: rS(12),
    marginBottom: rV(6),
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
    color: "#6B7280",
    textAlign: "center",
    maxWidth: rS(300),
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
  timelineStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    marginBottom: rV(10),
  },
  timelineText: {
    flex: 1,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    fontFamily: Fonts.text,
    color: "#6B7280",
  },
});
