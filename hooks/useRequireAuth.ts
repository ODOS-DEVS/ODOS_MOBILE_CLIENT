import { useAuth } from "@/context/AuthContext";
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
  const { user } = useAuth();
  const router = useRouter();

  const requireAuth = useCallback(
    (options?: RequireAuthOptions) => {
      if (user) {
        return true;
      }

      Alert.alert(
        options?.title || "Sign in required",
        options?.message ||
          "Create an account or log in to keep going with this part of ODOS.",
        [
          {
            text: options?.cancelLabel || "Maybe later",
            style: "cancel",
            onPress: options?.onCancel,
          },
          {
            text: "Create account",
            onPress: () => router.push("/(root)/(auth)/signup"),
          },
          {
            text: "Log in",
            onPress: () => router.push("/(root)/(auth)/signin"),
          },
        ],
      );

      return false;
    },
    [router, user],
  );

  return { requireAuth, user };
}
