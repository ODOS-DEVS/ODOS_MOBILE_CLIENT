import { AssistantAvatar } from "@/components/assistant/AssistantAnimations";
import {
  AssistantCopyFeedback,
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
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { rMS, rS, rV } from "@/styles/responsive";
import type { AssistantMessage } from "@/types/assistant";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  const { screen: screenParam } = useLocalSearchParams<{ screen?: string }>();
  const screenContext =
    typeof screenParam === "string" ? screenParam : "assistant";
  const {
    messages,
    status,
    nudge,
    isSending,
    error,
    sendMessage,
    submitFeedback,
    resetConversation,
  } = useAssistant(screenContext);
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
    messages.length === 1 && (messages[0]?.id === "welcome" || Boolean(nudge));
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
        gradient: {
          flex: 1,
        },
        list: {
          flex: 1,
        },
        listContent: {
          flexGrow: 1,
          paddingBottom: rV(12),
        },
        hero: {
          marginHorizontal: rS(16),
          marginTop: rV(8),
          marginBottom: rV(4),
          borderRadius: rMS(18),
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        heroInner: {
          paddingHorizontal: rS(16),
          paddingVertical: rV(14),
          gap: rV(5),
        },
        heroTitle: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(16),
          color: colors.text,
        },
        heroText: {
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(20),
          color: colors.textMuted,
        },
        heroBadges: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: rS(8),
          marginTop: rV(8),
        },
        heroBadge: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(4),
          paddingHorizontal: rS(10),
          paddingVertical: rV(5),
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.85)",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        heroBadgeText: {
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.textSecondary,
        },
        errorBanner: {
          marginHorizontal: rS(16),
          marginTop: rV(8),
          marginBottom: rV(4),
          paddingHorizontal: rS(14),
          paddingVertical: rV(11),
          borderRadius: rMS(14),
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
          paddingTop: rV(8),
          paddingBottom: rV(14),
          alignItems: "center",
        },
        footerLink: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          paddingVertical: rV(10),
          paddingHorizontal: rS(16),
          borderRadius: 999,
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        footerLinkText: {
          fontFamily: Fonts.text,
          fontSize: rMS(12.5),
          color: colors.textMuted,
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

  const listHeader = useMemo(() => {
    if (!showQuickPrompts) {
      return null;
    }
    return (
      <View style={styles.hero}>
        <LinearGradient
          colors={[colors.accentSoft, "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroInner}
        >
          <Text style={styles.heroTitle}>
            {status?.enabled
              ? "Your ODOS shopping companion"
              : "Guided shopping help"}
          </Text>
          <Text style={styles.heroText}>
            {user
              ? "Ask about orders, delivery, vouchers, products, or stores — I'll use your real account data when I can."
              : "Browse help freely, or sign in for personal order and voucher answers."}
          </Text>
          <View style={styles.heroBadges}>
            {["Orders", "Delivery", "Deals", "Stores"].map((label) => (
              <View key={label} style={styles.heroBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={rMS(12)}
                  color={colors.primary}
                />
                <Text style={styles.heroBadgeText}>{label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>
    );
  }, [colors, showQuickPrompts, status?.enabled, styles, user]);

  const listFooter = useMemo(
    () => (
      <View>
        <AssistantTypingIndicator visible={showTypingIndicator} />
        {showQuickPrompts ? (
          <AssistantQuickPrompts
            disabled={isSending}
            screen={screenContext}
            nudgePrompt={nudge?.prompt}
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
                size={rMS(15)}
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
    <ChatScreenShell>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={["#F8FAFC", colors.accentSoft, "#FFFFFF"]}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
      >
        <ChatScreenHeader
          title="ODOS Assistant"
          subtitle={
            user
              ? "Orders, delivery, vouchers & account help"
              : "Shopping help · sign in for order details"
          }
          onBack={() => goBackOr(router, { fallback: "/(root)/(tabs)" })}
          connectionState={connectionState}
          avatar={<AssistantAvatar size={rMS(44)} />}
          badges={
            <>
              <ChatStatusBadge
                label={status?.enabled ? "AI ready" : "Guided help"}
                icon={status?.enabled ? "sparkles-outline" : "book-outline"}
                backgroundColor={
                  status?.enabled ? "#EEF2FF" : colors.surfaceMuted
                }
                color={status?.enabled ? AppColors.primary : colors.textMuted}
              />
              <TouchableOpacity
                style={styles.resetBadge}
                activeOpacity={0.75}
                onPress={resetConversation}
                accessibilityLabel="New conversation"
              >
                <Ionicons
                  name="refresh-outline"
                  size={rMS(12)}
                  color={colors.textMuted}
                />
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

        <GestureFlatList
          ref={listRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
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
          hint="Ask about orders, delivery, vouchers, products, or stores"
          placeholder="Message ODOS Assistant…"
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
      </LinearGradient>
    </ChatScreenShell>
  );
}
