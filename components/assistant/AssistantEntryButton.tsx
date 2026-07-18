import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import type { AssistantReferenceContext } from "@/types/assistant";
import { assistantContextToParams } from "@/utils/assistantContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AssistantEntryButtonProps = {
  screen: string;
  label?: string;
  subtitle?: string;
  compact?: boolean;
  context?: AssistantReferenceContext | null;
};

export default function AssistantEntryButton({
  screen,
  label = "Ask ODOS Assistant",
  subtitle,
  compact = false,
  context = null,
}: AssistantEntryButtonProps) {
  const { colors } = useTheme();
  const resolvedSubtitle =
    subtitle ??
    (context?.store_name
      ? `Answers and picks from ${context.store_name}`
      : "Delivery, vouchers, and order help");

  return (
    <TouchableOpacity
      style={[
        styles.button,
        compact ? styles.buttonCompact : null,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderStrong,
        },
      ]}
      activeOpacity={0.88}
      onPress={() =>
        router.push({
          pathname: "/(root)/screens/assistant" as never,
          params: {
            screen,
            ...assistantContextToParams(context),
          },
        })
      }
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.pill }]}>
        <Ionicons name="sparkles" size={rMS(compact ? 14 : 16)} color={colors.text} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {!compact ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {resolvedSubtitle}
          </Text>
        ) : context?.store_name ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
            Focused on {context.store_name}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={rMS(16)} color={colors.iconMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
    borderRadius: rMS(14),
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttonCompact: {
    paddingVertical: rV(10),
  },
  iconWrap: {
    width: rS(36),
    height: rS(36),
    borderRadius: rS(12),
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: rV(2),
  },
  label: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  subtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
});
