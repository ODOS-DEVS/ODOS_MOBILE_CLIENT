// Both come from expo-router: it vendors its own copy of react-navigation and
// refuses to run alongside the standalone packages.
import { useFocusEffect, useNavigation, usePreventRemove } from "expo-router";
import { useCallback } from "react";
import { BackHandler } from "react-native";

export function useBlockBackNavigation(enabled = true) {
  const navigation = useNavigation();

  /**
   * Blocks the screen from being popped.
   *
   * This used to be a `beforeRemove` listener, which React Navigation 7
   * removed — expo-router's vendored copy no longer emits it at all. The
   * replacement is `usePreventRemove`, which marks the route as non-removable
   * and reports blocked actions through a `removePrevented` event.
   *
   * The action filter is carried over deliberately. Every caller is a screen
   * that later navigates away under its own control — sign-in to the app,
   * payment-return once verification settles — and those transitions are
   * `REPLACE`, which also removes this route. Blocking removal outright would
   * strand the user on the screen they just finished with, so anything that
   * is not a back or pop is re-dispatched unchanged.
   */
  usePreventRemove(enabled, ({ data, repeat }) => {
    const actionType = data.action.type;
    if (actionType === "GO_BACK" || actionType.startsWith("POP")) {
      return;
    }
    repeat();
  });

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return undefined;
      }

      // Disabling the interactive swipe-back gesture as well avoids a
      // native-stack race where the native pop animation can start — and
      // finish — before JS processes the block, which otherwise surfaces as
      // "screen was removed natively but didn't get removed from JS state".
      navigation.setOptions({ gestureEnabled: false });

      // Swallow the press only when there is something to pop -- that is the
      // case this hook exists for, and the prevention above already refuses it.
      //
      // When there is nothing to pop, returning true would not protect anything:
      // these screens are reached by replace(), so the only default behaviour
      // left to suppress is Android exiting the app. Doing that traps the user
      // on the first screen they see, where back is the first thing many people
      // press, and an app that ignores it reads as frozen.
      const hardwareBackListener = BackHandler.addEventListener(
        "hardwareBackPress",
        () => navigation.canGoBack(),
      );

      return () => {
        navigation.setOptions({ gestureEnabled: true });
        hardwareBackListener.remove();
      };
    }, [enabled, navigation]),
  );
}
