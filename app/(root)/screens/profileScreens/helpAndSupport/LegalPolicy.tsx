import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PolicyKey = "terms" | "privacy" | "shipping";

const POLICY_CONTENT: Record<PolicyKey, { title: string; subtitle: string; points: string[] }> = {
  terms: {
    title: "Terms of Service",
    subtitle: "How using the platform works",
    points: [
      "By using this platform, you agree to the active Terms of Service and applicable laws.",
      "Service features, product availability, and platform behavior may change over time.",
      "Continued usage after updates means acceptance of revised terms.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "How your data is handled",
    points: [
      "We collect account and order data to provide core shopping and delivery services.",
      "Payment processing uses encrypted channels and trusted processors.",
      "Only necessary data is shared with partners supporting fulfillment and operations.",
    ],
  },
  shipping: {
    title: "Shipping & Returns",
    subtitle: "Delivery, return windows and refunds",
    points: [
      "Standard delivery is typically 5-7 business days after order confirmation.",
      "Eligible items can be returned within the stated return period in valid condition.",
      "Refund timing depends on payment provider processing after return verification.",
    ],
  },
};

const POLICY_FILTERS: { key: PolicyKey; label: string }[] = [
  { key: "terms", label: "Terms" },
  { key: "privacy", label: "Privacy" },
  { key: "shipping", label: "Shipping" },
];

export default function LegalPoliciesScreen() {
  const [activePolicy, setActivePolicy] = useState<PolicyKey>("terms");
  const activeContent = useMemo(() => POLICY_CONTENT[activePolicy], [activePolicy]);

  return (
    <View style={styles.container}>
      <ProfileHeader title="Legal & Policies" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard} className="shadow-sm">
          <Ionicons name="shield-checkmark-outline" size={rMS(26)} color={AppColors.white} />
          <Text style={styles.heroTitle}>Policy Center</Text>
          <Text style={styles.heroSub}>
            Transparent policies to keep your shopping, payments, and data secure.
          </Text>
        </View>

        <View style={styles.filterRow}>
          {POLICY_FILTERS.map((item) => {
            const isActive = item.key === activePolicy;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                onPress={() => setActivePolicy(item.key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionCard} className="shadow-sm">
          <Text style={styles.sectionTitle}>{activeContent.title}</Text>
          <Text style={styles.sectionSub}>{activeContent.subtitle}</Text>

          <View style={styles.divider} />

          {activeContent.points.map((point, index) => (
            <View key={`${activePolicy}-${index}`} style={styles.pointRow}>
              <View style={styles.bullet} />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerCard} className="shadow-sm">
          <Text style={styles.footerMeta}>Last updated: February 16, 2026</Text>
          <Text style={styles.footerText}>
            For legal enquiries, contact our support/legal team.
          </Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.footerEmail}>legal@odosapp.com</Text>
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
  },
  heroTitle: {
    marginTop: rV(6),
    fontSize: rMS(17),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
  },
  heroSub: {
    marginTop: rV(4),
    textAlign: "center",
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: "#E7EDF2",
    fontFamily: Fonts.text,
  },
  filterRow: {
    marginTop: rV(12),
    flexDirection: "row",
    gap: rS(8),
  },
  filterBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(10),
    borderRadius: rMS(999),
    borderWidth: 1,
    borderColor: "#D6DCE5",
    backgroundColor: AppColors.white,
  },
  filterBtnActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterText: {
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  filterTextActive: {
    color: AppColors.white,
  },
  sectionCard: {
    marginTop: rV(12),
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
  },
  sectionTitle: {
    fontSize: rMS(16),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  sectionSub: {
    marginTop: rV(4),
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  divider: {
    marginVertical: rV(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E8ECF1",
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: rV(10),
  },
  bullet: {
    marginTop: rV(6),
    width: rMS(6),
    height: rMS(6),
    borderRadius: rMS(3),
    backgroundColor: AppColors.primary,
    marginRight: rS(8),
  },
  pointText: {
    flex: 1,
    fontSize: rMS(12),
    lineHeight: rMS(19),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  footerCard: {
    marginTop: rV(12),
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    paddingVertical: rV(16),
    paddingHorizontal: rS(14),
    alignItems: "center",
  },
  footerMeta: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: AppColors.subtext[100],
  },
  footerText: {
    marginTop: rV(8),
    fontSize: rMS(12),
    textAlign: "center",
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  footerEmail: {
    marginTop: rV(6),
    fontSize: rMS(13),
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
  },
});
