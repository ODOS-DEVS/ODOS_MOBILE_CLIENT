import {
  AuthGoogleSignInBlockContent,
} from "@/components/auth/AuthGoogleSignInBlock";
import { useGoogleSignInOAuth } from "@/hooks/useGoogleSignInOAuth";
import React from "react";

type Props = {
  variant: "signin" | "signup";
  disabled?: boolean;
  beforeSignIn?: () => boolean;
};

export default function AuthGoogleSignInBlockOAuth({
  variant,
  disabled,
  beforeSignIn,
}: Props) {
  const google = useGoogleSignInOAuth();
  return (
    <AuthGoogleSignInBlockContent
      variant={variant}
      google={google}
      disabled={disabled}
      beforeSignIn={beforeSignIn}
    />
  );
}
