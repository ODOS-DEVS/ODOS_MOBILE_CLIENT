import { useEffect, useRef } from "react";
import { AppState } from "react-native";

export const LIVE_REFRESH_INTERVAL_MS = 15_000;

export function useLiveRefresh(
  refresh: () => Promise<void> | void,
  {
    enabled = true,
    intervalMs = LIVE_REFRESH_INTERVAL_MS,
  }: {
    enabled?: boolean;
    intervalMs?: number;
  } = {},
) {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const runRefresh = () => {
      void refreshRef.current();
    };

    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startInterval = () => {
      stopInterval();
      intervalId = setInterval(() => {
        if (AppState.currentState === "active") {
          runRefresh();
        }
      }, intervalMs);
    };

    if (AppState.currentState === "active") {
      startInterval();
    }

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        runRefresh();
        startInterval();
        return;
      }

      stopInterval();
    });

    return () => {
      subscription.remove();
      stopInterval();
    };
  }, [enabled, intervalMs]);
}
