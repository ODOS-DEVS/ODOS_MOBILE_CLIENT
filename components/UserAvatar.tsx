import { getProfileCoverPalette } from "@/utils/profileCover";
import { resolveApiMediaUrl } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageStyle,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

type UserAvatarProps = {
  avatarUrl?: string | null;
  gender?: string | null;
  size: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  bordered?: boolean;
};

function DefaultUserIcon({
  gender,
  size,
  bordered,
}: {
  gender?: string | null;
  size: number;
  bordered?: boolean;
}) {
  const palette = useMemo(() => getProfileCoverPalette(gender), [gender]);
  const borderWidth = bordered ? Math.max(3, Math.round(size * 0.04)) : 1;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette.avatarBackground,
        alignItems: "center",
        justifyContent: "center",
        borderWidth,
        borderColor: bordered ? palette.avatarBorder : "#D8DEE6",
        shadowColor: "#0F172A",
        shadowOpacity: bordered ? 0.12 : 0.06,
        shadowRadius: bordered ? 6 : 3,
        shadowOffset: { width: 0, height: bordered ? 3 : 1 },
        elevation: bordered ? 3 : 1,
      }}
    >
      <Ionicons
        name="person"
        size={Math.round(size * 0.44)}
        color={palette.avatarIcon}
      />
    </View>
  );
}

export default function UserAvatar({
  avatarUrl,
  gender,
  size,
  style,
  imageStyle,
  bordered = false,
}: UserAvatarProps) {
  const palette = useMemo(() => getProfileCoverPalette(gender), [gender]);
  const resolvedAvatarUrl = useMemo(
    () => resolveApiMediaUrl(avatarUrl) ?? avatarUrl?.trim() ?? "",
    [avatarUrl],
  );
  const [imageFailed, setImageFailed] = useState(false);
  const borderWidth = bordered ? Math.max(3, Math.round(size * 0.04)) : 0;
  const showRemoteAvatar = Boolean(resolvedAvatarUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [resolvedAvatarUrl]);

  if (!showRemoteAvatar) {
    return (
      <View style={style}>
        <DefaultUserIcon gender={gender} size={size} bordered={bordered} />
      </View>
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          borderWidth,
          borderColor: palette.avatarBorder,
          shadowColor: "#0F172A",
          shadowOpacity: bordered ? 0.12 : 0.06,
          shadowRadius: bordered ? 6 : 3,
          shadowOffset: { width: 0, height: bordered ? 3 : 1 },
          elevation: bordered ? 3 : 1,
        },
        style,
      ]}
    >
      <Image
        source={{ uri: resolvedAvatarUrl }}
        onError={() => setImageFailed(true)}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          imageStyle,
        ]}
      />
    </View>
  );
}
