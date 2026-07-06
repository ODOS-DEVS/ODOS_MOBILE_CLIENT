import {
  AccountBadge,
  AccountEmptyState,
  AccountInsightCard,
  AccountListCard,
} from "@/components/account/AccountUi";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import type { ChatMessage, ChatThread, SupportChatStatus } from "@/types/chat";
import { rMS, rS, rV } from "@/styles/responsive";
import { resolveImageSource } from "@/utils/media";
import { AnimatedChatMessageWrap, TypingDots } from "@/components/chat/ChatAnimations";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChatStyles } from "@/styles/themedChatStyles";

export {
  AccountBadge,
  AccountEmptyState,
  AccountInsightCard,
  AccountListCard,
} from "@/components/account/AccountUi";

export { useAccountStyles } from "@/styles/themedAccountStyles";


export function formatChatTime(value?: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function isSameChatDay(left: number, right: number) {
  const a = new Date(left);
  const b = new Date(right);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatChatDayLabel(time: number) {
  const date = new Date(time);
  const now = new Date();
  if (isSameChatDay(date.getTime(), now.getTime())) {
    return "Today";
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameChatDay(date.getTime(), yesterday.getTime())) {
    return "Yesterday";
  }
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function useStableConnectionState(
  connectionState: "disconnected" | "connecting" | "connected",
) {
  const [displayState, setDisplayState] = useState(connectionState);
  const wasConnectedRef = useRef(connectionState === "connected");

  useEffect(() => {
    if (connectionState === "connected") {
      wasConnectedRef.current = true;
      setDisplayState("connected");
      return;
    }

    const delay = wasConnectedRef.current ? 1800 : 500;
    const timeoutId = setTimeout(() => {
      setDisplayState(connectionState);
      if (connectionState === "disconnected") {
        wasConnectedRef.current = false;
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [connectionState]);

  return displayState;
}

export function getConnectionMeta(
  connectionState: "disconnected" | "connecting" | "connected",
) {
  if (connectionState === "connected") {
    return {
      label: "Live",
      icon: "wifi-outline" as const,
      backgroundColor: "#DCFCE7",
      color: "#166534",
    };
  }
  if (connectionState === "connecting") {
    return {
      label: "Reconnecting",
      icon: "sync-outline" as const,
      backgroundColor: "#FEF3C7",
      color: "#92400E",
    };
  }
  return {
    label: "Offline",
    icon: "cloud-offline-outline" as const,
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
  };
}

export function getSupportStatusMeta(
  status: SupportChatStatus | null | undefined,
  viewerRole: "vendor" | "customer",
) {
  if (status === "resolved") {
    return {
      label: "Resolved",
      icon: "checkmark-circle-outline" as const,
      backgroundColor: "#DCFCE7",
      color: "#166534",
      helper: "Reply to this thread any time if you need it reopened.",
    };
  }
  if (status === "waiting_on_customer") {
    return {
      label: viewerRole === "vendor" ? "Waiting on you" : "Waiting on you",
      icon: "person-outline" as const,
      backgroundColor: "#DBEAFE",
      color: "#1D4ED8",
      helper: "The ODOS team has responded. Send the next detail to continue.",
    };
  }
  return {
    label: "Waiting on admin",
    icon: "time-outline" as const,
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    helper: "Your thread is in the admin queue. We'll reply here when ready.",
  };
}

type ChatStatusBadgeProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  color: string;
};

export function ChatStatusBadge({
  label,
  icon,
  backgroundColor,
  color,
}: ChatStatusBadgeProps) {
  const chatStyles = useChatStyles();
  return (
    <View style={[chatStyles.statusBadge, { backgroundColor }]}>
      <Ionicons name={icon} size={rMS(12)} color={color} />
      <Text style={[chatStyles.statusBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

type ChatThreadRowProps = {
  thread: ChatThread;
  onPress: () => void;
  avatarMode?: "store" | "counterpart";
};

export function ChatThreadRow({
  thread,
  onPress,
  avatarMode = "store",
}: ChatThreadRowProps) {
  const chatStyles = useChatStyles();
  const avatarSource: ImageSourcePropType =
    avatarMode === "counterpart" && thread.counterpart.avatarUrl
      ? { uri: thread.counterpart.avatarUrl }
      : resolveImageSource(thread.store.imageUrl, thread.store.imageKey);

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress}>
      <AccountListCard>
        <View style={chatStyles.threadRow}>
          <Image source={avatarSource} style={chatStyles.avatar} resizeMode="cover" />

          <View style={chatStyles.threadCopy}>
            <View style={chatStyles.threadTop}>
              <Text style={chatStyles.threadName} numberOfLines={1}>
                {thread.counterpart.name}
              </Text>
              <Text style={chatStyles.threadTime}>
                {formatChatTime(thread.lastMessageAt ?? thread.updatedAt)}
              </Text>
            </View>
            <Text style={chatStyles.threadStore} numberOfLines={1}>
              {thread.store.title}
            </Text>
            <Text style={chatStyles.threadPreview} numberOfLines={1}>
              {thread.lastMessageText || "Open the conversation"}
            </Text>
          </View>

          {thread.unreadCount > 0 ? (
            <AccountBadge label={String(thread.unreadCount)} tone="dark" />
          ) : (
            <Ionicons name="chevron-forward" size={rMS(18)} color="#D1D5DB" />
          )}
        </View>
      </AccountListCard>
    </TouchableOpacity>
  );
}

type ChatScreenHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
  connectionState: "disconnected" | "connecting" | "connected";
  avatar?: React.ReactNode;
  badges?: React.ReactNode;
};

export function ChatScreenHeader({
  title,
  subtitle,
  onBack,
  connectionState,
  avatar,
  badges,
}: ChatScreenHeaderProps) {
  const chatStyles = useChatStyles();
  const insets = useSafeAreaInsets();
  const stableConnectionState = useStableConnectionState(connectionState);
  const connectionMeta = getConnectionMeta(stableConnectionState);

  return (
    <View style={[chatStyles.header, { paddingTop: insets.top + rV(8) }]}>
      <View style={chatStyles.headerRow}>
        <TouchableOpacity style={chatStyles.backButton} onPress={onBack} activeOpacity={0.82}>
          <Ionicons name="arrow-back" size={rMS(20)} color={AppColors.text} />
        </TouchableOpacity>
        {avatar}
        <View style={chatStyles.headerCopy}>
          <Text style={chatStyles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={chatStyles.headerSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
          <View style={chatStyles.badgeRow}>
            <ChatStatusBadge
              label={connectionMeta.label}
              icon={connectionMeta.icon}
              backgroundColor={connectionMeta.backgroundColor}
              color={connectionMeta.color}
            />
            {badges}
          </View>
        </View>
      </View>
    </View>
  );
}

type ChatContextCardProps = {
  label: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  imageKey?: string | null;
};

export function ChatContextCard({
  label,
  title,
  subtitle,
  imageUrl,
  imageKey,
}: ChatContextCardProps) {
  const chatStyles = useChatStyles();
  const imageSource = resolveImageSource(imageUrl, imageKey);

  return (
    <View style={chatStyles.contextWrap}>
      <View style={chatStyles.contextCard}>
        <Image source={imageSource} style={chatStyles.contextImage} resizeMode="cover" />
        <View style={chatStyles.contextCopy}>
          <Text style={chatStyles.contextLabel}>{label}</Text>
          <Text style={chatStyles.contextTitle} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={chatStyles.contextSub} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function ChatDayDivider({ label }: { label: string }) {
  const chatStyles = useChatStyles();
  return (
    <View style={chatStyles.dayWrap}>
      <View style={chatStyles.dayPill}>
        <Text style={chatStyles.dayText}>{label}</Text>
      </View>
    </View>
  );
}

type ChatMessageBubbleProps = {
  message: ChatMessage;
  isMine: boolean;
  showMeta: boolean;
};

export function ChatMessageBubble({ message, isMine, showMeta }: ChatMessageBubbleProps) {
  const chatStyles = useChatStyles();

  return (
    <AnimatedChatMessageWrap isMine={isMine}>
      <View
        style={[
          chatStyles.messageRow,
          isMine ? chatStyles.messageRowMine : chatStyles.messageRowTheirs,
        ]}
      >
        <View
          style={[
            chatStyles.bubble,
            isMine ? chatStyles.bubbleMine : chatStyles.bubbleTheirs,
          ]}
        >
          <Text
            style={[chatStyles.bubbleText, { color: isMine ? "#FFFFFF" : AppColors.text }]}
          >
            {message.text}
          </Text>
          {showMeta ? (
            <Text
              style={[
                chatStyles.bubbleMeta,
                { color: isMine ? "rgba(255,255,255,0.88)" : "#9CA3AF" },
              ]}
            >
              {formatChatTime(message.time)}
              {isMine && message.isRead ? " · Seen" : ""}
            </Text>
          ) : null}
        </View>
      </View>
    </AnimatedChatMessageWrap>
  );
}

type ChatComposerProps = {
  hint?: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isSending?: boolean;
  onVoicePress?: () => void;
  isListening?: boolean;
  voiceSupported?: boolean;
};

export function ChatComposer({
  hint,
  placeholder,
  value,
  onChangeText,
  onSend,
  disabled = false,
  isSending = false,
  onVoicePress,
  isListening = false,
  voiceSupported = false,
}: ChatComposerProps) {
  const chatStyles = useChatStyles();
  const insets = useSafeAreaInsets();
  const canSend = Boolean(value.trim()) && !disabled && !isSending;
  const sendScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(sendScale, {
      toValue: canSend ? 1 : 0.94,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [canSend, sendScale]);

  return (
    <View style={[chatStyles.composerWrap, { paddingBottom: Math.max(insets.bottom, rV(12)) }]}>
      {hint ? <Text style={chatStyles.composerHint}>{hint}</Text> : null}
      <View style={chatStyles.composerRow}>
        {voiceSupported && onVoicePress ? (
          <Pressable
            onPress={onVoicePress}
            disabled={disabled || isSending}
            style={[
              chatStyles.sendButton,
              isListening ? chatStyles.sendButtonActive : chatStyles.sendButtonDisabled,
              { marginRight: rS(8), backgroundColor: isListening ? "#EF4444" : "#64748B" },
            ]}
            accessibilityLabel={isListening ? "Stop voice input" : "Start voice input"}
          >
            <Ionicons name={isListening ? "stop" : "mic"} size={rMS(16)} color="#FFFFFF" />
          </Pressable>
        ) : null}
        <View style={chatStyles.composerInputWrap}>
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            value={value}
            onChangeText={onChangeText}
            style={chatStyles.composerInput}
            multiline
            editable={!disabled && !isSending}
          />
        </View>
        <Animated.View style={{ transform: [{ scale: sendScale }] }}>
          <Pressable
            onPress={onSend}
            disabled={!canSend}
            style={[
              chatStyles.sendButton,
              canSend ? chatStyles.sendButtonActive : chatStyles.sendButtonDisabled,
            ]}
          >
            {isSending ? (
              <TypingDots color="#FFFFFF" dotSize={rS(5)} />
            ) : (
              <Ionicons name="send" size={rMS(16)} color="#FFFFFF" />
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

type ChatScreenShellProps = {
  children: React.ReactNode;
};

export function ChatScreenShell({ children }: ChatScreenShellProps) {
  const chatStyles = useChatStyles();
  return (
    <KeyboardAvoidingView
      style={chatStyles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

export function ChatLoadingCenter({ label }: { label: string }) {
  const chatStyles = useChatStyles();
  return (
    <View style={chatStyles.loadingWrap}>
      <ActivityIndicator size="large" color={AppColors.primary} />
      <Text style={chatStyles.loadingText}>{label}</Text>
    </View>
  );
}

export function ChatMessagesEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const chatStyles = useChatStyles();
  return (
    <View style={chatStyles.emptyMessages}>
      <Ionicons name="chatbubbles-outline" size={rMS(32)} color="#9CA3AF" />
      <Text style={chatStyles.emptyMessagesTitle}>{title}</Text>
      <Text style={chatStyles.emptyMessagesText}>{description}</Text>
    </View>
  );
}

export function renderChatMessageItem({
  item,
  index,
  messages,
  currentUserId,
}: {
  item: ChatMessage;
  index: number;
  messages: ChatMessage[];
  currentUserId?: string;
}) {
  const isMine = item.senderUserId === currentUserId;
  const itemTime = new Date(item.time).getTime();
  const prev = messages[index - 1];
  const next = messages[index + 1];
  const prevTime = prev ? new Date(prev.time).getTime() : 0;
  const nextTime = next ? new Date(next.time).getTime() : 0;
  const showDay = !prev || !isSameChatDay(prevTime, itemTime);
  const nextSameSender = next?.senderUserId === item.senderUserId;
  const nextCloseInTime = next ? Math.abs(nextTime - itemTime) < 6 * 60 * 1000 : false;
  const showMeta = !nextSameSender || !nextCloseInTime;

  return (
    <React.Fragment key={item.id}>
      {showDay ? <ChatDayDivider label={formatChatDayLabel(itemTime)} /> : null}
      <ChatMessageBubble message={item} isMine={isMine} showMeta={showMeta} />
    </React.Fragment>
  );
}

export { useChatStyles } from "@/styles/themedChatStyles";
export {
  AnimatedChatMessageWrap,
  AnimatedChatThreadWrap,
  ChatTypingIndicator,
  TypingDots,
} from "@/components/chat/ChatAnimations";
