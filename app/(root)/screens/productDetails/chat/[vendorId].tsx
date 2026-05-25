import {
  ChatComposer,
  ChatContextCard,
  ChatLoadingCenter,
  ChatMessagesEmpty,
  chatStyles,
  ChatScreenHeader,
  ChatScreenShell,
  ChatStatusBadge,
  renderChatMessageItem,
} from "@/components/chat/ChatUi";
import { AppColors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useRealtime } from "@/context/RealtimeContext";
import { useToast } from "@/context/ToastContext";
import { rMS } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import { resolveImageSource } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, StatusBar, Text, View } from "react-native";

const getParam = (p: string | string[] | undefined) =>
  Array.isArray(p) ? p[0] : p;

export default function VendorChatScreen() {
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

  const listRef = useRef<FlatList>(null);
  const messagesByThreadRef = useRef(messagesByThread);
  messagesByThreadRef.current = messagesByThread;
  const thread = getThreadById(resolvedThreadId);
  const messages = resolvedThreadId ? messagesByThread[resolvedThreadId] ?? [] : [];
  const isSending = sendingThreadId === resolvedThreadId;
  const isLoadingMessages =
    loadingThreadId === resolvedThreadId &&
    (resolvedThreadId ? (messagesByThread[resolvedThreadId]?.length ?? 0) === 0 : true);

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
        error instanceof Error ? error.message : "We couldn't open the chat yet.";
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
    if (!messages.length) {
      return;
    }
    const timeoutId = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      50,
    );
    return () => clearTimeout(timeoutId);
  }, [messages.length]);

  const onSend = async () => {
    if (!resolvedThreadId || !input.trim()) {
      return;
    }

    try {
      await sendMessage(resolvedThreadId, input.trim());
      setInput("");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "We couldn't send that message.");
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
      <Image
        source={{ uri: thread.counterpart.avatarUrl }}
        style={chatStyles.headerAvatar}
        resizeMode="cover"
      />
    ) : thread?.store.imageUrl || thread?.store.imageKey ? (
      <Image
        source={resolveImageSource(thread?.store.imageUrl, thread?.store.imageKey)}
        style={chatStyles.headerAvatar}
        resizeMode="cover"
      />
    ) : (
      <View style={chatStyles.avatarPlaceholder}>
        <Ionicons
          name={viewer === "vendor" ? "person-outline" : "storefront-outline"}
          size={rMS(20)}
          color={AppColors.primary}
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
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(message) => message.id}
          contentContainerStyle={chatStyles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) =>
            renderChatMessageItem({
              item,
              index,
              messages,
              currentUserId: user?.id,
            })
          }
          ListEmptyComponent={
            isLoadingMessages ? (
              <View style={chatStyles.loadingWrap}>
                <ActivityIndicator size="small" color={AppColors.primary} />
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
      ) : null}

      <ChatComposer
        hint={
          viewer === "vendor"
            ? "Keep replies clear and helpful so shoppers can continue easily."
            : "Ask about the product, delivery, or availability here."
        }
        placeholder={viewer === "vendor" ? "Reply to shopper..." : "Message store..."}
        value={input}
        onChangeText={setInput}
        onSend={() => {
          void onSend();
        }}
        disabled={!resolvedThreadId || isBootstrapping}
        isSending={isSending}
      />
    </ChatScreenShell>
  );
}
