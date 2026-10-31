import { API_BASE_URL } from "@/constants/auth";
import { resolveCatalogImage } from "@/constants/catalogImages";
import { File } from "expo-file-system";

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

/**
 * Attach a local image to a multipart upload.
 *
 * Appends an `expo-file-system` File rather than React Native's
 * `{ uri, name, type }` file descriptor, because global `fetch` in this SDK is
 * Expo's WinterCG implementation, not React Native's.
 *
 * That matters: winter fetch serialises multipart itself
 * (expo/src/winter/fetch/convertFormData.ts). It accepts a part that is a
 * Blob, or any object exposing `bytes()` — and rejects everything else with
 * "Unsupported FormData implementation" / "Unsupported FormDataPart
 * implementation". A `{ uri, name, type }` descriptor has no `bytes()`, so
 * every image upload threw before a single byte left the device.
 *
 * `File` is constructed synchronously and only read when fetch serialises the
 * body, so this stays a drop-in for the old synchronous call sites.
 */
export function appendImageToFormData(
  formData: FormData,
  fieldName: string,
  uri?: string | null,
  fallbackName = fieldName,
) {
  if (!uri?.trim() || !isLocalAssetUri(uri)) {
    return;
  }

  const file = new File(uri);
  // The multipart filename and content type are read off the part, and File
  // derives them from the path — which loses the caller's intended name for
  // URIs like ImagePicker's opaque cache paths. Pin both explicitly.
  Object.defineProperties(file, {
    name: { value: inferFileName(uri, fallbackName), configurable: true },
    type: { value: inferMimeType(uri), configurable: true },
  });

  formData.append(fieldName, file as unknown as Blob);
}
