import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ImageStyle, StyleProp, View, ViewStyle } from "react-native";

type UserAvatarProps = {
  avatarUrl?: string | null;
  size: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export default function UserAvatar({
  avatarUrl,
  size,
  style,
  imageStyle,
}: UserAvatarProps) {
  const hasAvatar = Boolean(avatarUrl?.trim());

  if (hasAvatar) {
    return (
      <Image
        source={{ uri: avatarUrl!.trim() }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          imageStyle,
          style as StyleProp<ImageStyle>,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#EEF2F4",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#E1E7EC",
        },
        style,
      ]}
    >
      <Ionicons
        name="person"
        size={size * 0.46}
        color="#66797F"
      />
    </View>
  );
}
