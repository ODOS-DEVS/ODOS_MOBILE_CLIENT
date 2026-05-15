import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const resources = [
  {
    id: "res-1",
    icon: "book-outline" as const,
    title: "Buying Guide",
    subtitle: "Learn how to find authentic products and compare options faster.",
  },
  {
    id: "res-2",
    icon: "card-outline" as const,
    title: "Payment Safety",
    subtitle: "Understand secure checkout, card protection and payment best practices.",
  },
  {
    id: "res-3",
    icon: "cube-outline" as const,
    title: "Shipping Guide",
    subtitle: "Delivery timelines, tracking milestones and handling return cases.",
  },
  {
    id: "res-4",
    icon: "shield-checkmark-outline" as const,
    title: "Account Security",
    subtitle: "Protect your account with stronger credentials and privacy controls.",
  },
];

export default function ResourcesScreen() {
  const { requireAuth } = useRequireAuth();

  return (
    <View style={styles.container}>
      <ProfileHeader title="Resources" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard} className="shadow-sm">
          <Ionicons name="library-outline" size={rMS(26)} color={AppColors.white} />
          <Text style={styles.heroTitle}>Knowledge Center</Text>
          <Text style={styles.heroSub}>
            Practical guides to help you shop smarter and resolve issues faster.
          </Text>
        </View>

        {resources.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.resourceCard}
            className="shadow-sm"
            activeOpacity={0.85}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={rMS(20)} color={AppColors.secondary} />
            </View>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>{item.title}</Text>
              <Text style={styles.resourceSub}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={rMS(16)} color={AppColors.subtext[100]} />
          </TouchableOpacity>
        ))}

        <View style={styles.contactCard} className="shadow-sm">
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSub}>
            Our support team can guide you through account, payment, and order concerns.
          </Text>
          <TouchableOpacity
            style={styles.contactBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (
                !requireAuth({
                  title: "Sign in to contact support",
                  message:
                    "Log in so your conversation with the admin team stays attached to your account.",
                })
              ) {
                return;
              }

              router.push({
                pathname: "/screens/support/chat",
                params: {
                  subject: "Guidance from the resource center",
                  fallback: "/(root)/screens/profileScreens/helpAndSupport/Resources",
                },
              });
            }}
          >
            <Text style={styles.contactBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(14),
    paddingBottom: rV(28),
  },
  heroCard: {
    backgroundColor: AppColors.secondary,
    borderRadius: rMS(16),
    paddingVertical: rV(16),
    paddingHorizontal: rS(14),
    alignItems: "center",
    marginBottom: rV(12),
  },
  heroTitle: {
    marginTop: rV(6),
    fontSize: rMS(17),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
  },
  heroSub: {
    marginTop: rV(4),
    fontSize: rMS(12),
    textAlign: "center",
    lineHeight: rMS(18),
    color: "#E7EDF2",
    fontFamily: Fonts.text,
  },
  resourceCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(14),
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rV(10),
  },
  iconWrap: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(10),
    backgroundColor: "#EFF3F7",
    alignItems: "center",
    justifyContent: "center",
  },
  resourceInfo: {
    flex: 1,
    marginLeft: rS(10),
    marginRight: rS(8),
  },
  resourceTitle: {
    fontSize: rMS(14),
    color: AppColors.text,
    fontFamily: Fonts.title,
  },
  resourceSub: {
    marginTop: rV(4),
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    lineHeight: rMS(18),
  },
  contactCard: {
    marginTop: rV(4),
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    paddingHorizontal: rS(14),
    paddingVertical: rV(16),
    alignItems: "center",
  },
  contactTitle: {
    fontSize: rMS(16),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  contactSub: {
    marginTop: rV(6),
    textAlign: "center",
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  contactBtn: {
    marginTop: rV(12),
    borderRadius: rMS(10),
    paddingHorizontal: rS(18),
    paddingVertical: rV(10),
    backgroundColor: AppColors.primary,
  },
  contactBtnText: {
    fontSize: rMS(12),
    color: AppColors.white,
    fontFamily: Fonts.textBold,
  },
});
