import {
  AccountActionButton,
  AccountInsightCard,
  AccountLinkRow,
  AccountListCard,
  accountStyles,
} from "@/components/profile/ProfileHubUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rMS, rV } from "@/styles/responsive";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const resources = [
  {
    id: "res-1",
    icon: "book-outline" as const,
    title: "Buying guide",
    subtitle: "Find authentic products and compare options with confidence.",
  },
  {
    id: "res-2",
    icon: "card-outline" as const,
    title: "Payment safety",
    subtitle: "Secure checkout, card protection, and payment best practices.",
  },
  {
    id: "res-3",
    icon: "cube-outline" as const,
    title: "Shipping guide",
    subtitle: "Delivery timelines, tracking milestones, and return basics.",
  },
  {
    id: "res-4",
    icon: "shield-checkmark-outline" as const,
    title: "Account security",
    subtitle: "Stronger credentials, privacy controls, and safer sign-in.",
  },
];

export default function ResourcesScreen() {
  const { requireAuth } = useRequireAuth();

  const openSupport = () => {
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
  };

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Resources" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={accountStyles.content}>
        <AccountInsightCard
          title="Knowledge center"
          subtitle="Practical guides to help you shop smarter and resolve issues faster."
          stats={[
            { value: resources.length, label: "Guides" },
            { value: "24/7", label: "Self-serve" },
          ]}
        />

        <AccountListCard>
          {resources.map((item, index) => (
            <AccountLinkRow
              key={item.id}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              badge="Guide"
              isLast={index === resources.length - 1}
            />
          ))}
        </AccountListCard>

        <AccountListCard>
          <Text style={supportStyles.title}>Still need help?</Text>
          <Text style={supportStyles.subtitle}>
            Our support team can walk you through account, payment, and order concerns.
          </Text>
          <AccountActionButton
            label="Contact support"
            variant="primary"
            onPress={openSupport}
            icon="chatbubble-ellipses-outline"
          />
        </AccountListCard>
      </ScrollView>
    </View>
  );
}

const supportStyles = StyleSheet.create({
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    color: AppColors.text,
  },
  subtitle: {
    marginTop: rV(6),
    marginBottom: rV(14),
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#6B7280",
  },
});
