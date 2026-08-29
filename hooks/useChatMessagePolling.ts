import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useRealtime } from "@/context/RealtimeContext";

const DEFAULT_POLL_INTERVAL_MS = 5000;

type LoadMessages = (
  threadId: string,
  options?: { silent?: boolean },
) => Promise<unknown>;

/**
 * Fallback refresh for an open conversation while realtime is down.
 *
 * Chat normally updates over the websocket at /api/ws: ChatContext subscribes
 * to chat.message.created and inserts straight into the open thread, so no
 * polling is needed and none happens while that connection is healthy.
 *
 * The socket does drop, though — backgrounding, a handover between mobile
 * masts, a flaky connection — and the screens otherwise fetch messages only
 * once when they gain focus. Between a drop and a reconnect the conversation
 * would silently stop updating with no sign anything was wrong. This polls only
 * for that window, and stops as soon as the socket is back.
 *
 * Chat endpoints carry no rate limit (only auth, OTP and payment routes do), so
 * the interval is safe.
 */
export function useChatMessagePolling(
  threadId: string | null | undefined,
  loadMessages: LoadMessages,
  intervalMs: number = DEFAULT_POLL_INTERVAL_MS,
) {
  const { connectionState } = useRealtime();
  const isFocusedRef = useRef(false);
  const inFlightRef = useRef(false);
  const connectionStateRef = useRef(connectionState);
  connectionStateRef.current = connectionState;

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;

      if (!threadId) {
        return () => {
          isFocusedRef.current = false;
        };
      }

      const tick = async () => {
        // Realtime healthy: messages already arrive over the socket, so a fetch
        // here would be pure duplicate traffic.
        if (connectionStateRef.current === "connected") {
          return;
        }
        // Never let requests overlap: on a slow connection a fixed timer would
        // otherwise stack fetches faster than they can complete.
        if (inFlightRef.current || AppState.currentState !== "active") {
          return;
        }
        inFlightRef.current = true;
        try {
          await loadMessages(threadId, { silent: true });
        } catch {
          // A failed poll is not worth surfacing. The next tick retries, and the
          // screen still shows the last messages that loaded successfully — an
          // error banner over a readable conversation would be worse.
        } finally {
          inFlightRef.current = false;
        }
      };

      const timer = setInterval(() => void tick(), intervalMs);

      // Catch up the moment the app returns to the foreground instead of
      // waiting out the rest of the interval.
      const subscription = AppState.addEventListener(
        "change",
        (state: AppStateStatus) => {
          if (state === "active" && isFocusedRef.current) {
            void tick();
          }
        },
      );

      return () => {
        isFocusedRef.current = false;
        clearInterval(timer);
        subscription.remove();
      };
    }, [threadId, loadMessages, intervalMs]),
  );
}
