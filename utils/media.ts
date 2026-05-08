import { API_BASE_URL } from "@/constants/auth";
import { resolveCatalogImage } from "@/constants/catalogImages";

function getApiOrigin() {
  try {
    const parsed = new URL(API_BASE_URL);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }
}

export function resolveApiMediaUrl(value?: string | null) {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("file://") ||
    trimmed.startsWith("content://") ||
    trimmed.startsWith("ph://")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${getApiOrigin()}${trimmed}`;
  }

  return trimmed;
}

export function resolveImageSource(
  value?: string | null,
  fallbackKey?: string | null,
) {
  const resolvedUrl = resolveApiMediaUrl(value);
  if (resolvedUrl) {
    return { uri: resolvedUrl };
  }

  return resolveCatalogImage(value ?? fallbackKey);
}

export function isLocalAssetUri(value?: string | null) {
  if (!value?.trim()) {
    return false;
  }

  const trimmed = value.trim();
  return (
    trimmed.startsWith("file://") ||
    trimmed.startsWith("content://") ||
    trimmed.startsWith("ph://")
  );
}

function inferMimeType(uri: string) {
  const normalized = uri.toLowerCase();
  if (normalized.endsWith(".png")) {
    return "image/png";
  }
  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }
  return "image/jpeg";
}

function inferFileName(uri: string, fallbackName: string) {
  const fromUri = uri.split("/").pop();
  if (fromUri && fromUri.includes(".")) {
    return fromUri;
  }

  const extension = inferMimeType(uri) === "image/png"
    ? "png"
    : inferMimeType(uri) === "image/webp"
      ? "webp"
      : "jpg";
  return `${fallbackName}.${extension}`;
}

export function appendImageToFormData(
  formData: FormData,
  fieldName: string,
  uri?: string | null,
  fallbackName = fieldName,
) {
  if (!uri?.trim() || !isLocalAssetUri(uri)) {
    return;
  }

  formData.append(fieldName, {
    uri,
    name: inferFileName(uri, fallbackName),
    type: inferMimeType(uri),
  } as any);
}
