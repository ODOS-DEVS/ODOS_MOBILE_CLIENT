import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import type {
  AssistantAction,
  AssistantMessage,
  AssistantNudge,
  AssistantProduct,
  AssistantStatus,
  AssistantStore,
} from "@/types/assistant";
import { buildAssistantWelcomeMessage } from "@/utils/assistantQuickPrompts";
import { consumeAssistantStream } from "@/utils/assistantStream";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo, useState } from "react";

type AssistantChatApiResponse = {
  reply: string;
  suggested_actions?: { label: string; route: string; params?: Record<string, string> }[];
  escalated_to_support?: boolean;
  conversation_id?: string | null;
  message_id?: string | null;
  products?: AssistantProduct[];
  stores?: AssistantStore[];
};

type AssistantSessionApiResponse = {
  conversation_id?: string | null;
  messages?: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    suggested_actions?: { label: string; route: string; params?: Record<string, string> }[];
    products?: AssistantProduct[];
    stores?: AssistantStore[];
    escalated_to_support?: boolean;
    feedback_rating?: number | null;
    created_at?: string;
  }>;
  nudge?: AssistantNudge | null;
};

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function mapActions(
  items?: { label: string; route: string; params?: Record<string, string> }[],
): AssistantAction[] {
  return (items ?? [])
    .filter((item) => item.label?.trim() && item.route?.trim())
    .map((item) => {
      const action: AssistantAction = {
        label: item.label.trim(),
        route: item.route.trim(),
      };
      if (item.params && Object.keys(item.params).length) {
        action.params = Object.fromEntries(
          Object.entries(item.params)
            .filter(([, value]) => value != null && String(value).trim())
            .map(([key, value]) => [key, String(value).trim()]),
        );
      }
      return action;
    });
}

function mapSessionMessage(item: NonNullable<AssistantSessionApiResponse["messages"]>[number]): AssistantMessage {
  return {
    id: item.id,
    role: item.role,
    content: item.content,
    suggestedActions: mapActions(item.suggested_actions),
    products: item.products,
    stores: item.stores,
    escalatedToSupport: Boolean(item.escalated_to_support),
    feedbackRating: item.feedback_rating ?? null,
    createdAt: item.created_at ? Date.parse(item.created_at) : Date.now(),
  };
}

function buildWelcome(screen?: string, nudge?: AssistantNudge | null): AssistantMessage {
  if (nudge?.message) {
    return {
      id: "welcome",
      role: "assistant",
      content: nudge.message,
      suggestedActions: [
        { label: "Tell me more", route: "/screens/assistant" },
        { label: "Browse deals", route: "/screens/deals" },
      ],
      createdAt: Date.now(),
    };
  }
  return buildAssistantWelcomeMessage(screen);
}

export function useAssistant(screen?: string) {
  const { accessToken } = useAuth();
  const welcomeMessage = useMemo(() => buildWelcome(screen), [screen]);
  const [messages, setMessages] = useState<AssistantMessage[]>([welcomeMessage]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [nudge, setNudge] = useState<AssistantNudge | null>(null);
  const [status, setStatus] = useState<AssistantStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(async () => {
    return accessToken || (await SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY));
  }, [accessToken]);

  const refreshStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const response = await fetch(`${API_BASE_URL}/assistant/status`);
      if (!response.ok) {
        throw new Error("Assistant status unavailable");
      }
      const payload = (await response.json()) as AssistantStatus;
      setStatus(payload);
      setError(null);
    } catch (loadError) {
      setStatus({ enabled: false, provider: "fallback" });
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Assistant status could not be loaded.",
      );
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  const loadSession = useCallback(async () => {
    setIsLoadingSession(true);
    try {
      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const params = new URLSearchParams();
      if (screen) {
        params.set("screen", screen);
      }
      const query = params.toString();
      const response = await fetch(
        `${API_BASE_URL}/assistant/session${query ? `?${query}` : ""}`,
        { headers },
      );
      if (!response.ok) {
        throw new Error("Assistant session unavailable");
      }
      const payload = (await response.json()) as AssistantSessionApiResponse;
      if (payload.conversation_id) {
        setConversationId(payload.conversation_id);
      }
      setNudge(payload.nudge ?? null);
      const restored = (payload.messages ?? []).map(mapSessionMessage);
      if (restored.length > 0) {
        setMessages(restored);
      } else {
        setMessages([buildWelcome(screen, payload.nudge)]);
      }
    } catch {
      setMessages([buildWelcome(screen)]);
    } finally {
      setIsLoadingSession(false);
    }
  }, [getToken, screen]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const sendMessage = useCallback(
    async (rawMessage: string) => {
      const message = rawMessage.trim();
      if (!message || isSending) {
        return;
      }

      const userMessage: AssistantMessage = {
        id: createMessageId(),
        role: "user",
        content: message,
        createdAt: Date.now(),
      };

      setMessages((current) => [...current, userMessage]);
      setIsSending(true);
      setError(null);

      try {
        const token = await getToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const history = [...messages, userMessage]
          .filter((item) => item.id !== "welcome")
          .slice(-10)
          .map((item) => ({
            role: item.role,
            content: item.content,
          }));

        const requestBody = JSON.stringify({
          message,
          history,
          screen: screen ?? null,
          conversation_id: conversationId,
        });

        const streamAssistantId = createMessageId();
        let streamed = false;

        if (status?.enabled) {
          const streamResponse = await fetch(`${API_BASE_URL}/assistant/chat/stream`, {
            method: "POST",
            headers,
            body: requestBody,
          });

          if (streamResponse.ok) {
            setMessages((current) => [
              ...current,
              {
                id: streamAssistantId,
                role: "assistant",
                content: "",
                createdAt: Date.now(),
              },
            ]);

            try {
              streamed = await consumeAssistantStream(streamResponse, {
                onToken: (text) => {
                  setMessages((current) =>
                    current.map((item) =>
                      item.id === streamAssistantId ? { ...item, content: text } : item,
                    ),
                  );
                },
                onDone: (payload) => {
                  if (payload.conversation_id) {
                    setConversationId(payload.conversation_id);
                  }
                  setMessages((current) =>
                    current.map((item) =>
                      item.id === streamAssistantId
                        ? {
                            ...item,
                            id: payload.message_id ?? streamAssistantId,
                            content: payload.reply,
                            suggestedActions: mapActions(payload.suggested_actions),
                            products: payload.products as AssistantProduct[] | undefined,
                            stores: payload.stores as AssistantStore[] | undefined,
                            escalatedToSupport: Boolean(payload.escalated_to_support),
                            feedbackRating: null,
                          }
                        : item,
                    ),
                  );
                },
                onError: (message) => {
                  setError(message);
                },
              });
            } catch {
              streamed = false;
            }

            if (!streamed) {
              setMessages((current) => current.filter((item) => item.id !== streamAssistantId));
            }
          }
        }

        if (streamed) {
          return;
        }

        const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
          method: "POST",
          headers,
          body: requestBody,
        });

        const payload = (await response.json().catch(() => null)) as
          | AssistantChatApiResponse
          | { detail?: string }
          | null;

        if (!response.ok) {
          const detail =
            payload && typeof payload === "object" && "detail" in payload
              ? String(payload.detail)
              : "The assistant could not respond right now.";
          throw new Error(detail);
        }

        const data = payload as AssistantChatApiResponse;
        if (data.conversation_id) {
          setConversationId(data.conversation_id);
        }

        const assistantMessage: AssistantMessage = {
          id: data.message_id ?? createMessageId(),
          role: "assistant",
          content: data.reply,
          suggestedActions: mapActions(data.suggested_actions),
          products: data.products,
          stores: data.stores,
          escalatedToSupport: Boolean(data.escalated_to_support),
          feedbackRating: null,
          createdAt: Date.now(),
        };

        setMessages((current) => [...current, assistantMessage]);
      } catch (sendError) {
        setError(
          sendError instanceof Error
            ? sendError.message
            : "Something went wrong. Please try again.",
        );
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, getToken, isSending, messages, screen, status?.enabled],
  );

  const submitFeedback = useCallback(
    async (messageId: string, rating: number) => {
      if (!messageId || messageId === "welcome") {
        return;
      }
      const token = await getToken();
      if (!token) {
        return;
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === messageId ? { ...item, feedbackRating: rating } : item,
        ),
      );

      try {
        await fetch(`${API_BASE_URL}/assistant/feedback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message_id: messageId,
            rating,
          }),
        });
      } catch {
        // Keep optimistic UI even if feedback fails silently.
      }
    },
    [getToken],
  );

  const resetConversation = useCallback(() => {
    setConversationId(null);
    setMessages([buildWelcome(screen, nudge)]);
    setError(null);
  }, [nudge, screen]);

  return {
    messages,
    status,
    nudge,
    conversationId,
    isLoadingStatus,
    isLoadingSession,
    isSending,
    error,
    sendMessage,
    submitFeedback,
    resetConversation,
    refreshStatus,
    loadSession,
  };
}
