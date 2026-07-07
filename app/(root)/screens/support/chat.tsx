import { AccountActionButton } from "@/components/account/AccountUi";
import {
  ChatComposer,
  useChatStyles,
  ChatLoadingCenter,
  ChatMessagesEmpty,
  ChatScreenHeader,
  ChatScreenShell,
  ChatStatusBadge,
  ChatTypingIndicator,
  getSupportStatusMeta,
  renderChatMessageItem,
} from "@/components/chat/ChatUi";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useRealtime } from "@/context/RealtimeContext";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { updateSupportThreadStatus } from "@/services/chatService";
import { rMS } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { type Href, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function SupportChatScreen() {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const { user, accessToken } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { showToast } = useToast();
  const { connectionState } = useRealtime();
  const {
    ensureSupportThread,
    getThreadById,
    isLoadingSupportThreads,
    loadMessages,
    loadSupportThreads,
    loadingThreadId,
    messagesByThread,
    sendMessage,
    sendingThreadId,
    supportThreads,
  } = useChat();

  const requestedSubject = getParam(params.subject) ?? "";
  const fallback = (getParam(params.fallback) ?? "/(root)/(tabs)/profile") as Href;
  const initialThreadId = getParam(params.threadId) ?? "";

  const [resolvedThreadId, setResolvedThreadId] = useState(initialThreadId);
  const [input, setInput] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const listRef = useRef<FlatList>(null);
  const messagesByThreadRef = useRef(messagesByThread);
  const bootstrapAttemptedRef = useRef(false);
  const viewerRole = useMemo(
    () => (user?.roles.includes("vendor") ? "vendor" : "customer"),
    [user?.roles],
  );

  messagesByThreadRef.current = messagesByThread;

  const thread = getThreadById(resolvedThreadId) ?? supportThreads[0];
  const messages = resolvedThreadId ? messagesByThread[resolvedThreadId] ?? [] : [];
  const isSending = sendingThreadId === resolvedThreadId;
  const isLoadingMessages =
    loadingThreadId === resolvedThreadId && messages.length === 0;
  const statusMeta = getSupportStatusMeta(thread?.supportStatus, viewerRole);

  const showBootstrapLoader =
    !resolvedThreadId &&
    (isBootstrapping || (isLoadingSupportThreads && supportThreads.length === 0));

  useEffect(() => {
    requireAuth({ title: "Sign in to contact support" });
  }, [requireAuth]);

  useEffect(() => {
    if (initialThreadId) {
      setResolvedThreadId(initialThreadId);
    }
  }, [initialThreadId]);

  useEffect(() => {
    if (resolvedThreadId || !supportThreads[0]?.id) {
      return;
    }
    setResolvedThreadId(supportThreads[0].id);
  }, [resolvedThreadId, supportThreads]);

  const bootstrapThread = useCallback(async () => {
    if (!user || resolvedThreadId) {
      return;
    }

    setIsBootstrapping(true);
    setBootstrapError(null);
    try {
      const createdThread = await ensureSupportThread({
        subject:
          requestedSubject ||
          (viewerRole === "vendor"
            ? "Vendor support request"
            : "Customer support request"),
      });
      setResolvedThreadId(createdThread.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "We couldn't open support chat yet.";
      setBootstrapError(message);
      showToast(message);
    } finally {
      setIsBootstrapping(false);
    }
  }, [ensureSupportThread, requestedSubject, resolvedThreadId, showToast, user, viewerRole]);

  useFocusEffect(
    useCallback(() => {
      void loadSupportThreads({
        silent: supportThreads.length > 0 || Boolean(resolvedThreadId),
      });
    }, [loadSupportThreads, resolvedThreadId, supportThreads.length]),
  );

  useEffect(() => {
    if (!user || resolvedThreadId || bootstrapAttemptedRef.current) {
      return;
    }

    if (supportThreads[0]?.id) {
      return;
    }

    bootstrapAttemptedRef.current = true;
    void bootstrapThread();
  }, [bootstrapThread, resolvedThreadId, supportThreads, user]);

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
                : "We couldn't load this support conversation.",
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
    const timeoutId = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      50,
    );
    return () => clearTimeout(timeoutId);
  }, [isSending, messages.length]);

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

  const onMarkResolved = async () => {
    if (!resolvedThreadId || thread?.supportStatus === "resolved") {
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await updateSupportThreadStatus(resolvedThreadId, "resolved", accessToken);
      await loadSupportThreads({ silent: true });
      showToast("Support thread marked as resolved.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't update this support thread.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const headerSubtitle =
    thread?.assignedAdminName
      ? `${thread.assignedAdminName} is handling this thread`
      : viewerRole === "vendor"
        ? "Admin help for stores, payouts, approvals, and operations"
        : "Admin help for orders, payments, account, and delivery";

  const subject = thread?.subject || requestedSubject;

  const authStyles = useMemo(
    () =>
      StyleSheet.create({
        authWrap: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.screen,
          paddingHorizontal: 32,
          gap: 12,
        },
        authTitle: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(16),
          color: colors.text,
          textAlign: "center",
        },
        authText: {
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(20),
          color: colors.textMuted,
          textAlign: "center",
        },
      }),
    [colors],
  );

  if (!user) {
    return (
      <View style={authStyles.authWrap}>
        <Ionicons name="lock-closed-outline" size={rMS(30)} color={colors.textMuted} />
        <Text style={authStyles.authTitle}>Sign in to continue</Text>
        <Text style={authStyles.authText}>
          Support conversations stay attached to your account so the admin team can follow up
          properly.
        </Text>
        <AccountActionButton
          label="Back"
          variant="primary"
          onPress={() => goBackOr(router, { fallback })}
        />
      </View>
    );
  }

  return (
    <ChatScreenShell>
      <StatusBar barStyle="dark-content" />

      <ChatScreenHeader
        title="ODOS Support"
        subtitle={headerSubtitle}
        onBack={() => goBackOr(router, { fallback })}
        connectionState={connectionState}
        avatar={
          <View style={chatStyles.headerAvatarSupport}>
            <Ionicons name="headset-outline" size={rMS(20)} color="#FFFFFF" />
          </View>
        }
        badges={
          thread ? (
            <ChatStatusBadge
              label={statusMeta.label}
              icon={statusMeta.icon}
              backgroundColor={statusMeta.backgroundColor}
              color={statusMeta.color}
            />
          ) : null
        }
      />

      <View style={chatStyles.contextWrap}>
        <View style={chatStyles.contextCard}>
          <View style={chatStyles.headerAvatarSupport}>
            <Ionicons name="shield-checkmark-outline" size={rMS(20)} color="#FFFFFF" />
          </View>
          <View style={chatStyles.contextCopy}>
            <Text style={chatStyles.contextLabel}>Support context</Text>
            <Text style={chatStyles.contextTitle}>
              {subject || "General support conversation"}
            </Text>
            <Text style={chatStyles.contextSub}>{statusMeta.helper}</Text>
            <View style={chatStyles.chipRow}>
              {thread?.assignedAdminName ? (
                <View style={chatStyles.chip}>
                  <Text style={chatStyles.chipText}>
                    Assigned to {thread.assignedAdminName}
                  </Text>
                </View>
              ) : null}
              <View style={chatStyles.chip}>
                <Text style={chatStyles.chipText}>
                  {isLoadingSupportThreads && !thread
                    ? "Checking your latest thread"
                    : thread?.resolvedAt
                      ? "Previously resolved — reply to reopen"
                      : "Conversation stays with your account"}
                </Text>
              </View>
            </View>
            {thread && thread.supportStatus !== "resolved" ? (
              <AccountActionButton
                label={isUpdatingStatus ? "Updating..." : "Mark resolved"}
                variant="secondary"
                disabled={isUpdatingStatus}
                onPress={() => {
                  void onMarkResolved();
                }}
              />
            ) : null}
          </View>
        </View>
      </View>

      {showBootstrapLoader ? (
        <ChatLoadingCenter label="Opening support chat with the ODOS admin team..." />
      ) : null}

      {bootstrapError && !showBootstrapLoader ? (
        <View style={chatStyles.errorBanner}>
          <Text style={chatStyles.errorText}>{bootstrapError}</Text>
        </View>
      ) : null}

      {resolvedThreadId ? (
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
              currentUserId: user.id,
            })
          }
          ListFooterComponent={
            <ChatTypingIndicator visible={isSending} variant="outgoing" label="Sending" />
          }
          ListEmptyComponent={
            isLoadingMessages ? (
              <View style={chatStyles.loadingWrap}>
                <ChatTypingIndicator visible variant="incoming" />
                <Text style={chatStyles.loadingText}>Loading messages...</Text>
              </View>
            ) : (
              <ChatMessagesEmpty
                title="You're connected to support"
                description="Share the issue clearly and we'll keep the conversation here so it's easy to pick up later."
              />
            )
          }
        />
      ) : null}

      <ChatComposer
        hint={
          thread?.supportStatus === "resolved"
            ? "Reply to reopen this thread if you still need help."
            : "Keep the message concise and include any detail the admin team may need next."
        }
        placeholder="Write to admin support..."
        value={input}
        onChangeText={setInput}
        onSend={() => {
          void onSend();
        }}
        disabled={!resolvedThreadId || showBootstrapLoader}
        isSending={isSending}
      />
    </ChatScreenShell>
  );
}
