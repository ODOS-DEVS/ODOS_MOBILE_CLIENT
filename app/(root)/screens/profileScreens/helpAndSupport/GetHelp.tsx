import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  AccountChannelCard,
  AccountInsightCard,
  AccountListCard,
  AccountTipBanner,
  useAccountStyles,
} from "@/components/profile/ProfileHubUi";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rMS, rS, rV } from "@/styles/responsive";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const channels = [
  {
    id: "assistant",
    icon: <Ionicons name="sparkles" size={22} color={AppColors.text} />,
    label: "AI Assistant",
    active: true,
  },
  {
    id: "chat",
    icon: <Ionicons name="chatbubble-ellipses" size={22} color={AppColors.text} />,
    label: "Live chat",
    active: true,
  },
  {
    id: "facebook",
    icon: <FontAwesome name="facebook" size={22} color="#1877F2" />,
    label: "Facebook",
    active: false,
  },
  {
    id: "twitter",
    icon: <FontAwesome name="twitter" size={22} color="#1DA1F2" />,
    label: "Twitter",
    active: false,
  },
];

export default function GetHelp() {
  const accountStyles = useAccountStyles();
  const { requireAuth } = useRequireAuth();

  const openAssistant = () => {
    router.push("/screens/assistant" as any);
  };

  const openSupportChat = () => {
    if (
      !requireAuth({
        title: "Sign in to chat with support",
        message:
          "Create an account or log in so the admin team can keep your support history in one place.",
      })
    ) {
      return;
    }

    router.push({
      pathname: "/screens/support/chat",
      params: {
        subject: "General account or order help",
        fallback: "/(root)/screens/profileScreens/helpAndSupport/GetHelp",
      },
    });
  };

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Get Help" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={accountStyles.content}
      >
        <AccountInsightCard
          title="We're here for you"
          subtitle="Start with the ODOS Assistant for instant answers, or message support for hands-on help."
          stats={[
            { value: "24/7", label: "AI guide" },
            { value: "Mon–Sat", label: "Live chat" },
          ]}
        />

        <View style={styles.heroRow}>
          <View style={styles.heroIcon}>
            <Ionicons name="headset-outline" size={rMS(28)} color="#FFFFFF" />
          </View>
          <Text style={styles.heroText}>
            Fastest help: ask the ODOS Assistant first. For account issues, sign in and chat with the admin team.
          </Text>
        </View>

        <Text style={styles.gridLabel}>Contact channels</Text>
        <View style={styles.channelGrid}>
          {channels.map((item) => (
            <AccountChannelCard
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={item.active}
              onPress={
                item.id === "assistant"
                  ? openAssistant
                  : item.id === "chat"
                    ? openSupportChat
                    : undefined
              }
            />
          ))}
        </View>

        <AccountListCard>
          <AccountTipBanner
            title="Support hours"
            message="Monday – Saturday, 8:00 AM – 8:00 PM (GMT). Messages outside hours are answered next business day."
            icon="time-outline"
          />
        </AccountListCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    backgroundColor: AppColors.text,
    borderRadius: rMS(20),
    paddingHorizontal: rS(16),
    paddingVertical: rV(14),
  },
  heroIcon: {
    width: rMS(48),
    height: rMS(48),
    borderRadius: rMS(24),
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#E5E7EB",
  },
  gridLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: rV(4),
  },
  channelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: rS(10),
  },
});
