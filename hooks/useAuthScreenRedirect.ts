import { useAuth } from "@/context/AuthContext";
import {
  exitAuthToHome,
  goToEmailVerification,
} from "@/utils/authNavigation";
import { useRouter } from "expo-router";
import { useEffect } from "react";

/** Sends authenticated users to tabs or verification. */
export function useAuthScreenRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!user.is_verified) {
      goToEmailVerification(router, user.email);
      return;
    }

    exitAuthToHome(router);
  }, [router, user]);
}
