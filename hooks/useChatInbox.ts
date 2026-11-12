import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { useWorkspaceModeStore } from "@/stores/workspaceModeStore";
import { useCallback, useEffect, useMemo } from "react";

/**
 * The signed-in user's chat inbox for whichever side of the app they are on.
 *
 * Read-only: every caller that merely displays a count uses this, so it must
 * stay free of effects. Fetching lives in `useChatInboxSync`, called from one
 * place — two components reading the same count should not mean two requests.
 */
export function useChatInbox() {
  const mode = useWorkspaceModeStore((state) => state.mode);
  const { customerThreads, vendorThreads } = useChat();

  // A seller in sell-only mode is answering customers; everyone else is the
  // customer. Scope follows the workspace the person is actually working in,
  // so the count always matches the inbox the button opens.
  const isSelling = mode === "sell_only";
  const threads = isSelling ? vendorThreads : customerThreads;

  const unreadCount = useMemo(
    () => threads.reduce((total, thread) => total + (thread.unreadCount ?? 0), 0),
    [threads],
  );

  /** How many separate conversations are waiting, not how many messages. */
  const unreadThreadCount = useMemo(
    () => threads.filter((thread) => (thread.unreadCount ?? 0) > 0).length,
    [threads],
  );

  /** The thread a reply most likely just landed in. */
  const latestUnreadThread = useMemo(
    () => threads.find((thread) => (thread.unreadCount ?? 0) > 0) ?? null,
    [threads],
  );

  return {
    isSelling,
    threads,
    unreadCount,
    unreadThreadCount,
    latestUnreadThread,
    hasThreads: threads.length > 0,
  };
}

/**
 * Keeps the inbox loaded so the indicators can be trusted anywhere.
 *
 * `ChatProvider` already keeps unread counts live — it subscribes to
 * `chat.message.created` and `chat.messages.read` — but it only ever held
 * threads some screen had explicitly asked for. That was enough when only the
 * chat screens read them; an indicator shown everywhere would otherwise sit
 * at zero until you opened the inbox and found the replies yourself.
 *
 * One load per sign-in and per scope switch, plus a foreground revalidate.
 * Realtime covers everything in between, so nothing polls.
 */
export function useChatInboxSync() {
  const { user } = useAuth();
  const mode = useWorkspaceModeStore((state) => state.mode);
  const { loadCustomerThreads, loadVendorThreads } = useChat();
  const isSelling = mode === "sell_only";

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    // `silent` keeps this off the chat screens' own loading spinners.
    await (isSelling
      ? loadVendorThreads({ silent: true })
      : loadCustomerThreads({ silent: true }));
  }, [isSelling, loadCustomerThreads, loadVendorThreads, user]);

  useEffect(() => {
    void load();
  }, [load]);

  useLiveRefresh(load, { enabled: Boolean(user) });
}
