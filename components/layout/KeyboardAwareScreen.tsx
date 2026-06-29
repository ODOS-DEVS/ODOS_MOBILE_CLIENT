import KeyboardAwareScrollView from "@/components/layout/KeyboardAwareScrollView";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type KeyboardAwareScreenProps = ScrollViewProps & {
  style?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
  avoidKeyboard?: boolean;
};

export default function KeyboardAwareScreen({
  style,
  keyboardVerticalOffset = 0,
  avoidKeyboard = true,
  children,
  ...scrollProps
}: KeyboardAwareScreenProps) {
  const scroll = <KeyboardAwareScrollView {...scrollProps}>{children}</KeyboardAwareScrollView>;

  if (!avoidKeyboard) {
    return <View style={[styles.flex, style]}>{scroll}</View>;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {scroll}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
