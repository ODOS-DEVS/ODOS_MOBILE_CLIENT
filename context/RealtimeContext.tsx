import { API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import { AppState, InteractionManager } from "react-native";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type RealtimeEventEnvelope = {
  type: string;
  payload?: unknown;
  occurred_at?: string;
};

type RealtimeContextType = {
  connectionState: "disconnected" | "connecting" | "connected";
  subscribe: (
    eventType: string,
    handler: (event: RealtimeEventEnvelope) => void,
  ) => () => void;
};

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);
const MAX_RECONNECT_DELAY_MS = 10000;

function buildWebSocketUrl(token: string | null) {
  const base = API_BASE_URL.replace(/\/api\/?$/, "");
  const wsBase = base.replace(/^http:\/\//i, "ws://").replace(/^https:\/\//i, "wss://");
  if (!token) {
    return `${wsBase}/api/ws`;
  }
  return `${wsBase}/api/ws?token=${encodeURIComponent(token)}`;
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, refreshCurrentUser, user } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const isActiveRef = useRef(true);
  const shouldReconnectRef = useRef(true);
  const latestTokenRef = useRef<string | null>(null);
  const latestAuthenticatedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const listenersRef = useRef<Map<string, Set<(event: RealtimeEventEnvelope) => void>>>(
    new Map(),
  );
  const [connectionState, setConnectionState] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const dispatchEvent = useCallback((event: RealtimeEventEnvelope) => {
    // Avoid Array.from(Set) on the hot path — Hermes crashes in TestFlight
    // showed arrayFrom → setIterator → HadesGC write-barrier corruption.
    const exactListeners = listenersRef.current.get(event.type);
    if (exactListeners?.size) {
      for (const handler of exactListeners) {
        handler(event);
      }
    }

    const wildcardListeners = listenersRef.current.get("*");
    if (wildcardListeners?.size) {
      for (const handler of wildcardListeners) {
        handler(event);
      }
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    clearReconnectTimeout();
    if (!isActiveRef.current) {
      return;
    }
    const attempt = reconnectAttemptRef.current + 1;
    reconnectAttemptRef.current = attempt;
    const delay = Math.min(1000 * 2 ** (attempt - 1), MAX_RECONNECT_DELAY_MS);
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      if (!isActiveRef.current) {
        return;
      }
      connect(latestTokenRef.current);
    }, delay);
  }, [clearReconnectTimeout]);

  const handleSocketMessage = useCallback(
    async (raw: string) => {
      try {
        const event = JSON.parse(raw) as RealtimeEventEnvelope;

        InteractionManager.runAfterInteractions(() => {
          dispatchEvent(event);
        });

        const shouldRefreshAccount =
          latestAuthenticatedRef.current &&
          (
            event.type === "account.updated" ||
            (event.type === "notification.created" &&
              typeof event.payload === "object" &&
              event.payload &&
              "kind" in event.payload &&
              (event.payload as { kind?: unknown }).kind &&
              ["vendor_approved", "vendor_rejected"].includes(
                String((event.payload as { kind?: unknown }).kind),
              ))
          );

        if (shouldRefreshAccount) {
          await refreshCurrentUser();
        }
      } catch {
        // Ignore malformed realtime messages.
      }
    },
    [dispatchEvent, refreshCurrentUser],
  );

  const connect = useCallback(
    (token: string | null) => {
      if (!isActiveRef.current) {
        return;
      }

      clearReconnectTimeout();

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      setConnectionState("connecting");
      const socket = new WebSocket(buildWebSocketUrl(token));
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptRef.current = 0;
        setConnectionState("connected");
      };

      socket.onmessage = (event) => {
        void handleSocketMessage(String(event.data ?? ""));
      };

      socket.onerror = () => {
        setConnectionState("disconnected");
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }
        setConnectionState("disconnected");
        if (shouldReconnectRef.current) {
          scheduleReconnect();
        }
      };
    },
    [clearReconnectTimeout, handleSocketMessage, scheduleReconnect],
  );

  const userId = user?.id ?? null;

  useEffect(() => {
    userIdRef.current = userId;
    const authenticatedToken = accessToken && userId ? accessToken : null;
    latestTokenRef.current = authenticatedToken;
    latestAuthenticatedRef.current = Boolean(authenticatedToken);

    if (!isActiveRef.current) {
      return;
    }

    shouldReconnectRef.current = false;
    clearReconnectTimeout();
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    shouldReconnectRef.current = true;
    connect(authenticatedToken);

    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimeout();
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [accessToken, clearReconnectTimeout, connect, userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      isActiveRef.current = nextState === "active";
      if (nextState === "active") {
        if (!socketRef.current && userIdRef.current) {
          shouldReconnectRef.current = true;
          connect(latestTokenRef.current);
        }
      } else {
        shouldReconnectRef.current = false;
        clearReconnectTimeout();
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
        setConnectionState("disconnected");
      }
    });

    return () => {
      subscription.remove();
    };
  }, [clearReconnectTimeout, connect]);

  const subscribe = useCallback(
    (eventType: string, handler: (event: RealtimeEventEnvelope) => void) => {
      const bucket = listenersRef.current.get(eventType) ?? new Set();
      bucket.add(handler);
      listenersRef.current.set(eventType, bucket);

      return () => {
        const currentBucket = listenersRef.current.get(eventType);
        if (!currentBucket) {
          return;
        }
        currentBucket.delete(handler);
        if (currentBucket.size === 0) {
          listenersRef.current.delete(eventType);
        }
      };
    },
    [],
  );

  const value = useMemo<RealtimeContextType>(
    () => ({
      connectionState,
      subscribe,
    }),
    [connectionState, subscribe],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error("useRealtime must be used inside RealtimeProvider");
  }
  return ctx;
}
