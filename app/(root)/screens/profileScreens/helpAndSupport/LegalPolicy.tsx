import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Section {
  id: string;
  title: string;
  content: string[];
}

const LEGAL_SECTIONS: Section[] = [
  {
    id: "terms",
    title: "1. Terms of Service",
    content: [
      "By accessing and using this e-commerce platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.",
      "The materials and products on this platform are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.",
      "We reserve the right to modify these terms at any time. By continuing to use the platform after changes are posted, you agree to be bound by the revised terms.",
    ],
  },
  {
    id: "changes",
    title: "2. Changes to Service and Terms",
    content: [
      "We reserve the right to modify, suspend, or discontinue any aspect of our service at any time without prior notice. This includes but is not limited to features, products, pricing, and availability.",
      "Price changes may occur at any time and will be reflected on the platform immediately. Products in your cart are not reserved at the displayed price until payment is completed.",
      "Terms of Service updates will be posted on this page with the revision date. It is your responsibility to review these terms periodically.",
    ],
  },
  {
    id: "privacy",
    title: "3. Privacy Policy",
    content: [
      "We collect personal information including your name, email, shipping address, payment metadata, and browsing behavior to process orders and improve services.",
      "Payment information is processed through secure encrypted connections. Complete credit card details are not stored on our servers.",
      "Information may be shared with trusted service providers strictly for order fulfillment and service operations.",
    ],
  },
  {
    id: "shipping",
    title: "4. Shipping and Returns",
    content: [
      "Standard shipping typically takes 5-7 business days from the date of order confirmation. Expedited shipping options are available at checkout.",
      "Items may be returned within 30 days of delivery in original condition where applicable.",
      "Sale items and personalized products may have limited return eligibility unless defective.",
    ],
  },
];

export default function LegalPoliciesScreen() {
  return (
    <View style={styles.container}>
      <ProfileHeader title="Legal & Policies" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {LEGAL_SECTIONS.map((section) => (
          <View key={section.id} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.map((paragraph, index) => (
              <Text key={`${section.id}-${index}`} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.footerCard}>
          <Text style={styles.footerMeta}>Last updated: February 16, 2026</Text>
          <Text style={styles.footerText}>
            For legal enquiries, contact our support/legal team:
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
    paddingTop: rV(16),
    paddingBottom: rV(28),
  },
  sectionCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    marginBottom: rV(10),
  },
  sectionTitle: {
    fontSize: rMS(15),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
    marginBottom: rV(8),
  },
  paragraph: {
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(19),
    marginBottom: rV(8),
  },
  footerCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
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
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    textAlign: "center",
  },
  footerEmail: {
    marginTop: rV(6),
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.primary,
  },
});
