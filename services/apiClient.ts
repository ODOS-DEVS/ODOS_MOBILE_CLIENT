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
  // 404/405 on a seller endpoint means the app is ahead of the server. That is
  // a deploy problem, and the person reading this screen is a shop owner who
  // cannot deploy anything — so they get a plain sentence, and the actionable
  // detail goes to the console where a developer will actually see it.
  if (response.status === 404 || response.status === 405) {
    if (__DEV__) {
      console.warn(
        `[ODOS] ${response.status} on ${response.url} — the app expects an endpoint this ` +
          "backend does not have. Deploy the latest ODOS mobile backend.",
      );
    }
    return "This feature isn't available yet. Please try again later.";
  }

  try {
    const payload = (await response.json()) as { detail?: unknown; message?: unknown };
    if (payload?.detail !== undefined) {
      const detail = formatApiDetail(payload.detail, fallback);
      if (/method not allowed/i.test(detail)) {
        return "This feature isn't available yet. Please try again later.";
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
