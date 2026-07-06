import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useChatStyles } from "@/styles/themedChatStyles";
import { ChatTypingIndicator } from "@/components/chat/ChatAnimations";
import { rMS, rS, rV } from "@/styles/responsive";
import type { AssistantMessage } from "@/types/assistant";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const QUICK_PROMPTS = [
  { label: "Track my order", prompt: "Where is my order?" },
  { label: "Delivery options", prompt: "How do delivery options work?" },
  { label: "Use a voucher", prompt: "How do I use a voucher?" },
  { label: "Start a return", prompt: "How do I start a return?" },
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
          marginHorizontal: rS(16),
          marginTop: rV(4),
          marginBottom: rV(12),
          borderRadius: rMS(16),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: "hidden",
          opacity: disabled ? 0.55 : 1,
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: rS(14),
          paddingVertical: rV(13),
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        rowLast: {
          borderBottomWidth: 0,
        },
        rowText: {
          fontFamily: Fonts.text,
          fontSize: rMS(14),
          color: colors.text,
        },
      }),
    [colors, disabled],
  );

  return (
    <View style={styles.wrap}>
      {QUICK_PROMPTS.map((item, index) => (
        <TouchableOpacity
          key={item.label}
          style={[styles.row, index === QUICK_PROMPTS.length - 1 ? styles.rowLast : null]}
          activeOpacity={0.72}
          disabled={disabled}
          onPress={() => onSelect(item.prompt)}
        >
          <Text style={styles.rowText}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={rMS(16)} color={colors.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

type AssistantTypingIndicatorProps = {
  visible: boolean;
};

export function AssistantTypingIndicator({ visible }: AssistantTypingIndicatorProps) {
  return <ChatTypingIndicator visible={visible} variant="incoming" label="ODOS is typing" />;
}

type AssistantMessageItemProps = {
  message: AssistantMessage;
};

export function AssistantMessageItem({ message }: AssistantMessageItemProps) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  const isUser = message.role === "user";

  const actionStyles = useMemo(
    () =>
      StyleSheet.create({
        actions: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: rS(8),
          marginTop: rV(6),
          paddingHorizontal: rS(16),
          maxWidth: "88%",
        },
        actionChip: {
          borderRadius: 999,
          paddingHorizontal: rS(12),
          paddingVertical: rV(6),
          backgroundColor: colors.accentSoft,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        actionText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.primary,
        },
      }),
    [colors],
  );

  return (
    <>
      <View
        style={[
          chatStyles.messageRow,
          isUser ? chatStyles.messageRowMine : chatStyles.messageRowTheirs,
        ]}
      >
        <View
          style={[
            chatStyles.bubble,
            isUser ? chatStyles.bubbleMine : chatStyles.bubbleTheirs,
          ]}
        >
          <Text
            style={[
              chatStyles.bubbleText,
              { color: isUser ? "#FFFFFF" : colors.text },
            ]}
          >
            {message.content}
          </Text>
        </View>
      </View>
      {!isUser && message.suggestedActions?.length ? (
        <View
          style={[
            actionStyles.actions,
            { alignSelf: "flex-start" },
          ]}
        >
          {message.suggestedActions.map((action) => (
            <TouchableOpacity
              key={`${message.id}-${action.route}`}
              style={actionStyles.actionChip}
              activeOpacity={0.75}
              onPress={() => router.push(action.route as any)}
            >
              <Text style={actionStyles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </>
  );
}

type AssistantMessageListProps = {
  messages: AssistantMessage[];
};

export function AssistantMessageList({ messages }: AssistantMessageListProps) {
  return (
    <View style={{ paddingTop: rV(8), paddingBottom: rV(4) }}>
      {messages.map((message) => (
        <AssistantMessageItem key={message.id} message={message} />
      ))}
    </View>
  );
}
