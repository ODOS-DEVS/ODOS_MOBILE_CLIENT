import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  AccountBulletList,
  AccountInsightCard,
  AccountListCard,
  AccountMetaFooter,
  AccountSegmentedTabs,
  useAccountStyles,
} from "@/components/profile/ProfileHubUi";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rV } from "@/styles/responsive";
import React, { useMemo, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

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

const POLICY_TABS: Array<{ key: PolicyKey; label: string }> = [
  { key: "terms", label: "Terms" },
  { key: "privacy", label: "Privacy" },
  { key: "shipping", label: "Shipping" },
];

export default function LegalPoliciesScreen() {
  const accountStyles = useAccountStyles();
  const [activePolicy, setActivePolicy] = useState<PolicyKey>("terms");
  const activeContent = useMemo(() => POLICY_CONTENT[activePolicy], [activePolicy]);

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Legal & Policies" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={accountStyles.content}>
        <AccountInsightCard
          title="Policy center"
          subtitle="Transparent policies for shopping, payments, privacy, and delivery on ODOS."
          stats={[
            { value: 3, label: "Policies" },
            { value: "Feb 2026", label: "Updated" },
          ]}
        />

        <AccountSegmentedTabs
          options={POLICY_TABS}
          activeKey={activePolicy}
          onChange={setActivePolicy}
        />

        <AccountListCard>
          <Text style={policyStyles.title}>{activeContent.title}</Text>
          <Text style={policyStyles.subtitle}>{activeContent.subtitle}</Text>
          <View style={policyStyles.divider} />
          <AccountBulletList points={activeContent.points} />
        </AccountListCard>

        <AccountMetaFooter
          meta="Last updated · February 16, 2026"
          message="For legal enquiries, contact our support or legal team."
          actionLabel="legal@odosapp.com"
          onAction={() => void Linking.openURL("mailto:legal@odosapp.com")}
        />
      </ScrollView>
    </View>
  );
}

const policyStyles = StyleSheet.create({
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
  },
  subtitle: {
    marginTop: rV(4),
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
  },
  divider: {
    marginVertical: rV(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF2F6",
  },
});
