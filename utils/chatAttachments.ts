import * as DocumentPicker from "expo-document-picker";

const MAX_CHAT_DOCUMENT_BYTES = 15 * 1024 * 1024;

const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

export async function pickChatDocument() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ALLOWED_DOCUMENT_MIME_TYPES,
    multiple: false,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) {
    return { canceled: true as const, tooLarge: false as const, asset: null };
  }

  const asset = result.assets[0];
  if (typeof asset.size === "number" && asset.size > MAX_CHAT_DOCUMENT_BYTES) {
    return { canceled: false as const, tooLarge: true as const, asset: null };
  }

  return {
    canceled: false as const,
    tooLarge: false as const,
    asset: {
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? "application/octet-stream",
    },
  };
}
