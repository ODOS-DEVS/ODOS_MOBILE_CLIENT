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
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
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

  async get<T = unknown>(path: string, options?: Record<string, string>): Promise<T> {
    return this.request<T>("GET", path, { headers: options });
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, { body });
  }

  async patch<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, { body });
  }

  async put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, { body });
  }

  async delete<T = unknown>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
