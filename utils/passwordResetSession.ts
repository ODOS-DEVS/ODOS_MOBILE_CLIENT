/**
 * Holds the password-reset JWT outside of Expo Router URL params.
 * Persists briefly in SecureStore so process kills mid-flow don't force a restart.
 */

import * as SecureStore from "expo-secure-store";

type PasswordResetSession = {
  email: string;
  resetToken: string;
  savedAt: number;
};

const STORAGE_KEY = "odos_password_reset_session_v1";
/** Match backend PASSWORD_RESET_TOKEN_EXPIRE_MINUTES (~15). */
const TTL_MS = 15 * 60 * 1000;

let session: PasswordResetSession | null = null;

function isFresh(entry: PasswordResetSession | null) {
  if (!entry?.resetToken) return false;
  return Date.now() - entry.savedAt < TTL_MS;
}

async function persist(next: PasswordResetSession | null) {
  try {
    if (!next) {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Non-fatal — in-memory session still works for the current process.
  }
}

async function hydrateFromStore() {
  if (session && isFresh(session)) return session;
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PasswordResetSession;
    if (!isFresh(parsed)) {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      session = null;
      return null;
    }
    session = parsed;
    return session;
  } catch {
    return null;
  }
}

export function setPasswordResetSession(email: string, resetToken: string) {
  session = {
    email: email.trim().toLowerCase(),
    resetToken: resetToken.trim(),
    savedAt: Date.now(),
  };
  void persist(session);
}

export function getPasswordResetSession() {
  return isFresh(session) ? session : null;
}

export function clearPasswordResetSession() {
  session = null;
  void persist(null);
}

export function getPasswordResetToken(email?: string | null) {
  if (!isFresh(session)) {
    session = null;
    return null;
  }

  if (email) {
    const normalized = email.trim().toLowerCase();
    if (session?.email && session.email !== normalized) {
      return null;
    }
  }

  return session?.resetToken ?? null;
}

/** Async read for screens that mount after a process restart. */
export async function loadPasswordResetToken(email?: string | null) {
  const hydrated = await hydrateFromStore();
  if (!hydrated) return null;
  if (email) {
    const normalized = email.trim().toLowerCase();
    if (hydrated.email && hydrated.email !== normalized) {
      return null;
    }
  }
  return hydrated.resetToken;
}

/** @deprecated Use getPasswordResetToken */
export const consumePasswordResetToken = getPasswordResetToken;
