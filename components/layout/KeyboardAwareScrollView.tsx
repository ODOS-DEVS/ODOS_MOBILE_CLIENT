import React, { forwardRef } from "react";
import { Platform, ScrollView, type ScrollViewProps } from "react-native";

const KeyboardAwareScrollView = forwardRef<ScrollView, ScrollViewProps>(function KeyboardAwareScrollView(
  {
    automaticallyAdjustKeyboardInsets = true,
    keyboardShouldPersistTaps = "handled",
    keyboardDismissMode,
    nestedScrollEnabled = true,
    contentContainerStyle,
    ...props
  },
  ref,
) {
  return (
    <ScrollView
      ref={ref}
      automaticallyAdjustKeyboardInsets={automaticallyAdjustKeyboardInsets}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={
        keyboardDismissMode ?? (Platform.OS === "ios" ? "interactive" : "on-drag")
      }
      nestedScrollEnabled={nestedScrollEnabled}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      {...props}
    />
  );
});

export default KeyboardAwareScrollView;
