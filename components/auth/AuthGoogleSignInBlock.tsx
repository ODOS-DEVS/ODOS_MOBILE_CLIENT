import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import AuthErrorBanner from "@/components/auth/AuthErrorBanner";
import AuthGoogleSignInBlockOAuth from "@/components/auth/AuthGoogleSignInBlockOAuth";
import { canUseGoogleAuthRequest } from "@/constants/googleAuth";
import {
  useGoogleSignInFallback,
  type GoogleSignInControls,
} from "@/hooks/useGoogleSignIn";
import React from "react";
import { View } from "react-native";

type AuthGoogleSignInBlockProps = {
  variant: "signin" | "signup";
  disabled?: boolean;
};

function AuthGoogleSignInBlockFallback({
  variant,
  disabled,
}: AuthGoogleSignInBlockProps) {
  const google = useGoogleSignInFallback();
  return (
    <AuthGoogleSignInBlockContent variant={variant} google={google} disabled={disabled} />
  );
}

export default function AuthGoogleSignInBlock({
  variant,
  disabled,
}: AuthGoogleSignInBlockProps) {
  if (canUseGoogleAuthRequest()) {
    return <AuthGoogleSignInBlockOAuth variant={variant} disabled={disabled} />;
  }

  return <AuthGoogleSignInBlockFallback variant={variant} disabled={disabled} />;
}

type ContentProps = AuthGoogleSignInBlockProps & {
  google: GoogleSignInControls;
};

export function AuthGoogleSignInBlockContent({
  variant,
  google,
  disabled = false,
}: ContentProps) {
  const { signIn, error, clearError, isLoading } = google;

  const label = variant === "signin" ? "Continue with Google" : "Sign up with Google";
  const hint =
    variant === "signin"
      ? "Quick access with your Google account"
      : "We'll create your ODOS account for you";

  return (
    <View>

      <AuthErrorBanner message={error} />

      <GoogleSignInButton
        onPress={async () => {
          clearError();
          await signIn();
        }}
        loading={isLoading}
        disabled={disabled}
        label={label}
        hint={
          disabled
            ? "Accept the terms above to continue"
            : hint
        }
      />
    </View>
  );
}
