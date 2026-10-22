import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useSyncExternalStore } from "react";

/**
 * Which resource-center guides this reader has finished.
 *
 * Backed by a module-level store rather than per-screen state because two
 * screens show it at once: marking a guide read on the detail screen has to be
 * visible on the index the moment you navigate back. Persistence uses
 * SecureStore to match `utils/onboardingStorage` — no extra dependency, and a
 * read list is small enough that a handful of slugs is all we ever store.
 */

export const GUIDE_PROGRESS_KEY = "odos_guides_read";

type GuideProgressSnapshot = {
  readSlugs: string[];
  isHydrated: boolean;
};

let readSlugs: string[] = [];
let isHydrated = false;
// Recreated only on mutation so useSyncExternalStore sees a stable identity.
let snapshot: GuideProgressSnapshot = { readSlugs, isHydrated };

const listeners = new Set<() => void>();

function emit() {
  snapshot = { readSlugs, isHydrated };
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

async function persist() {
  try {
    await SecureStore.setItemAsync(GUIDE_PROGRESS_KEY, JSON.stringify(readSlugs));
  } catch {
    // Progress is a convenience, never a correctness requirement — a device
    // that refuses the write just loses the checkmarks.
  }
}

let hydration: Promise<void> | null = null;

function hydrate() {
  if (isHydrated) {
    return Promise.resolve();
  }

  hydration ??= (async () => {
    try {
      const raw = await SecureStore.getItemAsync(GUIDE_PROGRESS_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      readSlugs = Array.isArray(parsed)
        ? parsed.filter((slug): slug is string => typeof slug === "string")
        : [];
    } catch {
      readSlugs = [];
    } finally {
      isHydrated = true;
      emit();
    }
  })();

  return hydration;
}

export function setGuideRead(slug: string, read: boolean) {
  const alreadyRead = readSlugs.includes(slug);
  if (alreadyRead === read) {
    return;
  }

  readSlugs = read ? [...readSlugs, slug] : readSlugs.filter((item) => item !== slug);
  emit();
  void persist();
}

export function clearGuideProgress() {
  if (readSlugs.length === 0) {
    return;
  }

  readSlugs = [];
  emit();
  void persist();
}

export function useGuideProgress() {
  const { readSlugs: slugs, isHydrated: hydrated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
  );

  useEffect(() => {
    void hydrate();
  }, []);

  const isRead = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return {
    readSlugs: slugs,
    readCount: slugs.length,
    isHydrated: hydrated,
    isRead,
    setRead: setGuideRead,
    clearProgress: clearGuideProgress,
  };
}
