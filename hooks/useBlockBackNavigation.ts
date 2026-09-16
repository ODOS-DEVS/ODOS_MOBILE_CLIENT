// Both come from expo-router: as of SDK 56 expo-router vendors its own copy of
// react-navigation and refuses to run alongside the standalone packages.
import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback } from "react";
import { BackHandler } from "react-native";

export function useBlockBackNavigation(enabled = true) {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return undefined;
      }

      // Disabling the interactive swipe-back gesture (rather than relying solely on
      // the beforeRemove listener below) avoids a native-stack race where the native
      // pop animation can start — and finish — before the JS beforeRemove listener's
      // preventDefault() is processed, which otherwise surfaces as "screen was
      // removed natively but didn't get removed from JS state".
      navigation.setOptions({ gestureEnabled: false });

      const removeBeforeRemoveListener = navigation.addListener(
        "beforeRemove",
        (event) => {
          const actionType = event.data.action.type;
          if (actionType === "GO_BACK" || actionType.startsWith("POP")) {
            event.preventDefault();
          }
        },
      );

      // Swallow the press only when there is something to pop -- that is the
      // case this hook exists for, and beforeRemove above already refuses it.
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
        removeBeforeRemoveListener();
        hardwareBackListener.remove();
      };
    }, [enabled, navigation]),
  );
}
