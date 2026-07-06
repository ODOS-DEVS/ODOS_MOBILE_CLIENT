import KeyboardAwareScrollView from "@/components/layout/KeyboardAwareScrollView";
import React from "react";
import {
  Platform,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type KeyboardAwareScreenProps = ScrollViewProps & {
  style?: StyleProp<ViewStyle>;
  avoidKeyboard?: boolean;
  enableAutomaticInsets?: boolean;
};

export default function KeyboardAwareScreen({
  style,
  avoidKeyboard = true,
  enableAutomaticInsets,
  children,
  ...scrollProps
}: KeyboardAwareScreenProps) {
  const shouldUseInsets =
    avoidKeyboard && (enableAutomaticInsets ?? Platform.OS === "ios");

  return (
    <View style={[styles.flex, style]}>
      <KeyboardAwareScrollView
        {...scrollProps}
        enableAutomaticInsets={shouldUseInsets}
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
