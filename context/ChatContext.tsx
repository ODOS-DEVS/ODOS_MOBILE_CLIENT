import { useAuth } from "@/context/AuthContext";
import { useRealtime } from "@/context/RealtimeContext";
import {
  createChatMessage,
  deleteChatMessage,
  ensureStoreChatThread,
  ensureSupportChatThread,
  fetchChatMessages,
  fetchChatThreads,
  type ChatAttachmentUpload,
} from "@/services/chatService";
import { classifyFetchError, type FetchErrorKind } from "@/utils/fetchCache";
import type {
  ChatMessage,
  ChatThread,
  ChatThreadScope,
  EnsureChatThreadInput,
  EnsureSupportChatThreadInput,
} from "@/types/chat";
import { resolveApiMediaUrl } from "@/utils/media";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ChatContextType = {
  customerThreads: ChatThread[];
  vendorThreads: ChatThread[];
  supportThreads: ChatThread[];
  messagesByThread: Record<string, ChatMessage[]>;
  isLoadingCustomerThreads: boolean;
  isLoadingVendorThreads: boolean;
  isLoadingSupportThreads: boolean;
  threadsLoadError: string | null;
  threadsLoadErrorKind: FetchErrorKind;
  loadingThreadId: string | null;
  sendingThreadId: string | null;
  loadCustomerThreads: (options?: { silent?: boolean }) => Promise<void>;
  loadVendorThreads: (options?: { silent?: boolean }) => Promise<void>;
  loadSupportThreads: (options?: { silent?: boolean }) => Promise<void>;
  ensureThread: (input: EnsureChatThreadInput) => Promise<ChatThread>;
  ensureSupportThread: (input: EnsureSupportChatThreadInput) => Promise<ChatThread>;
  loadMessages: (
    threadId: string,
    options?: { silent?: boolean },
  ) => Promise<ChatMessage[]>;
  sendMessage: (
    threadId: string,
    text: string,
    attachment?: ChatAttachmentUpload,
  ) => Promise<ChatMessage>;
  deleteMessage: (threadId: string, messageId: string) => Promise<void>;
  getThreadById: (threadId: string | undefined | null) => ChatThread | undefined;
};

type RealtimeChatMessageDeletedPayload = {
  thread_id: string;
  message_id: string;
};

type RealtimeChatThreadPayload = {
  id: string;
  customer_user_id: string;
  vendor_user_id: string;
  thread_type: "store" | "support";
  store: {
    id: string;
    title: string;
    image_key?: string | null;
    image_url?: string | null;
  };
  counterpart: {
    user_id: string;
    name: string;
    avatar_url?: string | null;
    role: "customer" | "vendor" | "admin";
  };
  subject?: string | null;
  product?: {
    id?: string | null;
    title?: string | null;
    image_url?: string | null;
  } | null;
  support_status?: "waiting_on_admin" | "waiting_on_customer" | "resolved" | null;
  assigned_admin_user_id?: string | null;
  assigned_admin_name?: string | null;
  assigned_admin_at?: string | null;
  resolved_at?: string | null;
  last_message_text?: string | null;
  last_message_at?: string | null;
  unread_count?: number;
  created_at: string;
  updated_at: string;
};

type RealtimeChatMessagePayload = {
  id: string;
  thread_id: string;
  sender_user_id: string;
  recipient_user_id: string;
  sender_role: "customer" | "vendor" | "admin";
  body: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
};

type RealtimeChatMessagesReadPayload = {
  thread_id: string;
  reader_user_id: string;
  message_ids: string[];
  read_at: string;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function sortThreads(threads: ChatThread[]) {
  return [...threads].sort((left, right) => {
    const leftTime = new Date(left.lastMessageAt ?? left.updatedAt).getTime();
    const rightTime = new Date(right.lastMessageAt ?? right.updatedAt).getTime();
    return rightTime - leftTime;
  });
}

function upsertThread(threads: ChatThread[], nextThread: ChatThread) {
  const existingIndex = threads.findIndex((thread) => thread.id === nextThread.id);
  if (existingIndex < 0) {
    return sortThreads([nextThread, ...threads]);
  }

  const next = [...threads];
  next[existingIndex] = {
    ...next[existingIndex],
    ...nextThread,
  };
  return sortThreads(next);
}

function updateThreadPreview(
  threads: ChatThread[],
  threadId: string,
  updater: (thread: ChatThread) => ChatThread,
) {
  return sortThreads(
    threads.map((thread) => (thread.id === threadId ? updater(thread) : thread)),
  );
}

function upsertMessage(messages: ChatMessage[], nextMessage: ChatMessage) {
  const existingIndex = messages.findIndex((message) => message.id === nextMessage.id);
  if (existingIndex < 0) {
    return [...messages, nextMessage].sort(
      (left, right) => new Date(left.time).getTime() - new Date(right.time).getTime(),
    );
  }

  const next = [...messages];
  next[existingIndex] = nextMessage;
  return next.sort(
    (left, right) => new Date(left.time).getTime() - new Date(right.time).getTime(),
  );
}

function mapRealtimeThread(payload: RealtimeChatThreadPayload): ChatThread {
  return {
    id: payload.id,
    customerUserId: payload.customer_user_id,
    vendorUserId: payload.vendor_user_id,
    threadType: payload.thread_type,
    store: {
      id: payload.store.id,
      title: payload.store.title,
      imageKey: payload.store.image_key ?? undefined,
      imageUrl:
        resolveApiMediaUrl(payload.store.image_url) ??
        payload.store.image_url ??
        undefined,
    },
    counterpart: {
      userId: payload.counterpart.user_id,
      name: payload.counterpart.name,
      avatarUrl:
        resolveApiMediaUrl(payload.counterpart.avatar_url) ??
        payload.counterpart.avatar_url ??
        undefined,
      role: payload.counterpart.role,
    },
    subject: payload.subject ?? undefined,
    product: payload.product
      ? {
          id: payload.product.id ?? undefined,
          title: payload.product.title ?? undefined,
          imageUrl:
            resolveApiMediaUrl(payload.product.image_url) ??
            payload.product.image_url ??
            undefined,
        }
      : undefined,
    supportStatus: payload.support_status ?? undefined,
    assignedAdminUserId: payload.assigned_admin_user_id ?? undefined,
    assignedAdminName: payload.assigned_admin_name ?? undefined,
    assignedAdminAt: payload.assigned_admin_at ?? undefined,
    resolvedAt: payload.resolved_at ?? undefined,
    lastMessageText: payload.last_message_text ?? undefined,
    lastMessageAt: payload.last_message_at ?? undefined,
    unreadCount: payload.unread_count ?? 0,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
}

function mapRealtimeMessage(payload: RealtimeChatMessagePayload): ChatMessage {
  return {
    id: payload.id,
    threadId: payload.thread_id,
    senderUserId: payload.sender_user_id,
    recipientUserId: payload.recipient_user_id,
    senderRole: payload.sender_role,
    text: payload.body,
    isRead: payload.is_read,
    readAt: payload.read_at ?? undefined,
    time: payload.created_at,
  };
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuth();
  const { subscribe } = useRealtime();
  const [customerThreads, setCustomerThreads] = useState<ChatThread[]>([]);
  const [vendorThreads, setVendorThreads] = useState<ChatThread[]>([]);
  const [supportThreads, setSupportThreads] = useState<ChatThread[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, ChatMessage[]>>({});
  const [isLoadingCustomerThreads, setIsLoadingCustomerThreads] = useState(false);
  const [isLoadingVendorThreads, setIsLoadingVendorThreads] = useState(false);
  const [isLoadingSupportThreads, setIsLoadingSupportThreads] = useState(false);
  const [threadsLoadError, setThreadsLoadError] = useState<string | null>(null);
  const [threadsLoadErrorKind, setThreadsLoadErrorKind] = useState<FetchErrorKind>("unknown");
  const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null);
  const [sendingThreadId, setSendingThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      return;
    }

    setCustomerThreads([]);
    setVendorThreads([]);
    setSupportThreads([]);
    setMessagesByThread({});
    setIsLoadingCustomerThreads(false);
    setIsLoadingVendorThreads(false);
    setIsLoadingSupportThreads(false);
    setThreadsLoadError(null);
    setLoadingThreadId(null);
    setSendingThreadId(null);
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribeThread = subscribe("chat.thread.updated", (event) => {
      const rawThread = event.payload as RealtimeChatThreadPayload | undefined;
      if (!rawThread?.id) {
        return;
      }
      const nextThread = mapRealtimeThread(rawThread);

      if (nextThread.threadType === "support") {
        if (nextThread.customerUserId === user.id || nextThread.vendorUserId === user.id) {
          setSupportThreads((current) => upsertThread(current, nextThread));
        }
        return;
      }

      if (nextThread.customerUserId === user.id) {
        setCustomerThreads((current) => upsertThread(current, nextThread));
      }
      if (nextThread.vendorUserId === user.id) {
        setVendorThreads((current) => upsertThread(current, nextThread));
      }
    });

    const unsubscribeMessage = subscribe("chat.message.created", (event) => {
      const rawMessage = event.payload as RealtimeChatMessagePayload | undefined;
      if (!rawMessage?.id || !rawMessage.thread_id) {
        return;
      }
      const nextMessage = mapRealtimeMessage(rawMessage);

      setMessagesByThread((current) => ({
        ...current,
        [nextMessage.threadId]: upsertMessage(current[nextMessage.threadId] ?? [], nextMessage),
      }));
    });

    const unsubscribeRead = subscribe("chat.messages.read", (event) => {
      const payload = event.payload as RealtimeChatMessagesReadPayload | undefined;
      if (!payload?.thread_id || !payload.message_ids?.length) {
        return;
      }

      const messageIdSet = new Set(payload.message_ids);
      setMessagesByThread((current) => {
        const existing = current[payload.thread_id];
        if (!existing?.length) {
          return current;
        }

        return {
          ...current,
          [payload.thread_id]: existing.map((message) =>
            messageIdSet.has(message.id)
              ? {
                  ...message,
                  isRead: true,
                  readAt: payload.read_at,
                }
              : message,
          ),
        };
      });
    });

    const unsubscribeMessageDeleted = subscribe("chat.message.deleted", (event) => {
      const payload = event.payload as RealtimeChatMessageDeletedPayload | undefined;
      if (!payload?.thread_id || !payload.message_id) {
        return;
      }

      setMessagesByThread((current) => {
        const existing = current[payload.thread_id];
        if (!existing?.length) {
          return current;
        }
        return {
          ...current,
          [payload.thread_id]: existing.filter((message) => message.id !== payload.message_id),
        };
      });
    });

    return () => {
      unsubscribeThread();
      unsubscribeMessage();
      unsubscribeRead();
      unsubscribeMessageDeleted();
    };
  }, [subscribe, user]);

  const loadThreadsForScope = useCallback(
    async (scope: ChatThreadScope, options?: { silent?: boolean }) => {
      if (!user) {
        if (scope === "vendor") {
          setVendorThreads([]);
        } else if (scope === "support") {
          setSupportThreads([]);
        } else {
          setCustomerThreads([]);
        }
        return;
      }

      const showLoading = !options?.silent;
      if (showLoading) {
        if (scope === "vendor") {
          setIsLoadingVendorThreads(true);
        } else if (scope === "support") {
          setIsLoadingSupportThreads(true);
        } else {
          setIsLoadingCustomerThreads(true);
        }
      }

      try {
        const threads = await fetchChatThreads(scope, accessToken);
        if (scope === "vendor") {
          setVendorThreads(threads);
        } else if (scope === "support") {
          setSupportThreads(threads);
        } else {
          setCustomerThreads(threads);
        }
        setThreadsLoadError(null);
      } catch (caughtError) {
        if (showLoading) {
          setThreadsLoadError("We couldn't load your conversations right now.");
          setThreadsLoadErrorKind(classifyFetchError(caughtError));
        }
      } finally {
        if (showLoading) {
          if (scope === "vendor") {
            setIsLoadingVendorThreads(false);
          } else if (scope === "support") {
            setIsLoadingSupportThreads(false);
          } else {
            setIsLoadingCustomerThreads(false);
          }
        }
      }
    },
    [accessToken, user],
  );

  const loadCustomerThreads = useCallback(async (options?: { silent?: boolean }) => {
    await loadThreadsForScope("customer", options);
  }, [loadThreadsForScope]);

  const loadVendorThreads = useCallback(async (options?: { silent?: boolean }) => {
    await loadThreadsForScope("vendor", options);
  }, [loadThreadsForScope]);

  const loadSupportThreads = useCallback(async (options?: { silent?: boolean }) => {
    await loadThreadsForScope("support", options);
  }, [loadThreadsForScope]);

  const ensureThread = useCallback(
    async (input: EnsureChatThreadInput) => {
      const thread = await ensureStoreChatThread(input, accessToken);
      setCustomerThreads((current) => upsertThread(current, thread));
      return thread;
    },
    [accessToken],
  );

  const ensureSupportThread = useCallback(
    async (input: EnsureSupportChatThreadInput) => {
      const thread = await ensureSupportChatThread(input, accessToken);
      setSupportThreads((current) => upsertThread(current, thread));
      return thread;
    },
    [accessToken],
  );

  const resetUnreadCount = useCallback((threads: ChatThread[], threadId: string) => {
    return updateThreadPreview(threads, threadId, (thread) => ({
      ...thread,
      unreadCount: 0,
    }));
  }, []);

  const loadMessages = useCallback(
    async (threadId: string, options?: { silent?: boolean }) => {
      if (!threadId) {
        return [];
      }

      const showLoading = !options?.silent;
      if (showLoading) {
        setLoadingThreadId(threadId);
      }

      try {
        const messages = await fetchChatMessages(threadId, accessToken);
        setMessagesByThread((current) => ({
          ...current,
          [threadId]: messages,
        }));
        setCustomerThreads((current) => resetUnreadCount(current, threadId));
        setVendorThreads((current) => resetUnreadCount(current, threadId));
        setSupportThreads((current) => resetUnreadCount(current, threadId));
        return messages;
      } finally {
        if (showLoading) {
          setLoadingThreadId((current) => (current === threadId ? null : current));
        }
      }
    },
    [accessToken, resetUnreadCount],
  );

  const sendMessage = useCallback(
    async (threadId: string, text: string, attachment?: ChatAttachmentUpload) => {
      const trimmed = text.trim();
      if (!threadId || (!trimmed && !attachment)) {
        throw new Error("Add a message or an attachment before sending.");
      }
      if (!user) {
        throw new Error("You need to be signed in to send a message.");
      }

      // Render the message immediately using the local attachment URI, rather than
      // waiting for the upload + API round trip — the pending bubble itself (with its
      // own spinner) is the "sending" state, so no separate typing-dots placeholder needed.
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        threadId,
        senderUserId: user.id,
        recipientUserId: "",
        senderRole: (user.role === "vendor" || user.role === "admin"
          ? user.role
          : "customer") as ChatMessage["senderRole"],
        text: trimmed,
        attachmentUrl: attachment?.uri ?? null,
        attachmentType: attachment
          ? typeof attachment.durationSeconds === "number"
            ? "audio"
            : attachment.type?.startsWith("image/")
              ? "image"
              : "file"
          : null,
        attachmentName: attachment?.name ?? null,
        attachmentDurationSeconds: attachment?.durationSeconds ?? null,
        isRead: false,
        time: new Date().toISOString(),
        status: "sending",
      };

      setSendingThreadId(threadId);
      setMessagesByThread((current) => ({
        ...current,
        [threadId]: upsertMessage(current[threadId] ?? [], optimisticMessage),
      }));

      try {
        const message = await createChatMessage(threadId, trimmed, accessToken, attachment);
        setMessagesByThread((current) => {
          const withoutOptimistic = (current[threadId] ?? []).filter((m) => m.id !== tempId);
          return {
            ...current,
            [threadId]: upsertMessage(withoutOptimistic, message),
          };
        });
        const previewUpdate = (thread: ChatThread) => ({
          ...thread,
          lastMessageText:
            message.text ||
            (message.attachmentType === "image"
              ? "📷 Photo"
              : message.attachmentType === "audio"
                ? "🎤 Voice message"
                : message.attachmentType === "file"
                  ? `📎 ${message.attachmentName ?? "File"}`
                  : ""),
          lastMessageAt: message.time,
        });
        setCustomerThreads((current) => updateThreadPreview(current, threadId, previewUpdate));
        setVendorThreads((current) => updateThreadPreview(current, threadId, previewUpdate));
        setSupportThreads((current) => updateThreadPreview(current, threadId, previewUpdate));
        return message;
      } catch (error) {
        setMessagesByThread((current) => ({
          ...current,
          [threadId]: (current[threadId] ?? []).map((m) =>
            m.id === tempId ? { ...m, status: "failed" as const } : m,
          ),
        }));
        throw error;
      } finally {
        setSendingThreadId((current) => (current === threadId ? null : current));
      }
    },
    [accessToken, user],
  );

  const deleteMessage = useCallback(
    async (threadId: string, messageId: string) => {
      const isLocalOnly = messageId.startsWith("temp-");
      let removedMessage: ChatMessage | undefined;

      setMessagesByThread((current) => {
        const existing = current[threadId] ?? [];
        removedMessage = existing.find((m) => m.id === messageId);
        return {
          ...current,
          [threadId]: existing.filter((m) => m.id !== messageId),
        };
      });

      // A message that never made it past the optimistic "sending"/"failed" state was
      // never persisted server-side, so there's nothing to delete remotely.
      if (isLocalOnly || !removedMessage) {
        return;
      }

      try {
        await deleteChatMessage(messageId, accessToken);
      } catch (error) {
        const messageToRestore = removedMessage;
        setMessagesByThread((current) => ({
          ...current,
          [threadId]: upsertMessage(current[threadId] ?? [], messageToRestore),
        }));
        throw error;
      }
    },
    [accessToken],
  );

  const getThreadById = useCallback(
    (threadId: string | undefined | null) =>
      [...customerThreads, ...vendorThreads, ...supportThreads].find(
        (thread) => thread.id === threadId,
      ),
    [customerThreads, supportThreads, vendorThreads],
  );

  const value = useMemo<ChatContextType>(
    () => ({
      customerThreads,
      vendorThreads,
      supportThreads,
      messagesByThread,
      isLoadingCustomerThreads,
      isLoadingVendorThreads,
      isLoadingSupportThreads,
      threadsLoadError,
      threadsLoadErrorKind,
      loadingThreadId,
      sendingThreadId,
      loadCustomerThreads,
      loadVendorThreads,
      loadSupportThreads,
      ensureThread,
      ensureSupportThread,
      loadMessages,
      sendMessage,
      deleteMessage,
      getThreadById,
    }),
    [
      customerThreads,
      deleteMessage,
      ensureSupportThread,
      ensureThread,
      getThreadById,
      isLoadingCustomerThreads,
      isLoadingSupportThreads,
      isLoadingVendorThreads,
      loadCustomerThreads,
      loadMessages,
      loadSupportThreads,
      loadVendorThreads,
      loadingThreadId,
      messagesByThread,
      sendMessage,
      sendingThreadId,
      supportThreads,
      threadsLoadError,
      threadsLoadErrorKind,
      vendorThreads,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
}
