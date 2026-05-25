import {
  AccountBadge,
  AccountEmptyState,
  AccountInsightCard,
  AccountListCard,
  accountStyles,
} from "@/components/account/AccountUi";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import type { ChatMessage, ChatThread, SupportChatStatus } from "@/types/chat";
import { rMS, rS, rV } from "@/styles/responsive";
import { resolveImageSource } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

export {
  AccountBadge,
  AccountEmptyState,
  AccountInsightCard,
  AccountListCard,
  accountStyles,
};

export const chatStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: rV(12),
  },
  loadingText: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    color: "#6B7280",
  },
  threadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  avatar: {
    width: rS(48),
    height: rS(48),
    borderRadius: rMS(16),
    backgroundColor: "#F3F4F6",
  },
  avatarPlaceholder: {
    width: rS(48),
    height: rS(48),
    borderRadius: rMS(16),
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  threadCopy: {
    flex: 1,
    gap: rV(2),
  },
  threadTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(8),
  },
  threadName: {
    flex: 1,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14.5),
    color: AppColors.text,
  },
  threadTime: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#9CA3AF",
  },
  threadStore: {
    fontFamily: Fonts.title,
    fontSize: rMS(11.5),
    color: AppColors.primary,
  },
  threadPreview: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    color: "#6B7280",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: rS(16),
    paddingBottom: rV(12),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  backButton: {
    width: rS(40),
    height: rS(40),
    borderRadius: rMS(20),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatar: {
    width: rS(44),
    height: rS(44),
    borderRadius: rMS(16),
    backgroundColor: "#F3F4F6",
  },
  headerAvatarSupport: {
    width: rS(44),
    height: rS(44),
    borderRadius: rMS(16),
    backgroundColor: AppColors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    gap: rV(4),
  },
  headerTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
    color: AppColors.text,
  },
  headerSubtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    marginTop: rV(4),
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
    borderRadius: 999,
  },
  statusBadgeText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
  },
  contextWrap: {
    paddingHorizontal: rS(16),
    paddingTop: rV(12),
  },
  contextCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: rMS(20),
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  contextImage: {
    width: rS(48),
    height: rS(48),
    borderRadius: rMS(14),
    backgroundColor: "#F3F4F6",
  },
  contextCopy: {
    flex: 1,
    gap: rV(2),
  },
  contextLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  contextTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
    color: AppColors.text,
  },
  contextSub: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
  },
  messagesContent: {
    paddingTop: rV(8),
    paddingBottom: rV(16),
    flexGrow: 1,
  },
  dayWrap: {
    alignItems: "center",
    paddingVertical: rV(10),
  },
  dayPill: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: rS(12),
    paddingVertical: rV(4),
    borderRadius: 999,
  },
  dayText: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#4B5563",
  },
  messageRow: {
    paddingHorizontal: rS(16),
    paddingVertical: rV(3),
  },
  messageRowMine: {
    alignItems: "flex-end",
  },
  messageRowTheirs: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: rS(12),
    paddingVertical: rV(9),
    borderTopLeftRadius: rMS(16),
    borderTopRightRadius: rMS(16),
  },
  bubbleMine: {
    backgroundColor: AppColors.primary,
    borderBottomLeftRadius: rMS(16),
    borderBottomRightRadius: rMS(6),
  },
  bubbleTheirs: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: rMS(6),
    borderBottomRightRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  bubbleText: {
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    lineHeight: rMS(20),
  },
  bubbleMeta: {
    marginTop: rV(6),
    fontFamily: Fonts.text,
    fontSize: rMS(10),
    textAlign: "right",
  },
  composerWrap: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: rS(16),
    paddingTop: rV(12),
  },
  composerHint: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#6B7280",
    marginBottom: rV(8),
    paddingHorizontal: rS(4),
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: rS(10),
  },
  composerInputWrap: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: rMS(22),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    paddingHorizontal: rS(14),
    paddingVertical: rV(10),
  },
  composerInput: {
    maxHeight: rV(110),
    padding: 0,
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    lineHeight: rMS(20),
    color: AppColors.text,
  },
  sendButton: {
    width: rS(44),
    height: rS(44),
    borderRadius: rMS(22),
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: AppColors.text,
  },
  sendButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  errorBanner: {
    marginHorizontal: rS(16),
    marginTop: rV(12),
    backgroundColor: "#FEF2F2",
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FECACA",
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
  },
  errorText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    color: "#B91C1C",
    lineHeight: rMS(18),
  },
  emptyMessages: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(28),
    paddingVertical: rV(40),
    gap: rV(8),
  },
  emptyMessagesTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
    textAlign: "center",
  },
  emptyMessagesText: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    color: "#6B7280",
    textAlign: "center",
    lineHeight: rMS(20),
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    marginTop: rV(10),
  },
  chip: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
  },
  chipText: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#4B5563",
  },
});

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
  const itemTime = new Date(message.time).getTime();

  return (
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
  );
}

type ChatComposerProps = {
  hint: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isSending?: boolean;
};

export function ChatComposer({
  hint,
  placeholder,
  value,
  onChangeText,
  onSend,
  disabled = false,
  isSending = false,
}: ChatComposerProps) {
  const insets = useSafeAreaInsets();
  const canSend = Boolean(value.trim()) && !disabled && !isSending;

  return (
    <View style={[chatStyles.composerWrap, { paddingBottom: Math.max(insets.bottom, rV(12)) }]}>
      <Text style={chatStyles.composerHint}>{hint}</Text>
      <View style={chatStyles.composerRow}>
        <View style={chatStyles.composerInputWrap}>
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            value={value}
            onChangeText={onChangeText}
            style={chatStyles.composerInput}
            multiline
            editable={!disabled}
          />
        </View>
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={[
            chatStyles.sendButton,
            canSend ? chatStyles.sendButtonActive : chatStyles.sendButtonDisabled,
          ]}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={rMS(16)} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

type ChatScreenShellProps = {
  children: React.ReactNode;
};

export function ChatScreenShell({ children }: ChatScreenShellProps) {
  return (
    <KeyboardAvoidingView
      style={chatStyles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

export function ChatLoadingCenter({ label }: { label: string }) {
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
