import { useAuth } from "@/context/AuthContext";
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
      router.replace({
        pathname: "/verification",
        params: { email: user.email },
      });
      return;
    }

    router.replace("/(root)/(tabs)");
  }, [router, user]);
}
