import { API_BASE_URL } from "@/constants/auth";

export class ApiError extends Error {
  status: number;
  detail: unknown;
  code: string | null;

  constructor(message: string, status: number, detail?: unknown, code?: string | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail ?? message;
    this.code = code ?? null;
  }
}

/** Normalize FastAPI `detail` (string | validation array | object) into a user-facing message. */
export function formatApiDetail(detail: unknown, fallback = "Something went wrong."): string {
  if (
    detail &&
    typeof detail === "object" &&
    "message" in detail &&
    typeof (detail as { message?: unknown }).message === "string" &&
    (detail as { message: string }).message.trim()
  ) {
    return (detail as { message: string }).message.trim();
  }

  if (typeof detail === "string" && detail.trim()) {
    return detail.trim();
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (first && typeof first === "object" && typeof (first as { msg?: unknown }).msg === "string") {
      return (first as { msg: string }).msg;
    }
  }

  return fallback;
}

export async function parseApiErrorMessage(
  response: Response,
  fallback = "Request failed.",
): Promise<string> {
  if (response.status === 405) {
    return "This seller feature needs a backend update. Deploy the latest ODOS mobile backend, then try again.";
  }
  if (response.status === 404) {
    return "This seller endpoint is missing on the server. Deploy the latest ODOS mobile backend to enable it.";
  }

  try {
    const payload = (await response.json()) as { detail?: unknown; message?: unknown };
    if (payload?.detail !== undefined) {
      const detail = formatApiDetail(payload.detail, fallback);
      if (/method not allowed/i.test(detail)) {
        return "This seller feature needs a backend update. Deploy the latest ODOS mobile backend, then try again.";
      }
      return detail;
    }
    if (typeof payload?.message === "string" && payload.message.trim()) {
      return payload.message.trim();
    }
  } catch {
    // Non-JSON body
  }

  return response.statusText?.trim() || fallback;
}

type ApiFetchOptions = RequestInit & {
  accessToken?: string | null;
  json?: unknown;
};

/** Shared fetch for marketplace APIs — auth header, JSON body, consistent errors. */
export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { accessToken, json, headers, body, ...rest } = options;
  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const nextHeaders = new Headers(headers);
  if (accessToken) {
    nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  }
  if (json !== undefined && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...rest,
    headers: nextHeaders,
    body: json !== undefined ? JSON.stringify(json) : body,
  });

  if (!response.ok) {
    const message = await parseApiErrorMessage(response);
    const code = response.headers.get("X-Error-Code");
    throw new ApiError(message, response.status, message, code);
  }

  return response;
}

export async function apiJson<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const response = await apiFetch(path, options);
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
