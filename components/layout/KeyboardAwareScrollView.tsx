import React, { forwardRef } from "react";
import { Platform, ScrollView, type ScrollViewProps } from "react-native";

type KeyboardAwareScrollViewProps = ScrollViewProps & {
  /**
   * When true (default on iOS), ScrollView adjusts its own insets for the keyboard.
   * Disable this when an outer KeyboardAvoidingView already handles the keyboard.
   */
  enableAutomaticInsets?: boolean;
};

const KeyboardAwareScrollView = forwardRef<ScrollView, KeyboardAwareScrollViewProps>(
  function KeyboardAwareScrollView(
    {
      automaticallyAdjustKeyboardInsets,
      enableAutomaticInsets = Platform.OS === "ios",
      keyboardShouldPersistTaps = "handled",
      keyboardDismissMode,
      nestedScrollEnabled = true,
      contentContainerStyle,
      ...props
    },
    ref,
  ) {
    const shouldAdjustInsets =
      automaticallyAdjustKeyboardInsets ?? enableAutomaticInsets;

    return (
      <ScrollView
        ref={ref}
        automaticallyAdjustKeyboardInsets={shouldAdjustInsets}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyboardDismissMode={
          keyboardDismissMode ?? (Platform.OS === "ios" ? "interactive" : "on-drag")
        }
        nestedScrollEnabled={nestedScrollEnabled}
        contentContainerStyle={contentContainerStyle}
        {...props}
      />
    );
  },
);

export default KeyboardAwareScrollView;
