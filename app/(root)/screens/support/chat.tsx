import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useRealtime } from "@/context/RealtimeContext";
import { useToast } from "@/context/ToastContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { ChatMessage, SupportChatStatus } from "@/types/chat";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const isSameDay = (a: number, b: number) => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

const formatMessageTime = (time: number) =>
  new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDayLabel = (time: number) => {
  const d = new Date(time);
  const now = new Date();
  if (isSameDay(d.getTime(), now.getTime())) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d.getTime(), yesterday.getTime())) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
};

const getConnectionMeta = (
  connectionState: "disconnected" | "connecting" | "connected",
) => {
  if (connectionState === "connected") {
    return {
      label: "Live",
      icon: "wifi-outline" as const,
      tone: "#DCFCE7",
      text: "#166534",
    };
  }
  if (connectionState === "connecting") {
    return {
      label: "Reconnecting",
      icon: "sync-outline" as const,
      tone: "#FEF3C7",
      text: "#92400E",
    };
  }
  return {
    label: "Offline",
    icon: "cloud-offline-outline" as const,
    tone: "#FEE2E2",
    text: "#B91C1C",
  };
};

const getSupportStatusMeta = (
  status: SupportChatStatus | null | undefined,
  viewerRole: "vendor" | "customer",
) => {
  if (status === "resolved") {
    return {
      label: "Resolved",
      icon: "checkmark-circle-outline" as const,
      tone: "#DCFCE7",
      text: "#166534",
      helper: "Reply to this thread any time if you need it reopened.",
    };
  }

  if (status === "waiting_on_customer") {
    return {
      label: viewerRole === "vendor" ? "Waiting on you" : "Waiting on you",
      icon: "person-outline" as const,
      tone: "#DBEAFE",
      text: "#1D4ED8",
      helper: "The ODOS team has responded. Send the next detail to continue.",
    };
  }

  return {
    label: "Waiting on admin",
    icon: "time-outline" as const,
    tone: "#FEF3C7",
    text: "#92400E",
    helper: "Your thread is in the admin queue. We’ll reply here when ready.",
  };
};

export default function SupportChatScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
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
  const fallback = (getParam(params.fallback) ?? "/(root)/(tabs)/profile") as any;
  const initialThreadId = getParam(params.threadId) ?? "";

  const [resolvedThreadId, setResolvedThreadId] = useState(initialThreadId);
  const [input, setInput] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const listRef = useRef<FlatList>(null);
  const thread = getThreadById(resolvedThreadId) ?? supportThreads[0];
  const messages = resolvedThreadId ? messagesByThread[resolvedThreadId] ?? [] : [];
  const isSending = sendingThreadId === resolvedThreadId;
  const isLoadingMessages = loadingThreadId === resolvedThreadId;
  const viewerRole = user?.roles.includes("vendor") ? "vendor" : "customer";
  const connectionMeta = getConnectionMeta(connectionState);
  const statusMeta = getSupportStatusMeta(thread?.supportStatus, viewerRole);

  useEffect(() => {
    requireAuth({ title: "Sign in to contact support" });
  }, [requireAuth]);

  useEffect(() => {
    if (initialThreadId && initialThreadId !== resolvedThreadId) {
      setResolvedThreadId(initialThreadId);
    }
  }, [initialThreadId, resolvedThreadId]);

  const bootstrapThread = useCallback(async () => {
    if (!user) {
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
  }, [ensureSupportThread, requestedSubject, showToast, user, viewerRole]);

  useFocusEffect(
    useCallback(() => {
      void loadSupportThreads();
    }, [loadSupportThreads]),
  );

  useEffect(() => {
    if (!user || resolvedThreadId) {
      return;
    }
    void bootstrapThread();
  }, [bootstrapThread, resolvedThreadId, user]);

  useEffect(() => {
    if (!resolvedThreadId && supportThreads[0]?.id) {
      setResolvedThreadId(supportThreads[0].id);
    }
  }, [resolvedThreadId, supportThreads]);

  useFocusEffect(
    useCallback(() => {
      if (!resolvedThreadId) {
        return;
      }

      let isCancelled = false;
      const syncMessages = async () => {
        try {
          await loadMessages(resolvedThreadId);
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
    if (!messages.length) return;
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

  const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUserMessage = item.senderUserId === user?.id;
    const itemTime = new Date(item.time).getTime();
    const prev = messages[index - 1];
    const next = messages[index + 1];
    const prevTime = prev ? new Date(prev.time).getTime() : 0;
    const nextTime = next ? new Date(next.time).getTime() : 0;
    const showDay = !prev || !isSameDay(prevTime, itemTime);
    const nextSameSender = next?.senderUserId === item.senderUserId;
    const nextCloseInTime = next ? Math.abs(nextTime - itemTime) < 6 * 60 * 1000 : false;
    const showMeta = !nextSameSender || !nextCloseInTime;

    return (
      <>
        {showDay ? (
          <View className="items-center py-3">
            <View className="bg-black/5 px-3 py-1 rounded-full">
              <Text style={{ fontFamily: Fonts.text }} className="text-xs text-gray-700">
                {formatDayLabel(itemTime)}
              </Text>
            </View>
          </View>
        ) : null}

        <View className={`flex-row ${isUserMessage ? "justify-end" : "justify-start"} px-4 py-1.5`}>
          <View
            className={`${isUserMessage ? "shadow-sm" : "border border-gray-200"}`}
            style={{
              maxWidth: "79%",
              backgroundColor: isUserMessage ? Colors.primary : "#FFFFFF",
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: isUserMessage ? 16 : 6,
              borderBottomRightRadius: isUserMessage ? 6 : 16,
            }}
          >
            <Text
              style={{
                color: isUserMessage ? "#FFFFFF" : "#111827",
                fontFamily: Fonts.text,
                fontSize: 14,
                lineHeight: 18,
              }}
            >
              {item.text}
            </Text>

            {showMeta ? (
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 10,
                  color: isUserMessage ? "rgba(255,255,255,0.85)" : "#9CA3AF",
                  textAlign: "right",
                  fontFamily: Fonts.textLight,
                }}
              >
                {formatMessageTime(itemTime)}
                {isUserMessage && item.isRead ? " · Seen" : ""}
              </Text>
            ) : null}
          </View>
        </View>
      </>
    );
  };

  const headerTitle = "ODOS Support";
  const headerSubtitle =
    thread?.assignedAdminName
      ? `${thread.assignedAdminName} is handling this thread`
      : viewerRole === "vendor"
        ? "Admin help for stores, payouts, approvals, and operations"
        : "Admin help for orders, payments, account, and delivery";
  const subject = thread?.subject || requestedSubject;
  const emptyState = !resolvedThreadId || isBootstrapping;

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F7FA] px-8">
        <Ionicons name="lock-closed-outline" size={30} color="#6B7280" />
        <Text className="mt-4 text-base font-semibold text-gray-900">
          Sign in to continue
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          Support conversations stay attached to your account so the admin team can follow up properly.
        </Text>
        <TouchableOpacity
          onPress={() => goBackOr(router, { fallback })}
          activeOpacity={0.8}
          className="mt-6 rounded-full bg-black px-5 py-3"
        >
          <Text className="text-white" style={{ fontFamily: Fonts.textBold }}>
            Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#F5F7FA]"
    >
      <StatusBar barStyle="dark-content" />

      <View
        className="bg-white border-b border-gray-200"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
      >
        <View className="flex-row items-center px-4">
          <TouchableOpacity
            onPress={() => goBackOr(router, { fallback })}
            className="w-10 h-10 bg-black/10 rounded-full items-center justify-center mr-3"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>

          <View className="w-10 h-10 rounded-full mr-3 bg-black items-center justify-center">
            <Ionicons name="headset-outline" size={20} color="#FFFFFF" />
          </View>

          <View className="flex-1">
            <Text className="text-lg font-montserrat-semiBold text-gray-900">
              {headerTitle}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">{headerSubtitle}</Text>
            <View className="flex-row items-center gap-2 mt-2">
              <View
                style={{
                  alignSelf: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: connectionMeta.tone,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 999,
                }}
              >
                <Ionicons
                  name={connectionMeta.icon}
                  size={12}
                  color={connectionMeta.text}
                />
                <Text
                  style={{
                    color: connectionMeta.text,
                    fontSize: 11,
                    fontFamily: Fonts.textBold,
                  }}
                >
                  {connectionMeta.label}
                </Text>
              </View>

              {thread ? (
                <View
                  style={{
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: statusMeta.tone,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 999,
                  }}
                >
                  <Ionicons name={statusMeta.icon} size={12} color={statusMeta.text} />
                  <Text
                    style={{
                      color: statusMeta.text,
                      fontSize: 11,
                      fontFamily: Fonts.textBold,
                    }}
                  >
                    {statusMeta.label}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      <View className="px-4 pt-3">
        <View className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
          <Text className="text-[11px] uppercase tracking-[0.6px] text-gray-500 mb-1">
            Support context
          </Text>
          <Text className="text-sm font-semibold text-gray-900">
            {subject || "General support conversation"}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">{statusMeta.helper}</Text>
          <View className="flex-row flex-wrap gap-2 mt-3">
            {thread?.assignedAdminName ? (
              <View className="rounded-full bg-black/5 px-3 py-1.5">
                <Text className="text-[11px] text-gray-700">
                  Assigned to {thread.assignedAdminName}
                </Text>
              </View>
            ) : null}
            <View className="rounded-full bg-black/5 px-3 py-1.5">
              <Text className="text-[11px] text-gray-700">
                {isLoadingSupportThreads && !thread
                  ? "Checking your latest thread"
                  : thread?.resolvedAt
                    ? `Resolved ${formatDayLabel(new Date(thread.resolvedAt).getTime())}`
                    : "Conversation stays with your account"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {emptyState ? (
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="text-base font-semibold text-gray-900 mt-4">
            Opening support chat
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            We’re preparing your conversation with the ODOS admin team.
          </Text>
        </View>
      ) : null}

      {!emptyState && bootstrapError ? (
        <View className="mx-4 mt-4 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <Text className="text-sm text-red-700">{bootstrapError}</Text>
        </View>
      ) : null}

      {!emptyState ? (
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            isLoadingMessages ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text className="text-sm text-gray-500 mt-3">Loading messages...</Text>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center py-20 px-10">
                <Text className="text-base font-semibold text-gray-900">
                  You’re connected to support
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-2">
                  Share the issue clearly and we’ll keep the conversation here so it feels easy to pick up later.
                </Text>
              </View>
            )
          }
        />
      ) : null}

      <View
        className="px-4 pt-3 border-t border-gray-200 bg-white"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <Text
          style={{
            fontFamily: Fonts.textLight,
            color: "#6B7280",
            fontSize: 11,
            marginBottom: 6,
            paddingHorizontal: 4,
          }}
        >
          {thread?.supportStatus === "resolved"
            ? "Reply to reopen this thread if you still need help."
            : "Keep the message concise and include any detail the admin team may need next."}
        </Text>
        <View className="flex-row items-end gap-3">
          <View className="flex-1 bg-gray-100 rounded-[24px] px-3.5 py-2 border border-gray-200">
            <TextInput
              placeholder="Write to admin support..."
              value={input}
              onChangeText={setInput}
              style={{
                maxHeight: 110,
                padding: 0,
                fontFamily: Fonts.text,
                fontSize: 14,
                lineHeight: 18,
                color: "#111827",
              }}
              multiline
              editable={Boolean(resolvedThreadId) && !isBootstrapping}
            />
          </View>

          <Pressable
            onPress={() => {
              void onSend();
            }}
            disabled={!input.trim() || !resolvedThreadId || isSending}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              input.trim() && resolvedThreadId && !isSending ? "bg-black" : "bg-black/20"
            }`}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={16} color="#fff" />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
