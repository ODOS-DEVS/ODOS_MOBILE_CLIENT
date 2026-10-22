import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  AccountInsightCard,
  AccountLinkRow,
  AccountListCard,
  AccountTipBanner,
  useAccountStyles,
} from "@/components/profile/ProfileHubUi";
import Fonts from "@/constants/Fonts";
import { SUPPORT_EMAIL } from "@/constants/legal";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import React, { useMemo } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

/**
 * Support triage.
 *
 * Most "I need help" moments are really "I need that screen" — where is my
 * order, how do I return this, why did my card fail. So this routes first and
 * escalates second: the common problems link straight to the screen that
 * solves them, and the two channels that actually exist sit underneath.
 *
 * It deliberately lists no channel ODOS does not staff. The previous version
 * showed greyed-out Facebook and Twitter cards, which read as neglect rather
 * than as a roadmap.
 */

type HelpTopic = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  href: string;
  requiresAuth?: boolean;
};

const HELP_TOPICS: HelpTopic[] = [
  {
    icon: "cube-outline",
    title: "Where is my order?",
    subtitle: "Track every stage, or report a delivery that never arrived.",
    href: "/(root)/screens/profileScreens/orders",
    requiresAuth: true,
  },
  {
    icon: "return-down-back-outline",
    title: "I need to return something",
    subtitle: "Raise a return on a delivered item and follow the decision.",
    href: "/(root)/screens/profileScreens/Account/Returns",
    requiresAuth: true,
  },
  {
    icon: "card-outline",
    title: "A payment failed",
    subtitle: "Wallet, card and mobile money, and what to try next.",
    href: "/(root)/screens/resources/paying-on-odos",
  },
  {
    icon: "pricetag-outline",
    title: "My voucher won't apply",
    subtitle: "Check its expiry, minimum spend, and whether it's been used.",
    href: "/(root)/screens/profileScreens/Account/Vouchers",
    requiresAuth: true,
  },
  {
    icon: "person-outline",
    title: "Something about my account",
    subtitle: "Details, password, notifications and deletion.",
    href: "/(root)/screens/resources/account-security",
  },
];

export default function GetHelp() {
  const accountStyles = useAccountStyles();
  const { requireAuth } = useRequireAuth();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const openTopic = (topic: HelpTopic) => {
    if (
      topic.requiresAuth &&
      !requireAuth({
        title: "Sign in to continue",
        message: "Log in so we can show you your own orders and requests.",
      })
    ) {
      return;
    }
    router.push(topic.href as Href);
  };

  const openAssistant = () => {
    router.push("/(root)/screens/assistant" as Href);
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
    } as never);
  };

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Get Help" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={accountStyles.content}>
        <AccountInsightCard
          title="What do you need?"
          subtitle="Most answers are one tap away. If none of these fit, the assistant is instant and support replies within a business day."
          stats={[
            { value: "24/7", label: "Assistant" },
            { value: "Mon–Sat", label: "Live chat" },
            { value: "1 day", label: "Email reply" },
          ]}
        />

        <Text style={styles.groupLabel}>Common problems</Text>
        <AccountListCard>
          {HELP_TOPICS.map((topic, index) => (
            <AccountLinkRow
              key={topic.href}
              icon={topic.icon}
              title={topic.title}
              subtitle={topic.subtitle}
              isLast={index === HELP_TOPICS.length - 1}
              onPress={() => openTopic(topic)}
            />
          ))}
        </AccountListCard>

        <Text style={styles.groupLabel}>Talk to someone</Text>
        <AccountListCard>
          <AccountLinkRow
            icon="sparkles-outline"
            title="ODOS Assistant"
            subtitle="Instant answers, any hour. Start here."
            badge="24/7"
            onPress={openAssistant}
          />
          <AccountLinkRow
            icon="chatbubble-ellipses-outline"
            title="Message support"
            subtitle={
              user
                ? "Goes to the admin team and stays attached to your account."
                : "Sign in so your conversation stays with your account."
            }
            onPress={openSupportChat}
          />
          <AccountLinkRow
            icon="mail-outline"
            title="Email us"
            subtitle={SUPPORT_EMAIL}
            isLast
            onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          />
        </AccountListCard>

        <Text style={styles.groupLabel}>Read it yourself</Text>
        <AccountListCard>
          <AccountLinkRow
            icon="library-outline"
            title="Guide center"
            subtitle="Step-by-step walkthroughs for buying, paying and tracking."
            onPress={() =>
              router.push("/(root)/screens/profileScreens/helpAndSupport/Resources" as Href)
            }
          />
          <AccountLinkRow
            icon="help-circle-outline"
            title="FAQ"
            subtitle="Short answers to the questions we get most."
            isLast
            onPress={() =>
              router.push("/(root)/screens/profileScreens/helpAndSupport/FAQ" as Href)
            }
          />
        </AccountListCard>

        <AccountTipBanner
          title="Have your order number ready"
          message="If your question is about an order, include the number that starts with ORD- from its detail screen. It gets you answered in one reply instead of three."
          icon="receipt-outline"
        />

        <Pressable
          style={styles.hoursRow}
          onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
        >
          <Ionicons name="time-outline" size={rMS(15)} color={colors.textMuted} />
          <Text style={styles.hoursText}>
            Live chat is staffed Monday to Saturday, 8:00 AM – 8:00 PM GMT. Messages sent outside
            those hours are answered the next business day.
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    groupLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12),
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: rV(6),
      marginBottom: rV(-4),
    },
    hoursRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: rS(9),
      paddingHorizontal: rS(14),
      paddingVertical: rV(12),
      borderRadius: rMS(14),
      backgroundColor: colors.surfaceSubtle,
    },
    hoursText: {
      flex: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(11.5),
      lineHeight: rMS(17),
      color: colors.textMuted,
    },
  });
}
