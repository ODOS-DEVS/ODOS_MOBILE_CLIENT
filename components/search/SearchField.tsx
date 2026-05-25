import { AppColors } from "@/constants/Colors";
import { rMS, rS, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View, type ViewStyle } from "react-native";
import { searchFieldStyles } from "./searchFieldStyles";

type SearchFieldProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (value: string) => void;
  onPress?: () => void;
  onSubmit?: () => void;
  containerStyle?: ViewStyle;
  embedded?: boolean;
  size?: "default" | "large";
  autoFocus?: boolean;
  showClear?: boolean;
};

export default function SearchField({
  placeholder = "Search products, stores & more",
  value = "",
  onChangeText,
  onPress,
  onSubmit,
  containerStyle,
  embedded = false,
  size = "default",
  autoFocus = false,
  showClear = true,
}: SearchFieldProps) {
  const { horizontalPadding } = useResponsive();
  const isLauncher = Boolean(onPress && !onChangeText);
  const isLarge = size === "large";

  const wrapperStyle = [
    searchFieldStyles.wrapper,
    isLarge ? searchFieldStyles.wrapperLarge : null,
    embedded
      ? searchFieldStyles.wrapperEmbedded
      : { marginHorizontal: horizontalPadding },
    containerStyle,
  ];

  const body = (
    <>
      <View
        style={[
          searchFieldStyles.iconShell,
          isLarge ? searchFieldStyles.iconShellLarge : null,
        ]}
      >
        <Ionicons
          name="search"
          size={rMS(isLarge ? 18 : 16)}
          color={AppColors.primary}
        />
      </View>

      {isLauncher ? (
        <Text
          numberOfLines={1}
          style={[
            searchFieldStyles.placeholder,
            isLarge ? searchFieldStyles.placeholderLarge : null,
          ]}
        >
          {placeholder}
        </Text>
      ) : (
        <>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            style={[
              searchFieldStyles.input,
              isLarge ? searchFieldStyles.inputLarge : null,
            ]}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={autoFocus}
            onSubmitEditing={onSubmit}
          />
          {showClear && value.length > 0 ? (
            <TouchableOpacity
              style={searchFieldStyles.clearBtn}
              onPress={() => onChangeText?.("")}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={rMS(18)} color="#D1D5DB" />
            </TouchableOpacity>
          ) : null}
        </>
      )}
    </>
  );

  if (isLauncher) {
    return (
      <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={wrapperStyle}>
        {body}
      </TouchableOpacity>
    );
  }

  return <View style={wrapperStyle}>{body}</View>;
}
