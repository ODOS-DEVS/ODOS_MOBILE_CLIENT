import { useAuth } from "@/context/AuthContext";
import { openSignInFromApp, openSignUpFromApp } from "@/utils/authNavigation";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";

type RequireAuthOptions = {
  title?: string;
  message?: string;
  cancelLabel?: string;
  onCancel?: () => void;
};

export function useRequireAuth() {
  const { user, isHydrating } = useAuth();
  const router = useRouter();

  const requireAuth = useCallback(
    (options?: RequireAuthOptions) => {
      if (isHydrating) {
        return false;
      }

      if (user) {
        return true;
      }

      Alert.alert(
        options?.title || "Sign in required",
        options?.message ||
          "Create an account or log in to save favourites, manage orders, and check out.",
        [
          {
            text: options?.cancelLabel || "Maybe later",
            style: "cancel",
            onPress: options?.onCancel,
          },
          {
            text: "Sign Up",
            onPress: () => openSignUpFromApp(router),
          },
          {
            text: "Sign In",
            onPress: () => openSignInFromApp(router),
          },
        ],
      );

      return false;
    },
    [isHydrating, router, user],
  );

  return { requireAuth, user, isHydrating };
}
