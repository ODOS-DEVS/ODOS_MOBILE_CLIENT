import TabBarIconShell from "@/components/navigation/TabBarIconShell";
import { useTabBarMetricsContext } from "@/components/navigation/TabBarMetricsContext";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Image, type ImageSourcePropType } from "react-native";

type TabBarImageIconProps = {
  focused: boolean;
  source: ImageSourcePropType;
  title: string;
};

export default function TabBarImageIcon({
  focused,
  source,
  title,
}: TabBarImageIconProps) {
  const { colors } = useTheme();
  const { iconSize } = useTabBarMetricsContext();

  return (
    <TabBarIconShell focused={focused} title={title}>
      <Image
        source={source}
        style={{
          width: iconSize,
          height: iconSize,
          tintColor: focused ? colors.onInverseSurface : colors.iconMuted,
        }}
        resizeMode="contain"
      />
    </TabBarIconShell>
  );
}
