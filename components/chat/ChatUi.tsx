import { AccountBadge, AccountListCard, AccountActionButton } from "@/components/account/AccountUi";
import {
  AnimatedChatMessageWrap,
  TypingDots,
} from "@/components/chat/ChatAnimations";
import CommerceImage from "@/components/media/CommerceImage";
import { lightTheme, type ThemeColors } from "@/constants/theme";
import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useVoiceNoteRecorder } from "@/hooks/useVoiceNoteRecorder";
import { rMS, rS, rV } from "@/styles/responsive";
import { useChatStyles } from "@/styles/themedChatStyles";
import type { ChatMessage, ChatThread, SupportChatStatus } from "@/types/chat";
import { resolveImageSource } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Clipboard from "expo-clipboard";
import { File, Paths } from "expo-file-system";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
  type TextStyle,
} from "react-native";
import { Gesture, GestureDetector, Pressable as GesturePressable } from "react-native-gesture-handler";
import Reanimated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  colors?: ThemeColors,
) {
  if (connectionState === "connected") {
    return {
      label: "Live",
      icon: "wifi-outline" as const,
      backgroundColor: colors?.successSoft ?? lightTheme.successSoft,
      color: colors?.successText ?? lightTheme.successText,
    };
  }
  if (connectionState === "connecting") {
    return {
      label: "Reconnecting",
      icon: "sync-outline" as const,
      backgroundColor: colors?.warningSoft ?? lightTheme.warningSoft,
      color: colors?.warningText ?? lightTheme.warningText,
    };
  }
  return {
    label: "Offline",
    icon: "cloud-offline-outline" as const,
    backgroundColor: colors?.dangerSoft ?? lightTheme.dangerSoft,
    color: colors?.dangerText ?? lightTheme.dangerText,
  };
}

export function getSupportStatusMeta(
  status: SupportChatStatus | null | undefined,
  viewerRole: "vendor" | "customer",
  colors?: ThemeColors,
) {
  if (status === "resolved") {
    return {
      label: "Resolved",
      icon: "checkmark-circle-outline" as const,
      backgroundColor: colors?.successSoft ?? lightTheme.successSoft,
      color: colors?.successText ?? lightTheme.successText,
      helper: "Reply to this thread any time if you need it reopened.",
    };
  }
  if (status === "waiting_on_customer") {
    return {
      label: viewerRole === "vendor" ? "Waiting on you" : "Waiting on you",
      icon: "person-outline" as const,
      backgroundColor: colors?.infoSoft ?? lightTheme.infoSoft,
      color: colors?.infoText ?? lightTheme.infoText,
      helper: "The ODOS team has responded. Send the next detail to continue.",
    };
  }
  return {
    label: "Waiting on admin",
    icon: "time-outline" as const,
    backgroundColor: colors?.warningSoft ?? lightTheme.warningSoft,
    color: colors?.warningText ?? lightTheme.warningText,
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
  const { colors } = useTheme();
  const avatarSource: ImageSourcePropType =
    avatarMode === "counterpart" && thread.counterpart.avatarUrl
      ? { uri: thread.counterpart.avatarUrl }
      : resolveImageSource(thread.store.imageUrl, thread.store.imageKey);

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress}>
      <AccountListCard>
        <View style={chatStyles.threadRow}>
          <CommerceImage
            source={avatarSource}
            style={chatStyles.avatar}
            contentFit="cover"
            trackingId={`chat-thread-avatar-${thread.id}`}
            recyclingKey={thread.counterpart.avatarUrl || thread.store.imageUrl || thread.store.imageKey || thread.id}
          />

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
            <Ionicons
              name="chevron-forward"
              size={rMS(18)}
              color={colors.placeholder}
            />
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
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const stableConnectionState = useStableConnectionState(connectionState);
  const connectionMeta = getConnectionMeta(stableConnectionState, colors);

  return (
    <View style={[chatStyles.header, { paddingTop: insets.top + rV(8) }]}>
      <View style={chatStyles.headerRow}>
        <TouchableOpacity
          style={chatStyles.backButton}
          onPress={onBack}
          activeOpacity={0.82}
        >
          <Ionicons name="arrow-back" size={rMS(20)} color={colors.text} />
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
        <CommerceImage
          source={imageSource}
          style={chatStyles.contextImage}
          contentFit="cover"
          trackingId={`chat-context-${title}`}
          recyclingKey={imageUrl || imageKey || title}
        />
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
  onCopied?: () => void;
};

const IMAGE_BUBBLE_MAX_WIDTH = rS(228);
const IMAGE_BUBBLE_MAX_HEIGHT = rV(300);
const IMAGE_BUBBLE_MIN_SIZE = rS(130);
const IMAGE_BUBBLE_FALLBACK_SIZE = rS(220);
const IMAGE_VIEWER_DISMISS_THRESHOLD = 120;

type ChatImageViewerModalProps = {
  visible: boolean;
  uri?: string | null;
  messageId: string;
  isSharing: boolean;
  onShare: () => void;
  onClose: () => void;
};

/** Fullscreen tap-to-view image viewer with a WhatsApp-style drag-down-to-dismiss gesture. */
function ChatImageViewerModal({
  visible,
  uri,
  messageId,
  isSharing,
  onShare,
  onClose,
}: ChatImageViewerModalProps) {
  const chatStyles = useChatStyles();
  const translateY = useSharedValue(0);
  const backdropOpacity = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      backdropOpacity.value = 1;
    }
  }, [visible, translateY, backdropOpacity]);

  const dismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(12)
    .failOffsetX([-24, 24])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        backdropOpacity.value = interpolate(event.translationY, [0, 280], [1, 0.35]);
      }
    })
    .onEnd((event) => {
      if (event.translationY > IMAGE_VIEWER_DISMISS_THRESHOLD || event.velocityY > 900) {
        translateY.value = withTiming(420, { duration: 180 }, () => {
          runOnJS(dismiss)();
        });
        backdropOpacity.value = withTiming(0, { duration: 180 });
        return;
      }

      translateY.value = withSpring(0, { damping: 20, stiffness: 240 });
      backdropOpacity.value = withSpring(1);
    });

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(translateY.value, [0, 280], [1, 0.72], Extrapolation.CLAMP),
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={chatStyles.imageViewerBackdrop}>
        <Reanimated.View
          pointerEvents="none"
          style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#000000" }, backdropStyle]}
        />
        <GestureDetector gesture={panGesture}>
          <Reanimated.View style={[{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }, imageStyle]}>
            <CommerceImage
              source={{ uri: uri ?? undefined }}
              style={chatStyles.imageViewerImage}
              contentFit="contain"
              trackingId={`chat-image-full-${messageId}`}
            />
          </Reanimated.View>
        </GestureDetector>
        <View style={chatStyles.imageViewerToolbar}>
          <Pressable
            style={chatStyles.imageViewerActionButton}
            onPress={onShare}
            disabled={isSharing}
            accessibilityLabel="Share photo"
          >
            {isSharing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="share-outline" size={rMS(20)} color="#FFFFFF" />
            )}
          </Pressable>
          <Pressable
            style={chatStyles.imageViewerActionButton}
            onPress={onClose}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={rMS(22)} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function computeImageBubbleSize(naturalWidth: number, naturalHeight: number) {
  if (!naturalWidth || !naturalHeight) {
    return { width: IMAGE_BUBBLE_FALLBACK_SIZE, height: IMAGE_BUBBLE_FALLBACK_SIZE };
  }
  const aspectRatio = naturalWidth / naturalHeight;
  let width = IMAGE_BUBBLE_MAX_WIDTH;
  let height = width / aspectRatio;
  if (height > IMAGE_BUBBLE_MAX_HEIGHT) {
    height = IMAGE_BUBBLE_MAX_HEIGHT;
    width = height * aspectRatio;
  }
  return {
    width: Math.max(width, IMAGE_BUBBLE_MIN_SIZE),
    height: Math.max(height, IMAGE_BUBBLE_MIN_SIZE),
  };
}

export function ChatMessageBubble({
  message,
  isMine,
  showMeta,
  onCopied,
}: ChatMessageBubbleProps) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  const { deleteMessage } = useChat();
  const { showToast } = useToast();
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  const isImageMessage = message.attachmentType === "image" && Boolean(message.attachmentUrl);
  const hasCaption = Boolean(message.text?.trim());

  useEffect(() => {
    if (!isImageMessage || !message.attachmentUrl) {
      return;
    }
    let cancelled = false;
    Image.getSize(
      message.attachmentUrl,
      (width, height) => {
        if (!cancelled) {
          setNaturalSize({ width, height });
        }
      },
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, [isImageMessage, message.attachmentUrl]);

  const imageSize = naturalSize
    ? computeImageBubbleSize(naturalSize.width, naturalSize.height)
    : { width: IMAGE_BUBBLE_FALLBACK_SIZE, height: IMAGE_BUBBLE_FALLBACK_SIZE };

  const copyText = useCallback(() => {
    const text = message.text?.trim();
    if (!text) {
      return;
    }
    void Clipboard.setStringAsync(text).then(() => {
      onCopied?.();
    });
  }, [message.text, onCopied]);

  const confirmDelete = useCallback(() => {
    Alert.alert("Delete message?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void deleteMessage(message.threadId, message.id).catch((error: unknown) => {
            showToast(
              error instanceof Error ? error.message : "We couldn't delete that message.",
            );
          });
        },
      },
    ]);
  }, [deleteMessage, message.id, message.threadId, showToast]);

  const handleLongPress = useCallback(() => {
    const text = message.text?.trim();
    const canCopy = Boolean(text);
    const canDelete = isMine;
    if (!canCopy && !canDelete) {
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (canCopy && canDelete) {
      Alert.alert("Message", undefined, [
        { text: "Cancel", style: "cancel" },
        { text: "Copy", onPress: copyText },
        { text: "Delete", style: "destructive", onPress: confirmDelete },
      ]);
      return;
    }

    if (canCopy) {
      copyText();
      return;
    }

    confirmDelete();
  }, [confirmDelete, copyText, isMine, message.text]);

  const handleOpenFile = useCallback(() => {
    const url = message.attachmentUrl?.trim();
    if (url && /^https?:/i.test(url)) {
      void Linking.openURL(url);
    }
  }, [message.attachmentUrl]);

  const handleShareImage = useCallback(async () => {
    if (!message.attachmentUrl || isSharingImage) {
      return;
    }
    setIsSharingImage(true);
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return;
      }
      const downloaded = await File.downloadFileAsync(message.attachmentUrl, Paths.cache);
      await Sharing.shareAsync(downloaded.uri);
    } catch {
      // Sharing is best-effort — a failed download/share shouldn't disrupt the chat.
    } finally {
      setIsSharingImage(false);
    }
  }, [message.attachmentUrl, isSharingImage]);

  const timeLabel = `${formatChatTime(message.time)}${isMine && message.isRead ? " · Seen" : ""}`;

  const renderStatusOrTime = (textStyle: TextStyle, color: string) => {
    if (message.status === "sending") {
      return (
        <View style={{ alignSelf: "flex-end" }}>
          <Ionicons name="time-outline" size={rMS(11)} color={color} />
        </View>
      );
    }
    if (message.status === "failed") {
      return (
        <View style={chatStyles.failedRow}>
          <Ionicons name="alert-circle" size={rMS(11)} color={colors.dangerText} />
          <Text style={[textStyle, { color: colors.dangerText }]}>Not sent</Text>
        </View>
      );
    }
    return <Text style={[textStyle, { color }]}>{timeLabel}</Text>;
  };

  return (
    <AnimatedChatMessageWrap isMine={isMine}>
      <View
        style={[
          chatStyles.messageRow,
          isMine ? chatStyles.messageRowMine : chatStyles.messageRowTheirs,
        ]}
      >
        <GesturePressable
          onLongPress={handleLongPress}
          delayLongPress={400}
          style={({ pressed }) => [
            chatStyles.bubble,
            isMine ? chatStyles.bubbleMine : chatStyles.bubbleTheirs,
            isImageMessage ? chatStyles.bubbleImageOnly : null,
            message.status === "sending" ? { opacity: 0.72 } : null,
            pressed ? { opacity: 0.9 } : null,
          ]}
        >
          {isImageMessage && message.attachmentUrl ? (
            <>
              <GesturePressable
                onPress={() => setIsImageViewerOpen(true)}
                onLongPress={handleLongPress}
                delayLongPress={400}
                style={({ pressed }) => [
                  { width: imageSize.width, height: imageSize.height },
                  pressed ? { opacity: 0.92 } : null,
                ]}
              >
                <CommerceImage
                  source={{ uri: message.attachmentUrl }}
                  style={chatStyles.attachmentImage}
                  trackingId={`chat-image-${message.id}`}
                  recyclingKey={message.attachmentUrl}
                />
                {!hasCaption && showMeta ? (
                  <View style={chatStyles.imageTimeOverlay}>
                    {renderStatusOrTime(chatStyles.imageTimeOverlayText, "#FFFFFF")}
                  </View>
                ) : null}
              </GesturePressable>
              <ChatImageViewerModal
                visible={isImageViewerOpen}
                uri={message.attachmentUrl}
                messageId={message.id}
                isSharing={isSharingImage}
                onShare={() => void handleShareImage()}
                onClose={() => setIsImageViewerOpen(false)}
              />
            </>
          ) : null}

          {message.attachmentType === "audio" && message.attachmentUrl ? (
            <VoiceNoteBubbleContent
              url={message.attachmentUrl}
              durationSeconds={message.attachmentDurationSeconds ?? 0}
              isMine={isMine}
            />
          ) : null}

          {message.attachmentType === "file" && message.attachmentUrl ? (
            <GesturePressable
              onPress={handleOpenFile}
              style={({ pressed }) => [
                chatStyles.attachmentFileRow,
                pressed ? { opacity: 0.85 } : null,
              ]}
            >
              <View
                style={[
                  chatStyles.attachmentFileIconShell,
                  { backgroundColor: isMine ? "rgba(255,255,255,0.18)" : colors.surfaceMuted },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={rMS(18)}
                  color={isMine ? colors.onPrimary : colors.text}
                />
              </View>
              <Text
                style={[
                  chatStyles.attachmentFileName,
                  { color: isMine ? colors.onPrimary : colors.text },
                ]}
                numberOfLines={1}
              >
                {message.attachmentName ?? "File"}
              </Text>
              <Ionicons
                name="download-outline"
                size={rMS(16)}
                color={isMine ? colors.onPrimary : colors.textMuted}
              />
            </GesturePressable>
          ) : null}

          {isImageMessage ? (
            hasCaption ? (
              <View style={chatStyles.captionBlock}>
                <Text
                  style={[chatStyles.bubbleText, { color: isMine ? colors.onPrimary : colors.text }]}
                >
                  {message.text}
                </Text>
                {showMeta
                  ? renderStatusOrTime(
                      chatStyles.bubbleMeta,
                      isMine ? "rgba(255,255,255,0.88)" : colors.textMuted,
                    )
                  : null}
              </View>
            ) : null
          ) : (
            <>
              {message.text?.trim() ? (
                <Text
                  style={[
                    chatStyles.bubbleText,
                    message.attachmentType ? { marginTop: rV(6) } : null,
                    { color: isMine ? colors.onPrimary : colors.text },
                  ]}
                >
                  {message.text}
                </Text>
              ) : null}
              {showMeta
                ? renderStatusOrTime(
                    chatStyles.bubbleMeta,
                    isMine ? "rgba(255,255,255,0.88)" : colors.textMuted,
                  )
                : null}
            </>
          )}
        </GesturePressable>
      </View>
    </AnimatedChatMessageWrap>
  );
}

function formatVoiceNoteDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function VoiceNoteBubbleContent({
  url,
  durationSeconds,
  isMine,
}: {
  url: string;
  durationSeconds: number;
  isMine: boolean;
}) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  const player = useAudioPlayer({ uri: url });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (status.didJustFinish) {
      player.seekTo(0);
    }
  }, [player, status.didJustFinish]);

  const handleToggle = useCallback(() => {
    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish) {
        player.seekTo(0);
      }
      player.play();
    }
  }, [player, status.didJustFinish, status.playing]);

  const tint = isMine ? colors.onPrimary : colors.text;
  const displaySeconds =
    status.playing || status.currentTime > 0 ? Math.floor(status.currentTime) : durationSeconds;

  return (
    <View style={chatStyles.voiceNoteRow}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleToggle}
        style={[
          chatStyles.voiceNotePlayButton,
          { backgroundColor: isMine ? "rgba(255,255,255,0.2)" : colors.surfaceMuted },
        ]}
      >
        <Ionicons name={status.playing ? "pause" : "play"} size={rMS(16)} color={tint} />
      </TouchableOpacity>
      <View style={chatStyles.voiceNoteWave}>
        <View style={[chatStyles.voiceNoteWaveTrack, { backgroundColor: tint, opacity: 0.35 }]} />
      </View>
      <Text style={[chatStyles.voiceNoteDuration, { color: tint }]}>
        {formatVoiceNoteDuration(displaySeconds)}
      </Text>
    </View>
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
  onAttachPress?: () => void;
  attachmentSupported?: boolean;
  /** A photo picked but not yet sent — shown as a preview above the text
   * input so the sender can add a caption before sending, same as any
   * normal chat app. Cleared by the parent once `onSend` has used it. */
  pendingImageUri?: string | null;
  onRemovePendingImage?: () => void;
  /** Presence of this callback enables the whole press-and-hold voice note
   * flow. Called only once the user has explicitly reviewed and sent the
   * recording from the preview step — never on release alone. */
  onSendVoiceNote?: (uri: string, durationSeconds: number) => void | Promise<void>;
  onVoiceNoteError?: (message: string) => void;
};

const VOICE_LOCK_THRESHOLD_PX = 70;

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
  onAttachPress,
  attachmentSupported = false,
  pendingImageUri,
  onRemovePendingImage,
  onSendVoiceNote,
  onVoiceNoteError,
}: ChatComposerProps) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const canSend = (Boolean(value.trim()) || Boolean(pendingImageUri)) && !disabled && !isSending;
  const voiceNoteSupported = Boolean(onSendVoiceNote);
  const showVoiceNoteButton = voiceNoteSupported && !value.trim() && !pendingImageUri;
  const sendScale = useRef(new Animated.Value(1)).current;

  const recorder = useVoiceNoteRecorder();
  const [voicePhase, setVoicePhase] = useState<"idle" | "recording" | "locked" | "preview">(
    "idle",
  );
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewDuration, setPreviewDuration] = useState(0);
  const isLockedRef = useRef(false);
  const previewPlayer = useAudioPlayer(previewUri ? { uri: previewUri } : undefined);
  const previewStatus = useAudioPlayerStatus(previewPlayer);

  useEffect(() => {
    Animated.spring(sendScale, {
      toValue: canSend ? 1 : 0.94,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [canSend, sendScale]);

  const resetVoiceState = useCallback(() => {
    isLockedRef.current = false;
    setVoicePhase("idle");
    setPreviewUri(null);
    setPreviewDuration(0);
  }, []);

  const handleStartRecording = useCallback(async () => {
    isLockedRef.current = false;
    setVoicePhase("recording");
    const result = await recorder.startRecording();
    if (!result.granted) {
      resetVoiceState();
      onVoiceNoteError?.("Allow microphone access to record a voice note.");
    }
  }, [recorder, resetVoiceState, onVoiceNoteError]);

  const handleStopToPreview = useCallback(async () => {
    const result = await recorder.stopRecording();
    if (!result) {
      resetVoiceState();
      return;
    }
    setPreviewUri(result.uri);
    setPreviewDuration(result.durationSeconds);
    setVoicePhase("preview");
  }, [recorder, resetVoiceState]);

  const handleDiscard = useCallback(async () => {
    previewPlayer.pause();
    await recorder.discardRecording();
    resetVoiceState();
  }, [previewPlayer, recorder, resetVoiceState]);

  const handleSendPreview = useCallback(async () => {
    if (!previewUri || !onSendVoiceNote) {
      return;
    }
    previewPlayer.pause();
    const uri = previewUri;
    const duration = previewDuration;
    resetVoiceState();
    await onSendVoiceNote(uri, duration);
  }, [onSendVoiceNote, previewDuration, previewPlayer, previewUri, resetVoiceState]);

  const canRecordVoiceNote = voiceNoteSupported && !disabled && !isSending;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => canRecordVoiceNote,
        onMoveShouldSetPanResponder: () => canRecordVoiceNote,
        onPanResponderGrant: () => {
          void handleStartRecording();
        },
        onPanResponderMove: (_event, gestureState) => {
          if (isLockedRef.current) {
            return;
          }
          if (gestureState.dy <= -VOICE_LOCK_THRESHOLD_PX) {
            isLockedRef.current = true;
            setVoicePhase("locked");
          }
        },
        onPanResponderRelease: () => {
          if (isLockedRef.current) {
            return;
          }
          void handleStopToPreview();
        },
        // Without this, a parent ScrollView/FlatList can steal the gesture
        // the moment a finger drifts even slightly, firing Terminate instead
        // of Release — which silently discarded the recording.
        onPanResponderTerminationRequest: () => false,
        onPanResponderTerminate: () => {
          if (!isLockedRef.current) {
            void handleDiscard();
          }
        },
      }),
    [canRecordVoiceNote, handleStartRecording, handleStopToPreview, handleDiscard],
  );

  const isVoiceFlowActive = voicePhase !== "idle";
  const previewDisplaySeconds =
    previewStatus.playing || previewStatus.currentTime > 0
      ? Math.floor(previewStatus.currentTime)
      : previewDuration;

  return (
    <View
      style={[
        chatStyles.composerWrap,
        { paddingBottom: Math.max(insets.bottom, rV(12)) },
      ]}
    >
      {hint && !isVoiceFlowActive ? <Text style={chatStyles.composerHint}>{hint}</Text> : null}

      {pendingImageUri && !isVoiceFlowActive ? (
        <View style={chatStyles.pendingImageRow}>
          <View style={chatStyles.pendingImageThumbWrap}>
            <CommerceImage
              source={{ uri: pendingImageUri }}
              style={chatStyles.pendingImageThumb}
              trackingId="chat-pending-image"
              recyclingKey={pendingImageUri}
            />
            <Pressable
              onPress={onRemovePendingImage}
              style={chatStyles.pendingImageRemoveButton}
              accessibilityLabel="Remove photo"
            >
              <Ionicons name="close" size={rMS(12)} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={chatStyles.pendingImageHint}>Add a caption (optional)</Text>
        </View>
      ) : null}

      {voicePhase === "recording" || voicePhase === "locked" ? (
        <View style={chatStyles.composerRow}>
          <Pressable
            onPress={() => void handleDiscard()}
            style={[chatStyles.sendButton, chatStyles.sendButtonDisabled]}
            accessibilityLabel="Cancel recording"
          >
            <Ionicons name="trash-outline" size={rMS(16)} color={colors.dangerText} />
          </Pressable>
          <View style={[chatStyles.composerInputWrap, chatStyles.recordingRow]}>
            <View style={[chatStyles.recordingDot, { backgroundColor: colors.dangerText }]} />
            <Text style={[chatStyles.composerInput, { color: colors.text }]}>
              {formatVoiceNoteDuration(recorder.elapsedSeconds)}
            </Text>
            {voicePhase === "recording" ? (
              <Text style={chatStyles.recordingLockHint}>↑ Slide up to lock</Text>
            ) : (
              <Ionicons name="lock-closed" size={rMS(14)} color={colors.textMuted} />
            )}
          </View>
          {voicePhase === "locked" ? (
            <Pressable
              onPress={() => void handleStopToPreview()}
              style={[chatStyles.sendButton, chatStyles.sendButtonActive]}
              accessibilityLabel="Stop recording"
            >
              <Ionicons name="stop" size={rMS(16)} color={colors.onPrimary} />
            </Pressable>
          ) : (
            <View
              {...panResponder.panHandlers}
              style={[chatStyles.sendButton, chatStyles.sendButtonActive]}
            >
              <Ionicons name="mic" size={rMS(18)} color={colors.onPrimary} />
            </View>
          )}
        </View>
      ) : voicePhase === "preview" ? (
        <View style={chatStyles.composerRow}>
          <Pressable
            onPress={() => void handleDiscard()}
            style={[chatStyles.sendButton, chatStyles.sendButtonDisabled]}
            accessibilityLabel="Discard voice note"
          >
            <Ionicons name="trash-outline" size={rMS(16)} color={colors.dangerText} />
          </Pressable>
          <View style={[chatStyles.composerInputWrap, chatStyles.voiceNoteRow]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (previewStatus.playing) {
                  previewPlayer.pause();
                } else {
                  if (previewStatus.didJustFinish) {
                    previewPlayer.seekTo(0);
                  }
                  previewPlayer.play();
                }
              }}
              style={[chatStyles.voiceNotePlayButton, { backgroundColor: colors.surfaceMuted }]}
            >
              <Ionicons
                name={previewStatus.playing ? "pause" : "play"}
                size={rMS(15)}
                color={colors.text}
              />
            </TouchableOpacity>
            <View style={chatStyles.voiceNoteWave}>
              <View
                style={[
                  chatStyles.voiceNoteWaveTrack,
                  { backgroundColor: colors.text, opacity: 0.3 },
                ]}
              />
            </View>
            <Text style={[chatStyles.voiceNoteDuration, { color: colors.text }]}>
              {formatVoiceNoteDuration(previewDisplaySeconds)}
            </Text>
          </View>
          <Pressable
            onPress={() => void handleSendPreview()}
            style={[chatStyles.sendButton, chatStyles.sendButtonActive]}
            accessibilityLabel="Send voice note"
          >
            <Ionicons name="send" size={rMS(16)} color={colors.onPrimary} />
          </Pressable>
        </View>
      ) : (
        <View style={chatStyles.composerRow}>
          {attachmentSupported && onAttachPress ? (
            <Pressable
              onPress={onAttachPress}
              disabled={disabled || isSending}
              style={[chatStyles.sendButton, chatStyles.sendButtonDisabled, { marginRight: rS(8) }]}
              accessibilityLabel="Add photo"
            >
              <Ionicons name="image-outline" size={rMS(19)} color={colors.text} />
            </Pressable>
          ) : null}
          {voiceSupported && onVoicePress ? (
            <Pressable
              onPress={onVoicePress}
              disabled={disabled || isSending}
              style={[
                chatStyles.sendButton,
                isListening
                  ? chatStyles.sendButtonActive
                  : chatStyles.sendButtonDisabled,
                {
                  marginRight: rS(8),
                  backgroundColor: isListening ? colors.dangerText : colors.textMuted,
                },
              ]}
              accessibilityLabel={
                isListening ? "Stop voice input" : "Start voice input"
              }
            >
              <Ionicons
                name={isListening ? "stop" : "mic"}
                size={rMS(16)}
                color={colors.onPrimary}
              />
            </Pressable>
          ) : null}
          <View style={chatStyles.composerInputWrap}>
            <TextInput
              placeholder={placeholder}
              placeholderTextColor={colors.placeholder}
              value={value}
              onChangeText={onChangeText}
              style={chatStyles.composerInput}
              multiline
              editable={!disabled && !isSending}
            />
          </View>
          {showVoiceNoteButton ? (
            <View
              {...panResponder.panHandlers}
              style={[chatStyles.sendButton, chatStyles.sendButtonDisabled]}
              accessibilityLabel="Hold to record a voice note"
            >
              <Ionicons name="mic-outline" size={rMS(18)} color={colors.text} />
            </View>
          ) : (
            <Animated.View style={{ transform: [{ scale: sendScale }] }}>
              <Pressable
                onPress={onSend}
                disabled={!canSend}
                style={[
                  chatStyles.sendButton,
                  canSend
                    ? chatStyles.sendButtonActive
                    : chatStyles.sendButtonDisabled,
                ]}
              >
                {isSending ? (
                  <TypingDots color={colors.onPrimary} dotSize={rS(5)} />
                ) : (
                  <Ionicons name="send" size={rMS(16)} color={colors.onPrimary} />
                )}
              </Pressable>
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
}

type ChatScreenShellProps = {
  children: React.ReactNode;
  variant?: "default" | "assistant";
};

export function ChatScreenShell({
  children,
  variant = "default",
}: ChatScreenShellProps) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();

  return (
    <KeyboardAvoidingView
      style={chatStyles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={
          variant === "assistant"
            ? [colors.surfaceSubtle, colors.accentSoft, colors.screen]
            : [colors.surfaceSubtle, colors.screen, colors.screen]
        }
        locations={variant === "assistant" ? [0, 0.42, 1] : [0, 0.2, 1]}
        style={chatStyles.screenBackground}
      >
        {children}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

export function ChatCopyFeedback({ visible }: { visible: boolean }) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <Reanimated.View
      pointerEvents="none"
      style={chatStyles.copyToast}
    >
      <View style={chatStyles.copyToastPill}>
        <Ionicons name="checkmark" size={rMS(14)} color={colors.onPrimary} />
        <Text style={chatStyles.copyToastText}>Copied</Text>
      </View>
    </Reanimated.View>
  );
}

type ChatQuickRepliesProps = {
  replies: string[];
  disabled?: boolean;
  onSelect: (reply: string) => void;
  sendOnSelect?: boolean;
};

export function ChatQuickReplies({
  replies,
  disabled = false,
  onSelect,
}: ChatQuickRepliesProps) {
  const chatStyles = useChatStyles();

  if (!replies.length) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      style={{ flexGrow: 0, flexShrink: 0 }}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={chatStyles.quickReplyRow}
      keyboardShouldPersistTaps="handled"
    >
      {replies.map((reply) => (
        <TouchableOpacity
          key={reply}
          activeOpacity={0.86}
          disabled={disabled}
          style={[chatStyles.quickReplyChip, disabled ? { opacity: 0.55 } : null]}
          onPress={() => onSelect(reply)}
        >
          <Text style={chatStyles.quickReplyLabel}>{reply}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

type ChatSupportContextPanelProps = {
  subject: string;
  helper: string;
  assignedAdminName?: string | null;
  statusLabel?: string;
  canMarkResolved?: boolean;
  isUpdatingStatus?: boolean;
  onMarkResolved?: () => void;
};

export function ChatSupportContextPanel({
  subject,
  helper,
  assignedAdminName,
  statusLabel,
  canMarkResolved = false,
  isUpdatingStatus = false,
  onMarkResolved,
}: ChatSupportContextPanelProps) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={chatStyles.supportContextWrap}>
      <View style={chatStyles.supportContextCard}>
        <TouchableOpacity
          activeOpacity={0.86}
          style={chatStyles.supportContextHeader}
          onPress={() => setExpanded((current) => !current)}
        >
          <View style={chatStyles.headerAvatarSupport}>
            <Ionicons name="shield-checkmark-outline" size={rMS(18)} color={colors.onInverseSurface} />
          </View>
          <View style={{ flex: 1, gap: rV(2) }}>
            <Text style={chatStyles.supportContextTitle} numberOfLines={expanded ? 2 : 1}>
              {subject}
            </Text>
            {statusLabel ? (
              <Text style={chatStyles.supportContextSub} numberOfLines={1}>
                {statusLabel}
              </Text>
            ) : null}
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={rMS(18)}
            color={colors.textMuted}
          />
        </TouchableOpacity>
        {expanded ? (
          <View style={chatStyles.supportContextBody}>
            <Text style={chatStyles.supportContextSub}>{helper}</Text>
            {assignedAdminName ? (
              <View style={chatStyles.chip}>
                <Text style={chatStyles.chipText}>
                  Assigned to {assignedAdminName}
                </Text>
              </View>
            ) : null}
            {canMarkResolved && onMarkResolved ? (
              <AccountActionButton
                label={isUpdatingStatus ? "Updating..." : "Mark resolved"}
                variant="secondary"
                disabled={isUpdatingStatus}
                onPress={onMarkResolved}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

type ChatScrollToBottomButtonProps = {
  visible: boolean;
  onPress: () => void;
};

export function ChatScrollToBottomButton({
  visible,
  onPress,
}: ChatScrollToBottomButtonProps) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <Reanimated.View
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(120)}
      style={chatStyles.scrollToBottomWrap}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onPress}
        style={chatStyles.scrollToBottomBtn}
        accessibilityRole="button"
        accessibilityLabel="Scroll to latest message"
      >
        <Ionicons name="chevron-down" size={rMS(18)} color={colors.onInverseSurface} />
      </Pressable>
    </Reanimated.View>
  );
}

export function ChatLoadingCenter({ label }: { label: string }) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  return (
    <View style={chatStyles.loadingWrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={chatStyles.loadingText}>{label}</Text>
    </View>
  );
}

export function ChatMessagesEmpty({
  title,
  description,
  icon = "chatbubbles-outline",
}: {
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  return (
    <View style={chatStyles.emptyMessages}>
      <View style={chatStyles.emptyMessagesIconWrap}>
        <Ionicons name={icon} size={rMS(28)} color={colors.primary} />
      </View>
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
  onCopied,
}: {
  item: ChatMessage;
  index: number;
  messages: ChatMessage[];
  currentUserId?: string;
  onCopied?: () => void;
}) {
  const isMine = item.senderUserId === currentUserId;
  const itemTime = new Date(item.time).getTime();
  const prev = messages[index - 1];
  const next = messages[index + 1];
  const prevTime = prev ? new Date(prev.time).getTime() : 0;
  const nextTime = next ? new Date(next.time).getTime() : 0;
  const showDay = !prev || !isSameChatDay(prevTime, itemTime);
  const nextSameSender = next?.senderUserId === item.senderUserId;
  const nextCloseInTime = next
    ? Math.abs(nextTime - itemTime) < 6 * 60 * 1000
    : false;
  const showMeta = !nextSameSender || !nextCloseInTime;

  return (
    <React.Fragment key={item.id}>
      {showDay ? <ChatDayDivider label={formatChatDayLabel(itemTime)} /> : null}
      <ChatMessageBubble
        message={item}
        isMine={isMine}
        showMeta={showMeta}
        onCopied={onCopied}
      />
    </React.Fragment>
  );
}

export {
  AnimatedChatMessageWrap,
  AnimatedChatThreadWrap,
  ChatTypingIndicator,
  TypingDots,
} from "@/components/chat/ChatAnimations";
export { useChatStyles } from "@/styles/themedChatStyles";
