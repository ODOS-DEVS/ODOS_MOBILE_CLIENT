import {
  ChatComposer,
  ChatCopyFeedback,
  ChatContextCard,
  ChatLoadingCenter,
  ChatMessagesEmpty,
  ChatQuickReplies,
  ChatScreenHeader,
  ChatScreenShell,
  ChatScrollToBottomButton,
  ChatTypingIndicator,
  renderChatMessageItem,
  useChatStyles,
} from "@/components/chat/ChatUi";
import CommerceImage from "@/components/media/CommerceImage";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useRealtime } from "@/context/RealtimeContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import type { ChatAttachmentUpload } from "@/services/chatService";
import { rMS } from "@/styles/responsive";
import { pickChatImage } from "@/utils/imagePicker";
import { resolveImageSource } from "@/utils/media";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  Text,
  View,
} from "react-native";

const getParam = (p: string | string[] | undefined) =>
  Array.isArray(p) ? p[0] : p;

const VENDOR_QUICK_REPLIES = [
  "Yes, it's in stock.",
  "You can order now — we'll prepare it right away.",
  "Sorry, this item is out of stock right now.",
  "Thanks for reaching out. How can I help?",
];

export default function VendorChatScreen() {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { connectionState } = useRealtime();
  const {
    ensureThread,
    getThreadById,
    loadCustomerThreads,
    loadMessages,
    loadVendorThreads,
    loadingThreadId,
    messagesByThread,
    sendMessage,
    sendingThreadId,
  } = useChat();

  const storeId = getParam(params.vendorId) ?? "";
  const fallbackName = getParam(params.vendorName) ?? "Store";
  const viewer = getParam(params.viewer) === "vendor" ? "vendor" : "customer";
  const productId = getParam(params.productId) ?? undefined;
  const productTitle = getParam(params.productTitle) ?? undefined;
  const productImageUrl = getParam(params.productImageUrl) ?? undefined;
  const initialThreadId = getParam(params.threadId) ?? "";

  const [resolvedThreadId, setResolvedThreadId] = useState(initialThreadId);
  const [input, setInput] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [copyFeedbackVisible, setCopyFeedbackVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [pendingImage, setPendingImage] = useState<ChatAttachmentUpload | null>(null);
  const copyFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const listRef = useRef<FlatList>(null);
  const messagesByThreadRef = useRef(messagesByThread);
  const isAtBottomRef = useRef(true);
  messagesByThreadRef.current = messagesByThread;
  const thread = getThreadById(resolvedThreadId);
  const messages = resolvedThreadId
    ? (messagesByThread[resolvedThreadId] ?? [])
    : [];
  const isSending = sendingThreadId === resolvedThreadId;
  const isLoadingMessages =
    loadingThreadId === resolvedThreadId &&
    (resolvedThreadId
      ? (messagesByThread[resolvedThreadId]?.length ?? 0) === 0
      : true);

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

  const handleQuickReply = useCallback(
    async (reply: string) => {
      if (!resolvedThreadId) {
        setInput(reply);
        return;
      }
      try {
        await sendMessage(resolvedThreadId, reply);
      } catch (error) {
        showToast(
          error instanceof Error
            ? error.message
            : "We couldn't send that message.",
        );
      }
    },
    [resolvedThreadId, sendMessage, showToast],
  );

  useEffect(() => {
    if (initialThreadId && initialThreadId !== resolvedThreadId) {
      setResolvedThreadId(initialThreadId);
    }
  }, [initialThreadId, resolvedThreadId]);

  const bootstrapThread = useCallback(async () => {
    if (viewer === "vendor" || resolvedThreadId || !storeId) {
      return;
    }

    setIsBootstrapping(true);
    setBootstrapError(null);
    try {
      const createdThread = await ensureThread({
        storeId,
        productId,
        productTitle,
        productImageUrl,
      });
      setResolvedThreadId(createdThread.id);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't open the chat yet.";
      setBootstrapError(message);
      showToast(message);
    } finally {
      setIsBootstrapping(false);
    }
  }, [
    ensureThread,
    productId,
    productImageUrl,
    productTitle,
    resolvedThreadId,
    showToast,
    storeId,
    viewer,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (viewer === "vendor") {
        void loadVendorThreads({ silent: true });
      } else {
        void loadCustomerThreads({ silent: true });
      }
    }, [loadCustomerThreads, loadVendorThreads, viewer]),
  );

  useEffect(() => {
    void bootstrapThread();
  }, [bootstrapThread]);

  useFocusEffect(
    useCallback(() => {
      if (!resolvedThreadId) {
        return;
      }

      let isCancelled = false;
      const hasCachedMessages =
        (messagesByThreadRef.current[resolvedThreadId]?.length ?? 0) > 0;

      const syncMessages = async () => {
        try {
          await loadMessages(resolvedThreadId, { silent: hasCachedMessages });
        } catch (error) {
          if (!isCancelled) {
            setBootstrapError(
              error instanceof Error
                ? error.message
                : "We couldn't load this conversation.",
            );
          }
        }
      };

      void syncMessages();
      return () => {
        isCancelled = true;
      };
    }, [loadMessages, resolvedThreadId]),
  );

  useEffect(() => {
    if (!messages.length && !isSending) {
      return;
    }
    if (!isSending && !isAtBottomRef.current) {
      return;
    }
    const timeoutId = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      50,
    );
    return () => clearTimeout(timeoutId);
  }, [isSending, messages.length]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      const nearBottom = distanceFromBottom < 120;
      isAtBottomRef.current = nearBottom;
      setIsAtBottom((prev) => (prev === nearBottom ? prev : nearBottom));
    },
    [],
  );

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
    isAtBottomRef.current = true;
    setIsAtBottom(true);
  }, []);

  const onSend = async () => {
    if (!resolvedThreadId || (!input.trim() && !pendingImage)) {
      return;
    }

    const textToSend = input.trim();
    const attachmentToSend = pendingImage ?? undefined;
    setInput("");
    setPendingImage(null);

    try {
      await sendMessage(resolvedThreadId, textToSend, attachmentToSend);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "We couldn't send that message.",
      );
    }
  };

  const handlePickPhoto = async () => {
    const result = await pickChatImage();
    if (!result.granted) {
      showToast("Allow photo access to share images in chat.");
      return;
    }
    if (result.tooLarge) {
      showToast("That photo is too large. Try a smaller image.");
      return;
    }
    if (!result.asset) {
      return;
    }
    setPendingImage({
      uri: result.asset.uri,
      name: result.asset.fileName ?? "photo.jpg",
      type: result.asset.mimeType,
    });
  };

  const handleSendVoiceNote = async (uri: string, durationSeconds: number) => {
    if (!resolvedThreadId) {
      return;
    }
    try {
      await sendMessage(resolvedThreadId, "", {
        uri,
        name: "voice-note.m4a",
        type: "audio/m4a",
        durationSeconds,
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "We couldn't send that voice note.");
    }
  };

  const backFallback =
    viewer === "vendor"
      ? ("/vendor/chats" as const)
      : ("/(root)/screens/profileScreens/Account/Chats" as const);

  const headerTitle = thread?.counterpart.name ?? fallbackName;
  const headerSubtitle =
    viewer === "vendor"
      ? thread?.store.title
        ? `Replying as ${thread.store.title}`
        : "Vendor chat"
      : thread?.store.title
        ? `${thread.store.title} on ODOS`
        : "Store chat";

  const headerAvatar =
    viewer === "vendor" && thread?.counterpart.avatarUrl ? (
      <CommerceImage
        source={{ uri: thread.counterpart.avatarUrl }}
        style={chatStyles.headerAvatar}
        contentFit="cover"
        trackingId={`chat-header-avatar-${thread?.id ?? "counterpart"}`}
        recyclingKey={thread.counterpart.avatarUrl}
      />
    ) : thread?.store.imageUrl || thread?.store.imageKey ? (
      <CommerceImage
        source={resolveImageSource(
          thread?.store.imageUrl,
          thread?.store.imageKey,
        )}
        style={chatStyles.headerAvatar}
        contentFit="cover"
        trackingId={`chat-header-store-${thread?.id ?? "store"}`}
        recyclingKey={thread?.store.imageUrl || thread?.store.imageKey || undefined}
      />
    ) : (
      <View style={chatStyles.avatarPlaceholder}>
        <Ionicons
          name={viewer === "vendor" ? "person-outline" : "storefront-outline"}
          size={rMS(20)}
          color={colors.primary}
        />
      </View>
    );

  const emptyState = !resolvedThreadId || (isBootstrapping && !thread);

  return (
    <ChatScreenShell>
      <StatusBar barStyle="dark-content" />

      <ChatScreenHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        onBack={() => goBackOr(router, { fallback: backFallback })}
        connectionState={connectionState}
        avatar={headerAvatar}
      />

      {thread?.product?.title ? (
        <ChatContextCard
          label="Chat context"
          title={thread.product.title}
          subtitle={thread.store.title}
          imageUrl={thread.product.imageUrl}
        />
      ) : null}

      {emptyState ? (
        <ChatLoadingCenter
          label={
            viewer === "vendor"
              ? "Getting your latest shopper messages ready..."
              : "Preparing your store chat..."
          }
        />
      ) : null}

      {!emptyState && bootstrapError ? (
        <View style={chatStyles.errorBanner}>
          <Text style={chatStyles.errorText}>{bootstrapError}</Text>
        </View>
      ) : null}

      {!emptyState ? (
        <View style={{ flex: 1 }}>
          <FlatList
            ref={listRef}
            style={chatStyles.messagesList}
            data={messages}
            keyExtractor={(message) => message.id}
            contentContainerStyle={chatStyles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item, index }) =>
              renderChatMessageItem({
                item,
                index,
                messages,
                currentUserId: user?.id,
                onCopied: showCopyFeedback,
              })
            }
            ListEmptyComponent={
              isLoadingMessages ? (
                <View style={chatStyles.loadingWrap}>
                  <ChatTypingIndicator visible variant="incoming" />
                  <Text style={chatStyles.loadingText}>Loading messages...</Text>
                </View>
              ) : (
                <ChatMessagesEmpty
                  title="No messages yet"
                  description={
                    viewer === "vendor"
                      ? "Reply here when a shopper reaches out."
                      : "Say hello and ask anything about this store or product."
                  }
                />
              )
            }
          />
          <ChatScrollToBottomButton
            visible={!isAtBottom && messages.length > 0}
            onPress={scrollToBottom}
          />
        </View>
      ) : null}

      {viewer === "vendor" ? (
        <ChatQuickReplies
          replies={VENDOR_QUICK_REPLIES}
          disabled={!resolvedThreadId || isBootstrapping || isSending}
          onSelect={(reply) => {
            void handleQuickReply(reply);
          }}
        />
      ) : null}

      <ChatComposer
        hint={
          viewer === "vendor"
            ? "Keep replies clear and helpful so shoppers can continue easily."
            : "Ask about the product, delivery, or availability here."
        }
        placeholder={
          viewer === "vendor" ? "Reply to shopper..." : "Message store..."
        }
        value={input}
        onChangeText={setInput}
        onSend={() => {
          void onSend();
        }}
        disabled={!resolvedThreadId || isBootstrapping}
        isSending={isSending}
        attachmentSupported
        onAttachPress={() => {
          void handlePickPhoto();
        }}
        pendingImageUri={pendingImage?.uri}
        onRemovePendingImage={() => setPendingImage(null)}
        onSendVoiceNote={handleSendVoiceNote}
        onVoiceNoteError={showToast}
      />
      <ChatCopyFeedback visible={copyFeedbackVisible} />
    </ChatScreenShell>
  );
}
