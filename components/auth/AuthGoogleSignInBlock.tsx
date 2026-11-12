import SocialSignInRow from "@/components/auth/SocialSignInRow";
import AuthErrorBanner from "@/components/auth/AuthErrorBanner";
import AuthGoogleSignInBlockOAuth from "@/components/auth/AuthGoogleSignInBlockOAuth";
import { canUseGoogleAuthRequest } from "@/constants/googleAuth";
import {
  useGoogleSignInFallback,
  type GoogleSignInControls,
} from "@/hooks/useGoogleSignIn";
import { useAppleSignIn } from "@/hooks/useAppleSignIn";
import React from "react";
import { View } from "react-native";

type AuthGoogleSignInBlockProps = {
  variant: "signin" | "signup";
  disabled?: boolean;
  /** Return false to block the Google flow (e.g. missing terms consent). */
  beforeSignIn?: () => boolean;
};

function AuthGoogleSignInBlockFallback({
  variant,
  disabled,
  beforeSignIn,
}: AuthGoogleSignInBlockProps) {
  const google = useGoogleSignInFallback();
  return (
    <AuthGoogleSignInBlockContent
      variant={variant}
      google={google}
      disabled={disabled}
      beforeSignIn={beforeSignIn}
    />
  );
}

export default function AuthGoogleSignInBlock({
  variant,
  disabled,
  beforeSignIn,
}: AuthGoogleSignInBlockProps) {
  if (canUseGoogleAuthRequest()) {
    return (
      <AuthGoogleSignInBlockOAuth
        variant={variant}
        disabled={disabled}
        beforeSignIn={beforeSignIn}
      />
    );
  }

  return (
    <AuthGoogleSignInBlockFallback
      variant={variant}
      disabled={disabled}
      beforeSignIn={beforeSignIn}
    />
  );
}

type ContentProps = AuthGoogleSignInBlockProps & {
  google: GoogleSignInControls;
};

export function AuthGoogleSignInBlockContent({
  variant,
  google,
  disabled = false,
  beforeSignIn,
}: ContentProps) {
  const { signIn, error, clearError, isLoading } = google;
  const apple = useAppleSignIn();

  const caption =
    variant === "signin"
      ? "Or continue with"
      : "Or sign up with";

  const guard = () => {
    if (beforeSignIn && !beforeSignIn()) {
      return false;
    }
    return true;
  };

  return (
    <View>
      {/* Either provider can fail, and only one can be mid-flight at a time,
          so a single banner shows whichever spoke last. */}
      <AuthErrorBanner message={error || apple.error} />

      <SocialSignInRow
        caption={caption}
        disabled={disabled}
        showApple={apple.isAvailable}
        googleLoading={isLoading}
        onGooglePress={async () => {
          if (!guard()) {
            return;
          }
          apple.clearError();
          clearError();
          await signIn();
        }}
        appleLoading={apple.isLoading}
        onApplePress={async () => {
          if (!guard()) {
            return;
          }
          clearError();
          apple.clearError();
          await apple.signIn();
        }}
      />
    </View>
  );
}
