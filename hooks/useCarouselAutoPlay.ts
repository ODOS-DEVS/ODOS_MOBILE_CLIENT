import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";

type UseCarouselAutoPlayOptions = {
  count: number;
  intervalMs?: number;
  enabled?: boolean;
  onAdvance: (nextIndex: number) => void;
  getActiveIndex: () => number;
};

export function useCarouselAutoPlay({
  count,
  intervalMs = 5000,
  enabled = true,
  onAdvance,
  getActiveIndex,
}: UseCarouselAutoPlayOptions) {
  const isInteractingRef = useRef(false);
  const isFocusedRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      return () => {
        isFocusedRef.current = false;
      };
    }, []),
  );

  useEffect(() => {
    if (!enabled || count <= 1) {
      return undefined;
    }

    const timerId = setInterval(() => {
      if (isInteractingRef.current || !isFocusedRef.current) {
        return;
      }

      const nextIndex = (getActiveIndex() + 1) % count;
      onAdvance(nextIndex);
    }, intervalMs);

    return () => {
      clearInterval(timerId);
    };
  }, [count, enabled, getActiveIndex, intervalMs, onAdvance]);

  const pauseAutoPlay = useCallback(() => {
    isInteractingRef.current = true;
  }, []);

  const resumeAutoPlay = useCallback(() => {
    isInteractingRef.current = false;
  }, []);

  return { pauseAutoPlay, resumeAutoPlay };
}
