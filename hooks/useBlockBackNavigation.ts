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
        removeBeforeRemoveListener();
        hardwareBackListener.remove();
      };
    }, [enabled, navigation]),
  );
}
