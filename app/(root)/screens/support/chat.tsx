import { AccountActionButton } from "@/components/account/AccountUi";
import {
  ChatComposer,
  chatStyles,
  ChatLoadingCenter,
  ChatMessagesEmpty,
  ChatScreenHeader,
  ChatScreenShell,
  ChatStatusBadge,
  getSupportStatusMeta,
  renderChatMessageItem,
} from "@/components/chat/ChatUi";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useRealtime } from "@/context/RealtimeContext";
import { useToast } from "@/context/ToastContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rMS } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function SupportChatScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
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
  const fallback = (getParam(params.fallback) ?? "/(root)/(tabs)/profile") as const;
  const initialThreadId = getParam(params.threadId) ?? "";

  const [resolvedThreadId, setResolvedThreadId] = useState(initialThreadId);
  const [input, setInput] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

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

  const headerSubtitle =
    thread?.assignedAdminName
      ? `${thread.assignedAdminName} is handling this thread`
      : viewerRole === "vendor"
        ? "Admin help for stores, payouts, approvals, and operations"
        : "Admin help for orders, payments, account, and delivery";

  const subject = thread?.subject || requestedSubject;

  if (!user) {
    return (
      <View style={styles.authWrap}>
        <Ionicons name="lock-closed-outline" size={rMS(30)} color="#6B7280" />
        <Text style={styles.authTitle}>Sign in to continue</Text>
        <Text style={styles.authText}>
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
          ListEmptyComponent={
            isLoadingMessages ? (
              <View style={chatStyles.loadingWrap}>
                <ActivityIndicator size="small" color={AppColors.primary} />
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

const styles = StyleSheet.create({
  authWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 32,
    gap: 12,
  },
  authTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
    textAlign: "center",
  },
  authText: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    color: "#6B7280",
    textAlign: "center",
    lineHeight: rMS(20),
  },
});
