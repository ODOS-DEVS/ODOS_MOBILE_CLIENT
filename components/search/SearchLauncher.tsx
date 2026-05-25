import { router } from "expo-router";
import React from "react";
import { type ViewStyle } from "react-native";
import SearchField from "./SearchField";

type SearchLauncherProps = {
  placeholder?: string;
  containerStyle?: ViewStyle;
  params?: Record<string, string | number | undefined>;
};

export default function SearchLauncher({
  placeholder,
  containerStyle,
  params,
}: SearchLauncherProps) {
  return (
    <SearchField
      placeholder={placeholder}
      containerStyle={containerStyle}
      onPress={() =>
        router.push({
          pathname: "/screens/search" as any,
          params: params as any,
        })
      }
    />
  );
}
