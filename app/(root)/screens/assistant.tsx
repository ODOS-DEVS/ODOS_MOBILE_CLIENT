import { AssistantAvatar } from "@/components/assistant/AssistantAnimations";
import {
  AssistantContextChip,
  AssistantCopyFeedback,
  AssistantEscalationBanner,
  AssistantMessageItem,
  AssistantQuickPrompts,
  AssistantTypingIndicator,
  AssistantWelcomeHero,
} from "@/components/assistant/AssistantUi";
import {
  ChatComposer,
  ChatLoadingCenter,
  ChatScreenHeader,
  ChatScreenShell,
  ChatStatusBadge,
} from "@/components/chat/ChatUi";

import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAssistant } from "@/hooks/useAssistant";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { rMS, rS, rV } from "@/styles/responsive";
import type { AssistantMessage } from "@/types/assistant";
import { assistantContextFromParams } from "@/utils/assistantContext";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList as GestureFlatList } from "react-native-gesture-handler";

function getAssistantMessageLayout(
  messages: AssistantMessage[],
  index: number,
) {
  const current = messages[index];
  const prev = index > 0 ? messages[index - 1] : null;
  const next = index < messages.length - 1 ? messages[index + 1] : null;
  const sameRoleAsPrev = prev?.role === current.role;
  const sameRoleAsNext = next?.role === current.role;

  return {
    showAvatar: current.role === "assistant" && !sameRoleAsPrev,
    showTimestamp: !sameRoleAsNext,
    compactTop: sameRoleAsPrev,
    animate: !sameRoleAsPrev,
  };
}

export default function AssistantScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    screen?: string;
    storeId?: string;
    storeName?: string;
    marketTitle?: string;
    vendorUserId?: string;
    category?: string;
  }>();
  const screenContext =
    typeof params.screen === "string" ? params.screen : "assistant";
  const referenceContext = useMemo(
    () => assistantContextFromParams(params),
    [
      params.category,
      params.marketTitle,
      params.storeId,
      params.storeName,
      params.vendorUserId,
    ],
  );
  const {
    messages,
    status,
    nudge,
    context: sessionContext,
    isLoadingSession,
    isSending,
    error,
    sendMessage,
    submitFeedback,
    resetConversation,
  } = useAssistant(screenContext, referenceContext);
  const focusedContext = sessionContext ?? referenceContext;
  const { isListening, isSupported, startListening, stopListening } =
    useSpeechInput();
  const [input, setInput] = useState("");
  const [copyFeedbackVisible, setCopyFeedbackVisible] = useState(false);
  const copyFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<GestureFlatList<AssistantMessage>>(null);
  const isNearBottomRef = useRef(true);

  const showCopyFeedback = useCallback(() => {
    if (copyFeedbackTimerRef.current) {
      clearTimeout(copyFeedbackTimerRef.current);
    }
    setCopyFeedbackVisible(true);
    copyFeedbackTimerRef.current = setTimeout(() => {
      setCopyFeedbackVisible(false);
      copyFeedbackTimerRef.current = null;
    }, 1200);
  }, []);

  useEffect(
    () => () => {
      if (copyFeedbackTimerRef.current) {
        clearTimeout(copyFeedbackTimerRef.current);
      }
    },
    [],
  );

  const lastMessage = messages[messages.length - 1];
  const isStreamingReply =
    isSending &&
    lastMessage?.role === "assistant" &&
    lastMessage.id !== "welcome";
  const showTypingIndicator = isSending && !isStreamingReply;

  const showQuickPrompts =
    !isLoadingSession &&
    messages.length === 1 &&
    (messages[0]?.id === "welcome" || Boolean(nudge));
  const hasEscalation = messages.some((message) => message.escalatedToSupport);
  const connectionState = status?.enabled ? "connected" : "disconnected";

  const scrollToEnd = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const handleScroll = useCallback(
    (event: {
      nativeEvent: {
        layoutMeasurement: { height: number };
        contentOffset: { y: number };
        contentSize: { height: number };
      };
    }) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      isNearBottomRef.current = distanceFromBottom < 120;
    },
    [],
  );

  useEffect(() => {
    if (isSending || isNearBottomRef.current) {
      scrollToEnd();
    }
  }, [isSending, messages, scrollToEnd]);

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
          paddingTop: rV(4),
          paddingBottom: rV(8),
        },
        errorBanner: {
          marginHorizontal: rS(16),
          marginTop: rV(6),
          marginBottom: rV(4),
          paddingHorizontal: rS(14),
          paddingVertical: rV(10),
          borderRadius: rMS(14),
          backgroundColor: colors.dangerSoft,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.dangerText,
        },
        errorText: {
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          color: colors.dangerText,
          lineHeight: rMS(17),
        },
        footer: {
          paddingTop: rV(4),
          paddingBottom: rV(10),
          alignItems: "center",
        },
        footerLink: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          paddingVertical: rV(8),
          paddingHorizontal: rS(14),
        },
        footerLinkText: {
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          color: colors.textMuted,
        },
        resetBtn: {
          width: rMS(34),
          height: rMS(34),
          borderRadius: rMS(17),
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surfaceMuted,
        },
      }),
    [colors],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: AssistantMessage; index: number }) => {
      const layout = getAssistantMessageLayout(messages, index);
      return (
        <AssistantMessageItem
          message={item}
          onFeedback={submitFeedback}
          onCopied={showCopyFeedback}
          isStreaming={isStreamingReply && item.id === lastMessage?.id}
          showAvatar={layout.showAvatar}
          showTimestamp={layout.showTimestamp}
          compactTop={layout.compactTop}
          animate={layout.animate}
        />
      );
    },
    [isStreamingReply, lastMessage?.id, messages, showCopyFeedback, submitFeedback],
  );

  const listFooter = useMemo(
    () => (
      <View>
        <AssistantTypingIndicator visible={showTypingIndicator} />
        {showQuickPrompts ? (
          <AssistantQuickPrompts
            disabled={isSending}
            screen={screenContext}
            nudgePrompt={nudge?.prompt}
            context={focusedContext}
            onSelect={(prompt) => {
              void sendMessage(prompt);
            }}
          />
        ) : (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.footerLink}
              activeOpacity={0.78}
              onPress={openSupport}
            >
              <Ionicons
                name="headset-outline"
                size={rMS(14)}
                color={colors.primary}
              />
              <Text style={styles.footerLinkText}>Talk to human support</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [
      colors.primary,
      colors.textMuted,
      isSending,
      nudge?.prompt,
      openSupport,
      focusedContext,
      screenContext,
      sendMessage,
      showQuickPrompts,
      showTypingIndicator,
      styles.footer,
      styles.footerLink,
      styles.footerLinkText,
    ],
  );

  return (
    <ChatScreenShell variant="assistant">
      <StatusBar barStyle="dark-content" />
        <ChatScreenHeader
          title="ODOS Assistant"
          subtitle={
            focusedContext?.store_name
              ? `Focused on ${focusedContext.store_name}`
              : user
                ? "Shopping, orders & account help"
                : "Browse help · sign in for personal answers"
          }
          onBack={() => goBackOr(router, { fallback: "/(root)/(tabs)" })}
          connectionState={connectionState}
          avatar={<AssistantAvatar size={rMS(40)} />}
          badges={
            <>
              <ChatStatusBadge
                label={status?.enabled ? "AI ready" : "Guided help"}
                icon={status?.enabled ? "sparkles-outline" : "book-outline"}
                backgroundColor={
                  status?.enabled ? colors.accentSoft : colors.surfaceMuted
                }
                color={status?.enabled ? colors.primary : colors.textMuted}
              />
              <TouchableOpacity
                style={styles.resetBtn}
                activeOpacity={0.75}
                onPress={resetConversation}
                accessibilityLabel="New conversation"
              >
                <Ionicons
                  name="refresh-outline"
                  size={rMS(16)}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </>
          }
        />

        {isLoadingSession ? (
          <ChatLoadingCenter label="Loading your assistant conversation..." />
        ) : (
          <>
        {hasEscalation ? (
          <AssistantEscalationBanner onOpenSupport={openSupport} />
        ) : null}

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <AssistantContextChip context={focusedContext} />

        <GestureFlatList
          ref={listRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            showQuickPrompts ? (
              <AssistantWelcomeHero
                signedIn={Boolean(user)}
                aiEnabled={Boolean(status?.enabled)}
                context={focusedContext}
              />
            ) : null
          }
          ListFooterComponent={listFooter}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          onContentSizeChange={() => {
            if (isNearBottomRef.current || isSending) {
              scrollToEnd();
            }
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />

        <ChatComposer
          hint={
            focusedContext?.store_name
              ? `Ask about ${focusedContext.store_name}, products, or delivery`
              : "Ask about orders, delivery, vouchers, or stores"
          }
          placeholder={
            focusedContext?.store_name
              ? `Ask about ${focusedContext.store_name}…`
              : "Message ODOS Assistant…"
          }
          value={input}
          onChangeText={setInput}
          onSend={() => void handleSend()}
          disabled={isSending}
          isSending={isSending}
          voiceSupported={isSupported}
          isListening={isListening}
          onVoicePress={() => {
            if (isListening) {
              stopListening();
              return;
            }
            void startListening((transcript) => {
              setInput(transcript);
              stopListening();
            });
          }}
        />

        <AssistantCopyFeedback visible={copyFeedbackVisible} />
          </>
        )}
    </ChatScreenShell>
  );
}
