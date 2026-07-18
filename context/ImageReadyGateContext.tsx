import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ImageReadyGateContextValue = {
  ready: boolean;
  track: (id: string) => void;
  settle: (id: string) => void;
  untrack: (id: string) => void;
};

const ImageReadyGateContext = createContext<ImageReadyGateContextValue | null>(null);

const DEFAULT_TIMEOUT_MS = 2500;

type ImageReadyGateProviderProps = {
  children: React.ReactNode;
  /** Change this when the visible product set changes to re-arm the gate. */
  resetKey: string;
  /** When false, the gate is immediately ready (e.g. empty/error states). */
  enabled?: boolean;
  timeoutMs?: number;
};

export function ImageReadyGateProvider({
  children,
  resetKey,
  enabled = true,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: ImageReadyGateProviderProps) {
  const [ready, setReady] = useState(!enabled);
  const trackedRef = useRef<Set<string>>(new Set());
  const settledRef = useRef<Set<string>>(new Set());
  const armedRef = useRef(false);

  const maybeComplete = useCallback(() => {
    if (!armedRef.current) {
      return;
    }
    // Empty tracked set is handled by the empty-grace timer, not here —
    // otherwise we open before FlatList cells mount and register images.
    if (trackedRef.current.size === 0) {
      return;
    }
    if (trackedRef.current.size === settledRef.current.size) {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    trackedRef.current = new Set();
    settledRef.current = new Set();
    armedRef.current = false;

    if (!enabled) {
      setReady(true);
      return;
    }

    setReady(false);
    // Wait briefly so FlatList / card children can mount and register images.
    const armTimer = setTimeout(() => {
      armedRef.current = true;
      maybeComplete();
    }, 120);
    // If nothing registered (placeholders / no remote images), don't block forever.
    const emptyGraceTimer = setTimeout(() => {
      armedRef.current = true;
      if (trackedRef.current.size === 0) {
        setReady(true);
      } else {
        maybeComplete();
      }
    }, 400);
    const timeout = setTimeout(() => {
      armedRef.current = true;
      setReady(true);
    }, timeoutMs);

    return () => {
      clearTimeout(armTimer);
      clearTimeout(emptyGraceTimer);
      clearTimeout(timeout);
    };
  }, [enabled, maybeComplete, resetKey, timeoutMs]);

  const track = useCallback(
    (id: string) => {
      if (!id || !enabled) {
        return;
      }
      trackedRef.current.add(id);
      maybeComplete();
    },
    [enabled, maybeComplete],
  );

  const settle = useCallback(
    (id: string) => {
      if (!id || !enabled) {
        return;
      }
      if (!trackedRef.current.has(id)) {
        trackedRef.current.add(id);
      }
      settledRef.current.add(id);
      maybeComplete();
    },
    [enabled, maybeComplete],
  );

  const untrack = useCallback(
    (id: string) => {
      if (!id) {
        return;
      }
      trackedRef.current.delete(id);
      settledRef.current.delete(id);
      maybeComplete();
    },
    [maybeComplete],
  );

  const value = useMemo(
    () => ({
      ready,
      track,
      settle,
      untrack,
    }),
    [ready, settle, track, untrack],
  );

  return (
    <ImageReadyGateContext.Provider value={value}>{children}</ImageReadyGateContext.Provider>
  );
}

export function useImageReadyGate() {
  const value = useContext(ImageReadyGateContext);
  if (!value) {
    throw new Error("useImageReadyGate must be used within ImageReadyGateProvider");
  }
  return value;
}

export function useOptionalImageReadyGate() {
  return useContext(ImageReadyGateContext);
}
