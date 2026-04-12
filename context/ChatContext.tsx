import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "vendor";
  time: number;
};

export type ChatThread = {
  vendorId: string;
  vendorName: string;
  vendorAvatarUri?: string;
  updatedAt: number;
  lastMessageText: string;
};

type EnsureThreadInput = {
  vendorId: string;
  vendorName?: string;
  vendorAvatarUri?: string;
};

type ChatContextType = {
  threads: ChatThread[];
  messagesByVendor: Record<string, ChatMessage[]>;
  ensureThread: (input: EnsureThreadInput) => void;
  sendMessage: (
    vendorId: string,
    text: string,
    sender?: ChatMessage["sender"]
  ) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const now = () => Date.now();

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [threadsByVendor, setThreadsByVendor] = useState<
    Record<string, ChatThread>
  >({});
  const [messagesByVendor, setMessagesByVendor] = useState<
    Record<string, ChatMessage[]>
  >({});

  const ensureThread = useCallback((input: EnsureThreadInput) => {
    const { vendorId } = input;
    if (!vendorId) return;

    setThreadsByVendor((prev) => {
      const existing = prev[vendorId];
      const vendorName = input.vendorName ?? existing?.vendorName ?? "Vendor";
      const vendorAvatarUri = input.vendorAvatarUri ?? existing?.vendorAvatarUri;

      if (existing) {
        if (
          existing.vendorName === vendorName &&
          existing.vendorAvatarUri === vendorAvatarUri
        ) {
          return prev;
        }
        return {
          ...prev,
          [vendorId]: { ...existing, vendorName, vendorAvatarUri },
        };
      }

      const createdAt = now();
      const seededText = "Hi! How can I help you with this product?";
      const newThread: ChatThread = {
        vendorId,
        vendorName,
        vendorAvatarUri,
        updatedAt: createdAt,
        lastMessageText: seededText,
      };

      setMessagesByVendor((m) => {
        if (m[vendorId]?.length) return m;
        const seeded: ChatMessage = {
          id: `seed-${createdAt}`,
          text: seededText,
          sender: "vendor",
          time: createdAt,
        };
        return { ...m, [vendorId]: [seeded] };
      });

      return { ...prev, [vendorId]: newThread };
    });
  }, []);

  const sendMessage = useCallback(
    (vendorId: string, text: string, sender: ChatMessage["sender"] = "user") => {
      const trimmed = text.trim();
      if (!vendorId || !trimmed) return;

      const messageTime = now();
      const msg: ChatMessage = {
        id: `${messageTime}-${Math.random().toString(16).slice(2)}`,
        text: trimmed,
        sender,
        time: messageTime,
      };

      setMessagesByVendor((prev) => ({
        ...prev,
        [vendorId]: [...(prev[vendorId] ?? []), msg],
      }));

      setThreadsByVendor((prev) => {
        const existing = prev[vendorId];
        const next: ChatThread = existing
          ? {
              ...existing,
              updatedAt: messageTime,
              lastMessageText: trimmed,
            }
          : {
              vendorId,
              vendorName: "Vendor",
              updatedAt: messageTime,
              lastMessageText: trimmed,
            };
        return { ...prev, [vendorId]: next };
      });
    },
    []
  );

  const threads = useMemo(() => {
    return Object.values(threadsByVendor).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [threadsByVendor]);

  const value = useMemo<ChatContextType>(
    () => ({ threads, messagesByVendor, ensureThread, sendMessage }),
    [threads, messagesByVendor, ensureThread, sendMessage]
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

