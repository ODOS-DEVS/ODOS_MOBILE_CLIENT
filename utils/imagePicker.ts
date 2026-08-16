import * as ImagePicker from "expo-image-picker";

export type CropAspect = readonly [number, number];

// Generous ceiling for a single (already-compressed-by-`quality`) upload — catches
// unusually huge originals before they hit a slow/failing multipart POST, rather than
// letting the upload fail server-side with no explanation.
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function pickCroppedImage(aspect?: CropAspect, quality = 0.85) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      granted: false as const,
      canceled: false as const,
      tooLarge: false as const,
      uri: null,
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    ...(aspect ? { aspect: [aspect[0], aspect[1]] as [number, number] } : {}),
    quality,
  });

  if (result.canceled || !result.assets.length) {
    return {
      granted: true as const,
      canceled: true as const,
      tooLarge: false as const,
      uri: null,
    };
  }

  const asset = result.assets[0];
  if (typeof asset.fileSize === "number" && asset.fileSize > MAX_IMAGE_BYTES) {
    return {
      granted: true as const,
      canceled: false as const,
      tooLarge: true as const,
      uri: null,
    };
  }

  return {
    granted: true as const,
    canceled: false as const,
    tooLarge: false as const,
    uri: asset.uri,
  };
}

/** Chat photo picker — no forced crop, since a shopper/vendor sharing a
 * photo in a conversation expects it sent as-is, not cropped to a fixed
 * shape the way a profile/product image would be. */
export async function pickChatImage(quality = 0.85) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      granted: false as const,
      canceled: false as const,
      tooLarge: false as const,
      asset: null,
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality,
  });

  if (result.canceled || !result.assets.length) {
    return {
      granted: true as const,
      canceled: true as const,
      tooLarge: false as const,
      asset: null,
    };
  }

  const asset = result.assets[0];
  if (typeof asset.fileSize === "number" && asset.fileSize > MAX_IMAGE_BYTES) {
    return {
      granted: true as const,
      canceled: false as const,
      tooLarge: true as const,
      asset: null,
    };
  }

  return {
    granted: true as const,
    canceled: false as const,
    tooLarge: false as const,
    asset: {
      uri: asset.uri,
      mimeType: asset.mimeType ?? "image/jpeg",
      fileName: asset.fileName ?? undefined,
    },
  };
}
