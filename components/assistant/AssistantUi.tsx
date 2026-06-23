import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import type { AssistantMessage } from "@/types/assistant";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const QUICK_PROMPTS = [
  "Where is my order?",
  "How do delivery options work?",
  "How do I use a voucher?",
  "How do I start a return?",
  "Help me find deals",
];

type AssistantQuickPromptsProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
};

export function AssistantQuickPrompts({
  onSelect,
  disabled = false,
}: AssistantQuickPromptsProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          gap: rV(8),
          paddingHorizontal: rS(16),
          paddingBottom: rV(8),
        },
        label: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.textMuted,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        },
        row: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: rS(8),
        },
        chip: {
          borderRadius: 999,
          paddingHorizontal: rS(12),
          paddingVertical: rV(8),
          backgroundColor: colors.accentSoft,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: disabled ? 0.55 : 1,
        },
        chipText: {
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          color: colors.text,
        },
      }),
    [colors, disabled],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Quick questions</Text>
      <View style={styles.row}>
        {QUICK_PROMPTS.map((prompt) => (
          <TouchableOpacity
            key={prompt}
            style={styles.chip}
            activeOpacity={0.82}
            disabled={disabled}
            onPress={() => onSelect(prompt)}
          >
            <Text style={styles.chipText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

type AssistantMessageListProps = {
  messages: AssistantMessage[];
};

export function AssistantMessageList({ messages }: AssistantMessageListProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        list: {
          gap: rV(12),
          paddingHorizontal: rS(16),
          paddingTop: rV(8),
          paddingBottom: rV(16),
        },
        row: {
          flexDirection: "row",
          alignItems: "flex-end",
          gap: rS(8),
        },
        rowMine: {
          justifyContent: "flex-end",
        },
        avatar: {
          width: rMS(28),
          height: rMS(28),
          borderRadius: rMS(14),
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.primary,
        },
        bubble: {
          maxWidth: "82%",
          borderRadius: rMS(18),
          paddingHorizontal: rS(14),
          paddingVertical: rV(10),
        },
        bubbleAssistant: {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        bubbleUser: {
          backgroundColor: colors.primary,
        },
        textAssistant: {
          fontFamily: Fonts.text,
          fontSize: rMS(14),
          lineHeight: rMS(20),
          color: colors.text,
        },
        textUser: {
          fontFamily: Fonts.text,
          fontSize: rMS(14),
          lineHeight: rMS(20),
          color: "#FFFFFF",
        },
        actions: {
          marginTop: rV(10),
          gap: rV(8),
        },
        actionBtn: {
          alignSelf: "flex-start",
          borderRadius: 999,
          paddingHorizontal: rS(12),
          paddingVertical: rV(7),
          backgroundColor: colors.accentSoft,
          borderWidth: 1,
          borderColor: colors.border,
        },
        actionText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.primary,
        },
        supportNote: {
          marginTop: rV(8),
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.textMuted,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.list}>
      {messages.map((message) => {
        const isUser = message.role === "user";
        return (
          <View
            key={message.id}
            style={[styles.row, isUser ? styles.rowMine : null]}
          >
            {!isUser ? (
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={rMS(14)} color="#FFFFFF" />
              </View>
            ) : null}
            <View
              style={[
                styles.bubble,
                isUser ? styles.bubbleUser : styles.bubbleAssistant,
              ]}
            >
              <Text style={isUser ? styles.textUser : styles.textAssistant}>
                {message.content}
              </Text>
              {!isUser && message.suggestedActions?.length ? (
                <View style={styles.actions}>
                  {message.suggestedActions.map((action) => (
                    <TouchableOpacity
                      key={`${message.id}-${action.route}`}
                      style={styles.actionBtn}
                      activeOpacity={0.82}
                      onPress={() => router.push(action.route as any)}
                    >
                      <Text style={styles.actionText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
              {!isUser && message.escalatedToSupport ? (
                <Text style={styles.supportNote}>
                  A human support agent can take over from here if you need more help.
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
