import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "expo-router";
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

      const hardwareBackListener = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );

      return () => {
        navigation.setOptions({ gestureEnabled: true });
        removeBeforeRemoveListener();
        hardwareBackListener.remove();
      };
    }, [enabled, navigation]),
  );
}
