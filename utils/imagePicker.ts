import * as ImagePicker from "expo-image-picker";

export type CropAspect = readonly [number, number];

/**
 * Ceiling for one upload. Raised from 8MB when the picker stopped re-encoding:
 * a true phone original is several megabytes, and the point of this change is
 * to let that reach Cloudinary intact. The backend accepts up to 20MB.
 */
const MAX_IMAGE_BYTES = 18 * 1024 * 1024;

/**
 * Pick one photo, preserving as much of the original as the OS will give us.
 *
 * Two defaults here were quietly destroying every product photo on the
 * platform, and both are measurable in the stored files: 13 of 14 sampled
 * product originals were 1201–1206px wide, which is no coincidence.
 *
 * - `allowsEditing` was always on. iOS's built-in crop UI returns a
 *   downscaled copy (~1200px on the long edge) regardless of the source,
 *   so a 4000px camera photo arrived as a 1200px one before anything else
 *   touched it. No caller actually passed an aspect ratio, so the crop step
 *   was buying nothing. It is now opt-in, and only honoured when a fixed
 *   aspect genuinely requires it.
 * - `quality` defaulted to 0.85 (callers passed as low as 0.7), which forces
 *   a lossy JPEG re-encode of an already-lossy camera JPEG — generation loss,
 *   paid before the bytes leave the device and impossible to recover later.
 *   It now defaults to 1: Cloudinary derives every delivered size from what
 *   we send, so this file is the quality ceiling for the whole platform.
 */
export async function pickCroppedImage(
  aspect?: CropAspect,
  quality = 1,
  options?: { allowsEditing?: boolean },
) {
  // Cropping only when the shape matters — see above.
  const allowsEditing = options?.allowsEditing ?? Boolean(aspect);
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
    allowsEditing,
    ...(allowsEditing && aspect ? { aspect: [aspect[0], aspect[1]] as [number, number] } : {}),
    quality,
    exif: false,
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
export async function pickChatImage(quality = 1) {
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
    exif: false,
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
