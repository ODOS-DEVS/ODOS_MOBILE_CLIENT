import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import type {
  AssistantAction,
  AssistantMessage,
  AssistantNudge,
  AssistantProduct,
  AssistantReferenceContext,
  AssistantStatus,
  AssistantStore,
} from "@/types/assistant";
import { buildAssistantWelcomeMessage } from "@/utils/assistantQuickPrompts";
import { consumeAssistantStream } from "@/utils/assistantStream";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  context?: AssistantReferenceContext | null;
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

function buildWelcome(
  screen?: string,
  nudge?: AssistantNudge | null,
  context?: AssistantReferenceContext | null,
): AssistantMessage {
  if (nudge?.message) {
    const storeActions: AssistantAction[] = [];
    if (context?.store_id) {
      storeActions.push({
        label: "Open store",
        route: "/screens/stores/[id]",
        params: {
          id: context.store_id,
          ...(context.store_name ? { title: context.store_name } : {}),
        },
      });
    }
    return {
      id: "welcome",
      role: "assistant",
      content: nudge.message,
      suggestedActions: [
        ...storeActions,
        { label: "Tell me more", route: "/screens/assistant" },
        { label: "Browse deals", route: "/screens/deals" },
      ].slice(0, 3),
      createdAt: Date.now(),
    };
  }
  return buildAssistantWelcomeMessage(screen, context);
}

export function useAssistant(
  screen?: string,
  referenceContext?: AssistantReferenceContext | null,
) {
  const { accessToken } = useAuth();
  const [activeContext, setActiveContext] = useState<AssistantReferenceContext | null>(
    referenceContext ?? null,
  );
  const welcomeMessage = useMemo(
    () => buildWelcome(screen, null, referenceContext),
    [referenceContext, screen],
  );
  const [messages, setMessages] = useState<AssistantMessage[]>([welcomeMessage]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [nudge, setNudge] = useState<AssistantNudge | null>(null);
  const [status, setStatus] = useState<AssistantStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessageId, setFailedMessageId] = useState<string | null>(null);
  // Tracks every in-flight send's AbortController so a screen navigation away
  // mid-request can cancel it — otherwise a request can keep running after the
  // user leaves, and its fallback-on-failure logic could resubmit the same
  // message as a brand-new turn once nothing is around to render the result.
  const inFlightRequestsRef = useRef<Set<AbortController>>(new Set());

  useEffect(() => {
    const inFlight = inFlightRequestsRef.current;
    return () => {
      inFlight.forEach((controller) => controller.abort());
      inFlight.clear();
    };
  }, []);

  useEffect(() => {
    setActiveContext(referenceContext ?? null);
  }, [referenceContext]);

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
      if (referenceContext?.type === "product" && referenceContext.product_id) {
        params.set("product_id", referenceContext.product_id);
        if (referenceContext.product_title) {
          params.set("product_title", referenceContext.product_title);
        }
        if (referenceContext.store_id) {
          params.set("store_id", referenceContext.store_id);
        }
        if (referenceContext.store_name) {
          params.set("store_name", referenceContext.store_name);
        }
        if (referenceContext.category) {
          params.set("category", referenceContext.category);
        }
      } else if (referenceContext?.type === "checkout") {
        params.set("context_type", "checkout");
      } else if (referenceContext?.store_id) {
        params.set("store_id", referenceContext.store_id);
        if (referenceContext.store_name) {
          params.set("store_name", referenceContext.store_name);
        }
        if (referenceContext.market_title) {
          params.set("market_title", referenceContext.market_title);
        }
        if (referenceContext.vendor_user_id) {
          params.set("vendor_user_id", referenceContext.vendor_user_id);
        }
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
      const resolvedContext = payload.context ?? referenceContext ?? null;
      setActiveContext(resolvedContext);
      setNudge(payload.nudge ?? null);
      const restored = (payload.messages ?? []).map(mapSessionMessage);
      if (restored.length > 0) {
        setMessages(restored);
      } else {
        setMessages([buildWelcome(screen, payload.nudge, resolvedContext)]);
      }
    } catch {
      setMessages([buildWelcome(screen, null, referenceContext)]);
    } finally {
      setIsLoadingSession(false);
    }
  }, [getToken, referenceContext, screen]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const performSend = useCallback(
    async (outgoingUserMessage: AssistantMessage, historyMessages: AssistantMessage[]) => {
      const message = outgoingUserMessage.content;
      setIsSending(true);
      setError(null);
      setFailedMessageId(null);

      const controller = new AbortController();
      inFlightRequestsRef.current.add(controller);
      const isAbortError = (value: unknown) =>
        value instanceof Error && value.name === "AbortError";
      const markFailed = () => {
        setMessages((current) =>
          current.map((item) =>
            item.id === outgoingUserMessage.id ? { ...item, failed: true } : item,
          ),
        );
        setFailedMessageId(outgoingUserMessage.id);
      };

      try {
        const token = await getToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const history = [...historyMessages, outgoingUserMessage]
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
          context: activeContext ?? referenceContext ?? null,
        });

        const streamAssistantId = createMessageId();
        let streamed = false;
        // Tracks whether the backend ever accepted (200'd) the streaming
        // request — once true, the server has started (or finished)
        // processing this exact message, so a broken connection from here on
        // must NOT be silently retried as a brand-new message via the
        // non-streaming endpoint below. That used to cause the same user text
        // to be submitted twice — once via the interrupted stream, once via
        // the "fallback" — leaving an orphaned duplicate with no reply
        // whenever the second attempt also didn't make it back to the screen
        // (e.g. the user had already navigated away).
        let streamRequestAccepted = false;

        if (status?.enabled) {
          let streamResponse: Response | null = null;
          try {
            streamResponse = await fetch(`${API_BASE_URL}/assistant/chat/stream`, {
              method: "POST",
              headers,
              body: requestBody,
              signal: controller.signal,
            });
          } catch (connectError) {
            if (isAbortError(connectError)) {
              return;
            }
            streamResponse = null;
          }

          if (streamResponse?.ok) {
            streamRequestAccepted = true;
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
            } catch (streamError) {
              if (isAbortError(streamError)) {
                return;
              }
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

        if (streamRequestAccepted) {
          // The server already started this exact turn once — ask the user
          // to explicitly retry rather than silently resubmitting it.
          setError("The connection dropped while the assistant was replying. Tap to retry.");
          markFailed();
          return;
        }

        const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
          method: "POST",
          headers,
          body: requestBody,
          signal: controller.signal,
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
        if (isAbortError(sendError)) {
          return;
        }
        setError(
          sendError instanceof Error
            ? sendError.message
            : "Something went wrong. Please try again.",
        );
        markFailed();
      } finally {
        inFlightRequestsRef.current.delete(controller);
        setIsSending(false);
      }
    },
    [activeContext, conversationId, getToken, referenceContext, screen, status?.enabled],
  );

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
      await performSend(userMessage, messages);
    },
    [isSending, messages, performSend],
  );

  const regenerateResponse = useCallback(
    async (assistantMessageId: string) => {
      if (isSending) {
        return;
      }
      const index = messages.findIndex((item) => item.id === assistantMessageId);
      if (index <= 0) {
        return;
      }
      const priorUserMessage = [...messages.slice(0, index)]
        .reverse()
        .find((item) => item.role === "user");
      if (!priorUserMessage) {
        return;
      }

      const truncated = messages.slice(0, index);
      setMessages(truncated);
      await performSend(priorUserMessage, truncated.slice(0, -1));
    },
    [isSending, messages, performSend],
  );

  const retryMessage = useCallback(
    async (userMessageId: string) => {
      if (isSending) {
        return;
      }
      const index = messages.findIndex((item) => item.id === userMessageId);
      if (index < 0 || messages[index].role !== "user") {
        return;
      }

      const historyBefore = messages.slice(0, index);
      const retryTarget: AssistantMessage = { ...messages[index], failed: false };
      setMessages([...historyBefore, retryTarget]);
      setFailedMessageId(null);
      await performSend(retryTarget, historyBefore);
    },
    [isSending, messages, performSend],
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
    setMessages([buildWelcome(screen, nudge, activeContext ?? referenceContext)]);
    setError(null);
  }, [activeContext, nudge, referenceContext, screen]);

  return {
    messages,
    status,
    nudge,
    context: activeContext,
    conversationId,
    isLoadingStatus,
    isLoadingSession,
    isSending,
    error,
    failedMessageId,
    sendMessage,
    regenerateResponse,
    retryMessage,
    submitFeedback,
    resetConversation,
    refreshStatus,
    loadSession,
  };
}
