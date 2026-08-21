/**
 * Generate a unique session ID for the current app session.
 * Used for tracking analytics and promo events.
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get or create a persistent session ID stored in AsyncStorage.
 * This remains the same across app restarts within a session.
 */
let cachedSessionId: string | null = null;

export function getSessionId(): string {
  if (!cachedSessionId) {
    cachedSessionId = generateSessionId();
  }
  return cachedSessionId;
}

/**
 * Clear the session ID (typically called on logout or app restart).
 */
export function clearSessionId(): void {
  cachedSessionId = null;
}
