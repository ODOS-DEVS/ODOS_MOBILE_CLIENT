import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

/**
 * Revalidate slow-moving catalog data when the app comes back to the
 * foreground — and only if enough time has passed to make it worth a request.
 *
 * This used to poll every 15 seconds for as long as the app was open, on
 * products, markets and categories at once. That is what made the app feel
 * like it reloaded at random: a request every 15s per hook, each one able to
 * swap list contents under the reader mid-scroll, all for data that changes a
 * few times a day. It also burned battery and mobile data for nothing.
 *
 * Standard apps layer freshness instead of polling it, and ODOS already has
 * every layer:
 *
 *   1. `fetchJsonCached` renders from cache immediately and revalidates in the
 *      background when its own `staleTimeMs` has passed.
 *   2. The realtime channel pushes `catalog.*.changed` and the affected hook
 *      invalidates and refetches — genuine liveness, event-driven.
 *   3. Pull-to-refresh covers "I want it fresh right now".
 *
 * All this adds on top is the case none of those catch: the app was
 * backgrounded for a while and the data on screen is now old. Returning after
 * less than `minIntervalMs` does nothing at all.
 */

/** Don't revalidate on foreground more often than this. */
export const FOREGROUND_REVALIDATE_AFTER_MS = 5 * 60_000;

export function useLiveRefresh(
  refresh: () => Promise<void> | void,
  {
    enabled = true,
    minIntervalMs = FOREGROUND_REVALIDATE_AFTER_MS,
  }: {
    enabled?: boolean;
    minIntervalMs?: number;
  } = {},
) {
  const refreshRef = useRef(refresh);
  // 0 until the mount effect stamps it. Seeding at mount matters because the
  // hook's own initial fetch has just run, so a foreground event seconds later
  // must not trigger a second one.
  const lastRefreshedAtRef = useRef(0);

  useEffect(() => {
    lastRefreshedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  const revalidateIfStale = useCallback(() => {
    if (Date.now() - lastRefreshedAtRef.current < minIntervalMs) {
      return;
    }
    lastRefreshedAtRef.current = Date.now();
    void refreshRef.current();
  }, [minIntervalMs]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        revalidateIfStale();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, revalidateIfStale]);
}

/**
 * The same stale gate, applied to screen focus instead of app foreground.
 *
 * `useFocusEffect` fires every single time a screen is navigated back to, so
 * calling a refresh inside it refetches on every tab switch — the other half
 * of why the app looked like it reloaded for no reason. Wrapping it in the
 * elapsed-time check keeps the intent (come back to a screen, see current
 * data) without a request per visit.
 */
export function useFocusRevalidate(
  refresh: () => Promise<void> | void,
  { minIntervalMs = FOREGROUND_REVALIDATE_AFTER_MS }: { minIntervalMs?: number } = {},
) {
  const refreshRef = useRef(refresh);
  const lastRefreshedAtRef = useRef(0);

  useEffect(() => {
    lastRefreshedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  return useCallback(() => {
    if (Date.now() - lastRefreshedAtRef.current < minIntervalMs) {
      return;
    }
    lastRefreshedAtRef.current = Date.now();
    void refreshRef.current();
  }, [minIntervalMs]);
}
