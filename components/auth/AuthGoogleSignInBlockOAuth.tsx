import {
  AuthGoogleSignInBlockContent,
} from "@/components/auth/AuthGoogleSignInBlock";
import { useGoogleSignInOAuth } from "@/hooks/useGoogleSignInOAuth";
import React from "react";

type Props = {
  variant: "signin" | "signup";
  disabled?: boolean;
};

export default function AuthGoogleSignInBlockOAuth({ variant, disabled }: Props) {
  const google = useGoogleSignInOAuth();
  return (
    <AuthGoogleSignInBlockContent
      variant={variant}
      google={google}
      disabled={disabled}
    />
  );
}
