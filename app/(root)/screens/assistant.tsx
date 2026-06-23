import {
  AssistantMessageList,
  AssistantQuickPrompts,
} from "@/components/assistant/AssistantUi";
import { ChatComposer, ChatScreenShell } from "@/components/chat/ChatUi";
import { useChatStyles } from "@/styles/themedChatStyles";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAssistant } from "@/hooks/useAssistant";
import { rMS, rV } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AssistantScreen() {
  const chatStyles = useChatStyles();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const {
    messages,
    status,
    isLoadingStatus,
    isSending,
    error,
    sendMessage,
    resetConversation,
  } = useAssistant("assistant");
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    const value = input.trim();
    if (!value) {
      return;
    }
    setInput("");
    await sendMessage(value);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  const styles = StyleSheet.create({
    banner: {
      marginHorizontal: 16,
      marginBottom: rV(8),
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.accentSoft,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    bannerText: {
      flex: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      lineHeight: rMS(17),
      color: colors.textMuted,
    },
    errorBanner: {
      marginHorizontal: 16,
      marginBottom: rV(8),
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: "#FEF2F2",
      borderWidth: 1,
      borderColor: "#FECACA",
    },
    errorText: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: "#B91C1C",
    },
    supportLink: {
      marginTop: rV(8),
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    supportLinkText: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12),
      color: colors.primary,
    },
    typingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingBottom: rV(8),
    },
    typingText: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
    },
  });

  return (
    <ChatScreenShell>
      <StatusBar barStyle="dark-content" />
      <View style={[chatStyles.header, { paddingTop: insets.top + rV(8) }]}>
        <View style={chatStyles.headerRow}>
          <TouchableOpacity
            style={chatStyles.backButton}
            onPress={() => goBackOr("/(root)/(tabs)")}
            activeOpacity={0.82}
          >
            <Ionicons name="arrow-back" size={rMS(20)} color={colors.text} />
          </TouchableOpacity>
          <View style={chatStyles.headerCopy}>
            <Text style={chatStyles.headerTitle} numberOfLines={1}>
              ODOS Assistant
            </Text>
            <Text style={chatStyles.headerSubtitle} numberOfLines={2}>
              {user
                ? status?.enabled
                  ? "Personalized help for your account"
                  : "Guided help · sign in for order details"
                : "Ask anything about the app"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={resetConversation}
            activeOpacity={0.8}
            accessibilityLabel="Start new conversation"
          >
            <Ionicons name="refresh-outline" size={rMS(20)} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.banner}>
        <Ionicons name="sparkles-outline" size={rMS(16)} color={colors.primary} />
        <Text style={styles.bannerText}>
          {isLoadingStatus
            ? "Checking assistant availability..."
            : status?.enabled
              ? `Powered by AI${status.model ? ` · ${status.model}` : ""}. I can guide you through orders, checkout, delivery, vouchers, and more.`
              : "Smart guidance is active. Connect an AI key on the backend for richer answers — I still help with common app questions."}
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <AssistantMessageList messages={messages} />
        {isSending ? (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color={AppColors.primary} />
            <Text style={styles.typingText}>ODOS Assistant is thinking...</Text>
          </View>
        ) : null}
        <AssistantQuickPrompts
          disabled={isSending}
          onSelect={(prompt) => {
            void sendMessage(prompt);
          }}
        />
        <TouchableOpacity
          style={[styles.supportLink, { marginHorizontal: 16, marginBottom: rV(12) }]}
          activeOpacity={0.82}
          onPress={() =>
            router.push({
              pathname: "/screens/support/chat",
              params: {
                subject: "Help from ODOS Assistant",
                fallback: "/screens/assistant",
              },
            } as any)
          }
        >
          <Ionicons name="headset-outline" size={rMS(14)} color={colors.primary} />
          <Text style={styles.supportLinkText}>Talk to a human instead</Text>
        </TouchableOpacity>
      </ScrollView>

      <ChatComposer
        hint="Ask about orders, delivery, vouchers, returns, stores, or any app feature"
        placeholder="Message ODOS Assistant"
        value={input}
        onChangeText={setInput}
        onSend={() => void handleSend()}
        disabled={isSending}
        isSending={isSending}
      />
    </ChatScreenShell>
  );
}
