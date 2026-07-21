import TabBarIconShell from "@/components/navigation/TabBarIconShell";
import { useTabBarMetricsContext } from "@/components/navigation/TabBarMetricsContext";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

type ProfileTabIconProps = {
  focused: boolean;
  /** Seller Center uses RN tab labels; shopper uses TabBarIconShell labels. */
  sellOnly?: boolean;
};

function ProfileAvatar({
  focused,
  size,
  onPrimaryWhenFocused,
}: {
  focused: boolean;
  size: number;
  onPrimaryWhenFocused: boolean;
}) {
  const { user } = useAuth();
  const { colors } = useTheme();

  if (!user) {
    return (
      <Ionicons
        name={focused ? "person" : "person-outline"}
        size={size}
        color={
          focused
            ? onPrimaryWhenFocused
              ? colors.onPrimary
              : colors.primary
            : colors.iconMuted
        }
      />
    );
  }

  const ringColor = focused
    ? onPrimaryWhenFocused
      ? colors.onPrimary
      : colors.primary
    : "transparent";

  return (
    <View
      style={[
        styles.ring,
        {
          borderColor: ringColor,
          width: size + 2,
          height: size + 2,
          borderRadius: (size + 2) / 2,
        },
      ]}
    >
      <UserAvatar avatarUrl={user.avatar_url} gender={user.gender} size={size} />
    </View>
  );
}

export default function ProfileTabIcon({ focused, sellOnly = false }: ProfileTabIconProps) {
  const { iconSize } = useTabBarMetricsContext();
  const avatarSize = Math.round(iconSize * 0.92);

  // Seller Center tabs use React Navigation labels. TabBarIconShell would
  // double "Business" and its full slot width covers neighboring labels.
  if (sellOnly) {
    return <ProfileAvatar focused={focused} size={avatarSize} onPrimaryWhenFocused={false} />;
  }

  return (
    <TabBarIconShell focused={focused} title="Profile">
      <ProfileAvatar focused={focused} size={avatarSize} onPrimaryWhenFocused />
    </TabBarIconShell>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    overflow: "hidden",
  },
});
