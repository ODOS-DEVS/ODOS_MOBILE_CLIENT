import {
  AccountActionButton,
  AccountListCard,
  AccountSectionCard,
  useAccountStyles,
  formatOrderMoney,
  OrderSummaryRow,
  useOrderStyles,
} from "@/components/orders/OrderUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ThemeColors } from "@/constants/theme";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function OrderSuccessScreen() {
  const accountStyles = useAccountStyles();
  const orderStyles = useOrderStyles();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
            <Ionicons name="checkmark-circle" size={rMS(72)} color={colors.successText} />
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
          <Ionicons name="mail-unread-outline" size={rMS(18)} color={colors.primary} />
          <Text style={styles.noteText}>
            We&apos;ll keep your order updated in My Orders as it moves through processing and delivery.
          </Text>
        </View>

        <AccountSectionCard title="What happens next">
          <View style={styles.timelineStep}>
            <Ionicons name="checkmark-circle" size={rMS(18)} color={colors.successText} />
            <Text style={styles.timelineText}>Your order has been placed successfully.</Text>
          </View>
          <View style={styles.timelineStep}>
            <Ionicons name="radio-button-on" size={rMS(18)} color={colors.infoText} />
            <Text style={styles.timelineText}>We&apos;re preparing it for delivery now.</Text>
          </View>
          <View style={styles.timelineStep}>
            <Ionicons name="ellipse-outline" size={rMS(18)} color={colors.iconMuted} />
            <Text style={styles.timelineText}>
              You&apos;ll be able to confirm delivery once it arrives.
            </Text>
          </View>
        </AccountSectionCard>
      </ScrollView>

      <View style={[orderStyles.stickyFooter, { paddingBottom: insets.bottom + rV(12) }]}>
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
      backgroundColor: colors.successSoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: rV(18),
    },
    title: {
      fontSize: rMS(26),
      fontFamily: Fonts.titleBold,
      color: colors.text,
      marginBottom: rV(8),
      textAlign: "center",
    },
    subtitle: {
      fontSize: rMS(13),
      lineHeight: rMS(20),
      fontFamily: Fonts.text,
      color: colors.textMuted,
      textAlign: "center",
      maxWidth: rS(300),
    },
    noteCard: {
      backgroundColor: colors.infoSoft,
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
      color: colors.text,
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
      color: colors.textMuted,
    },
  });
}
