import { API_BASE_URL } from "@/constants/auth";
import { getAuthToken } from "@/utils/auth";

/**
 * Flash sale notify-me. All three calls need a signed-in shopper; callers
 * decide what "not signed in" means for their screen (usually a nudge, never
 * an error state).
 */

async function authedFetch(path: string, init?: RequestInit): Promise<Response | null> {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
}

/** Event ids the shopper asked to be reminded about; empty when signed out. */
export async function fetchMyFlashReminders(): Promise<string[]> {
  try {
    const response = await authedFetch("/catalog/flash-sale-reminders/me");
    if (!response?.ok) {
      return [];
    }
    return (await response.json()) as string[];
  } catch {
    return [];
  }
}

export async function setFlashReminder(eventId: string): Promise<void> {
  const response = await authedFetch(`/catalog/flash-sale-events/${encodeURIComponent(eventId)}/reminder`, {
    method: "POST",
  });
  if (!response) {
    throw new Error("Sign in to set a reminder.");
  }
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error((detail as { detail?: string } | null)?.detail ?? "We couldn't set that reminder.");
  }
}

export async function unsetFlashReminder(eventId: string): Promise<void> {
  const response = await authedFetch(`/catalog/flash-sale-events/${encodeURIComponent(eventId)}/reminder`, {
    method: "DELETE",
  });
  if (!response) {
    throw new Error("Sign in to manage reminders.");
  }
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error((detail as { detail?: string } | null)?.detail ?? "We couldn't remove that reminder.");
  }
}
