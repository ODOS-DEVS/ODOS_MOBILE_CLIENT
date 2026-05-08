import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

type SearchLauncherProps = {
  placeholder?: string;
  containerStyle?: ViewStyle;
  params?: Record<string, string | number | undefined>;
};

export default function SearchLauncher({
  placeholder = "Search products, stores, categories...",
  containerStyle,
  params,
}: SearchLauncherProps) {
  const { horizontalPadding } = useResponsive();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() =>
        router.push({
          pathname: "/screens/search" as any,
          params: params as any,
        })
      }
      style={[
        styles.wrapper,
        { marginHorizontal: horizontalPadding },
        containerStyle,
      ]}
    >
      <Ionicons
        name="search-outline"
        size={rMS(18)}
        color={AppColors.secondary}
        style={styles.icon}
      />
      <Text numberOfLines={1} style={styles.placeholder}>
        {placeholder}
      </Text>
      <Ionicons
        name="options-outline"
        size={rMS(18)}
        color={AppColors.subtext[100]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: rV(14),
    minHeight: rMS(48),
    borderRadius: rMS(14),
    borderWidth: 1,
    borderColor: "#D8DEE6",
    backgroundColor: AppColors.white,
    paddingHorizontal: rS(14),
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: rS(10),
  },
  placeholder: {
    flex: 1,
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
  },
});
