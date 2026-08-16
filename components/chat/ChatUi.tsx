import { AccountBadge, AccountListCard, AccountActionButton } from "@/components/account/AccountUi";
import {
  AnimatedChatMessageWrap,
  TypingDots,
} from "@/components/chat/ChatAnimations";
import CommerceImage from "@/components/media/CommerceImage";
import { lightTheme, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useVoiceNoteRecorder } from "@/hooks/useVoiceNoteRecorder";
import { rMS, rS, rV } from "@/styles/responsive";
import { useChatStyles } from "@/styles/themedChatStyles";
import type { ChatMessage, ChatThread, SupportChatStatus } from "@/types/chat";
import { resolveImageSource } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
} from "react-native";
import { Pressable as GesturePressable } from "react-native-gesture-handler";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
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

export function ChatMessageBubble({
  message,
  isMine,
  showMeta,
  onCopied,
}: ChatMessageBubbleProps) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const handleLongPress = useCallback(() => {
    const text = message.text?.trim();
    if (!text) {
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void Clipboard.setStringAsync(text).then(() => {
      onCopied?.();
    });
  }, [message.text, onCopied]);

  const handleOpenFile = useCallback(() => {
    const url = message.attachmentUrl?.trim();
    if (url && /^https?:/i.test(url)) {
      void Linking.openURL(url);
    }
  }, [message.attachmentUrl]);

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
            message.attachmentType === "image" ? chatStyles.bubbleImagePadding : null,
            pressed ? { opacity: 0.9 } : null,
          ]}
        >
          {message.attachmentType === "image" && message.attachmentUrl ? (
            <>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setIsImageViewerOpen(true)}
                style={chatStyles.attachmentImageWrap}
              >
                <CommerceImage
                  source={{ uri: message.attachmentUrl }}
                  style={chatStyles.attachmentImage}
                  trackingId={`chat-image-${message.id}`}
                  recyclingKey={message.attachmentUrl}
                />
              </TouchableOpacity>
              <Modal
                visible={isImageViewerOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsImageViewerOpen(false)}
              >
                <Pressable
                  style={chatStyles.imageViewerBackdrop}
                  onPress={() => setIsImageViewerOpen(false)}
                >
                  <CommerceImage
                    source={{ uri: message.attachmentUrl }}
                    style={chatStyles.imageViewerImage}
                    contentFit="contain"
                    trackingId={`chat-image-full-${message.id}`}
                  />
                  <Pressable
                    style={chatStyles.imageViewerCloseButton}
                    onPress={() => setIsImageViewerOpen(false)}
                  >
                    <Ionicons name="close" size={rMS(22)} color="#FFFFFF" />
                  </Pressable>
                </Pressable>
              </Modal>
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
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenFile}
              style={chatStyles.attachmentFileRow}
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
            </TouchableOpacity>
          ) : null}

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
          {showMeta ? (
            <Text
              style={[
                chatStyles.bubbleMeta,
                {
                  color: isMine
                    ? "rgba(255,255,255,0.88)"
                    : colors.textMuted,
                },
              ]}
            >
              {formatChatTime(message.time)}
              {isMine && message.isRead ? " · Seen" : ""}
            </Text>
          ) : null}
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
  onSendVoiceNote,
  onVoiceNoteError,
}: ChatComposerProps) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const canSend = Boolean(value.trim()) && !disabled && !isSending;
  const voiceNoteSupported = Boolean(onSendVoiceNote);
  const showVoiceNoteButton = voiceNoteSupported && !value.trim();
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
              accessibilityLabel="Add attachment"
            >
              <Ionicons name="add" size={rMS(20)} color={colors.text} />
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
