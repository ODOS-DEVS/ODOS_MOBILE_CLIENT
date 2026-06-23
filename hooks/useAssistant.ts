import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import type {
  AssistantAction,
  AssistantMessage,
  AssistantStatus,
} from "@/types/assistant";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

type AssistantChatApiResponse = {
  reply: string;
  suggested_actions?: { label: string; route: string }[];
  escalated_to_support?: boolean;
};

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function mapActions(items?: { label: string; route: string }[]): AssistantAction[] {
  return (items ?? [])
    .filter((item) => item.label?.trim() && item.route?.trim())
    .map((item) => ({ label: item.label.trim(), route: item.route.trim() }));
}

const WELCOME_MESSAGE: AssistantMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi — I'm the ODOS Assistant. I can help with orders, checkout, delivery, vouchers, returns, stores, and anything else in the app. What do you need?",
  suggestedActions: [
    { label: "Track an order", route: "/screens/profileScreens/orders" },
    { label: "Browse deals", route: "/screens/deals" },
    { label: "FAQ", route: "/screens/profileScreens/helpAndSupport/FAQ" },
  ],
  createdAt: Date.now(),
};

export function useAssistant(screen?: string) {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([WELCOME_MESSAGE]);
  const [status, setStatus] = useState<AssistantStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
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

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

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

        const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message,
            history,
            screen: screen ?? null,
          }),
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

        const assistantMessage: AssistantMessage = {
          id: createMessageId(),
          role: "assistant",
          content: (payload as AssistantChatApiResponse).reply,
          suggestedActions: mapActions(
            (payload as AssistantChatApiResponse).suggested_actions,
          ),
          escalatedToSupport: Boolean(
            (payload as AssistantChatApiResponse).escalated_to_support,
          ),
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
    [getToken, isSending, messages, screen],
  );

  const resetConversation = useCallback(() => {
    setMessages([{ ...WELCOME_MESSAGE, createdAt: Date.now() }]);
    setError(null);
  }, []);

  return {
    messages,
    status,
    isLoadingStatus,
    isSending,
    error,
    sendMessage,
    resetConversation,
    refreshStatus,
  };
}
