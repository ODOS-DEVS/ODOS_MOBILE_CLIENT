import {
  AssistantMessageItem,
  AssistantQuickPrompts,
  AssistantTypingIndicator,
} from "@/components/assistant/AssistantUi";
import {
  ChatComposer,
  ChatScreenHeader,
  ChatScreenShell,
  ChatStatusBadge,
} from "@/components/chat/ChatUi";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAssistant } from "@/hooks/useAssistant";
import { rMS, rS, rV } from "@/styles/responsive";
import type { AssistantMessage } from "@/types/assistant";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AssistantScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const {
    messages,
    status,
    isSending,
    error,
    sendMessage,
    resetConversation,
  } = useAssistant("assistant");
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList<AssistantMessage>>(null);

  const showQuickPrompts = messages.length === 1 && messages[0]?.id === "welcome";
  const connectionState = status?.enabled ? "connected" : "disconnected";

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const handleSend = async () => {
    const value = input.trim();
    if (!value) {
      return;
    }
    setInput("");
    await sendMessage(value);
    scrollToEnd();
  };

  const openSupport = useCallback(() => {
    router.push({
      pathname: "/screens/support/chat",
      params: {
        subject: "Help from ODOS Assistant",
        fallback: "/screens/assistant",
      },
    } as any);
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        list: {
          flex: 1,
        },
        listContent: {
          flexGrow: 1,
          paddingBottom: rV(8),
        },
        errorBanner: {
          marginHorizontal: 16,
          marginTop: rV(8),
          marginBottom: rV(4),
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: "#FEF2F2",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: "#FECACA",
        },
        errorText: {
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          color: "#B91C1C",
          lineHeight: rMS(17),
        },
        footer: {
          paddingTop: rV(4),
          paddingBottom: rV(12),
          alignItems: "center",
        },
        footerLink: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingVertical: rV(8),
          paddingHorizontal: rS(12),
        },
        footerLinkText: {
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          color: colors.textMuted,
        },
        headerAvatar: {
          width: rMS(44),
          height: rMS(44),
          borderRadius: rMS(16),
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        },
        resetBadge: {
          flexDirection: "row",
          alignItems: "center",
          gap: rMS(4),
          paddingHorizontal: rMS(10),
          paddingVertical: rV(5),
          borderRadius: 999,
          backgroundColor: colors.surfaceMuted,
        },
        resetBadgeText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10.5),
          color: colors.textMuted,
        },
      }),
    [colors],
  );

  const renderItem = useCallback(
    ({ item }: { item: AssistantMessage }) => <AssistantMessageItem message={item} />,
    [],
  );

  const listFooter = useMemo(
    () => (
      <View>
        <AssistantTypingIndicator visible={isSending} />
        {showQuickPrompts ? (
          <AssistantQuickPrompts
            disabled={isSending}
            onSelect={(prompt) => {
              void sendMessage(prompt);
            }}
          />
        ) : (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.footerLink}
              activeOpacity={0.7}
              onPress={openSupport}
            >
              <Ionicons name="headset-outline" size={rMS(14)} color={colors.textMuted} />
              <Text style={styles.footerLinkText}>Talk to human support</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [
      colors.textMuted,
      isSending,
      openSupport,
      sendMessage,
      showQuickPrompts,
      styles.footer,
      styles.footerLink,
      styles.footerLinkText,
    ],
  );

  return (
    <ChatScreenShell>
      <StatusBar barStyle="dark-content" />

      <ChatScreenHeader
        title="ODOS Assistant"
        subtitle={
          user
            ? "Orders, delivery, vouchers & account help"
            : "Shopping help · sign in for order details"
        }
        onBack={() => goBackOr(router, { fallback: "/(root)/(tabs)" })}
        connectionState={connectionState}
        avatar={
          <View style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={rMS(20)} color="#FFFFFF" />
          </View>
        }
        badges={
          <>
            <ChatStatusBadge
              label={status?.enabled ? "AI ready" : "Guided help"}
              icon={status?.enabled ? "sparkles-outline" : "book-outline"}
              backgroundColor={status?.enabled ? "#EEF2FF" : colors.surfaceMuted}
              color={status?.enabled ? AppColors.primary : colors.textMuted}
            />
            <TouchableOpacity
              style={styles.resetBadge}
              activeOpacity={0.75}
              onPress={resetConversation}
              accessibilityLabel="New conversation"
            >
              <Ionicons name="refresh-outline" size={rMS(12)} color={colors.textMuted} />
              <Text style={styles.resetBadgeText}>New</Text>
            </TouchableOpacity>
          </>
        }
      />

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListFooterComponent={listFooter}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToEnd}
      />

      <ChatComposer
        placeholder="Ask anything…"
        value={input}
        onChangeText={setInput}
        onSend={() => void handleSend()}
        disabled={isSending}
        isSending={isSending}
      />
    </ChatScreenShell>
  );
}
