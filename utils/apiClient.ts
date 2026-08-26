import { API_BASE_URL } from "@/constants/auth";
import { getAuthToken } from "@/utils/auth";

export class ApiClientError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.detail = detail ?? message;
  }
}

/**
 * Query string values. Numbers and booleans are accepted because most of the
 * API's query parameters are typed that way server-side (`limit`, `offset`,
 * `full_products`, `points`); they are stringified here so callers do not have
 * to. `null`/`undefined` are dropped rather than sent as the string "null".
 */
export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface RequestOptions {
  params?: QueryParams;
  headers?: Record<string, string>;
}

function buildQueryString(params?: QueryParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    search.append(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      params?: QueryParams;
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    const url = `${this.baseUrl}${path}${buildQueryString(options?.params)}`;
    const token = await getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options?.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      let detail: unknown;
      try {
        detail = await response.json();
      } catch {
        detail = response.statusText;
      }
      throw new ApiClientError(
        `API request failed: ${response.status}`,
        response.status,
        detail
      );
    }

    try {
      return await response.json();
    } catch {
      return {} as T;
    }
  }

  async get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, options);
  }

  async post<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>("POST", path, { ...options, body });
  }

  async patch<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>("PATCH", path, { ...options, body });
  }

  async put<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>("PUT", path, { ...options, body });
  }

  async delete<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, options);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
