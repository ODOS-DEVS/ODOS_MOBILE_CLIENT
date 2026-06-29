import { Platform } from "react-native";

/** Approximate stacked header height below the status bar (ProfileHeader, etc.). */
export const DEFAULT_STACK_HEADER_HEIGHT = 56;

export function getKeyboardVerticalOffset(topInset = 0, headerHeight = DEFAULT_STACK_HEADER_HEIGHT) {
  return Platform.OS === "ios" ? topInset + headerHeight : 0;
}
