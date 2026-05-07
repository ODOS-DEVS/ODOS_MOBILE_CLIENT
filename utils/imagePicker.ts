import * as ImagePicker from "expo-image-picker";

export type CropAspect = readonly [number, number];

export async function pickCroppedImage(aspect?: CropAspect, quality = 0.85) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      granted: false as const,
      canceled: false as const,
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
      uri: null,
    };
  }

  return {
    granted: true as const,
    canceled: false as const,
    uri: result.assets[0].uri,
  };
}
