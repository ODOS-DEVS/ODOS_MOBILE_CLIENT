export const ACCESS_TOKEN_STORAGE_KEY = "odos_access_token";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000/api";
