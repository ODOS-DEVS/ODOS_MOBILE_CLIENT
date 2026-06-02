import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import React from "react";

type SocialLoginButtonsProps = {
  onGooglePress?: () => void | Promise<void>;
  googleLoading?: boolean;
};

/** @deprecated Prefer GoogleSignInButton directly. Kept for any legacy imports. */
const SocialLoginButtons = ({
  onGooglePress,
  googleLoading = false,
}: SocialLoginButtonsProps) => {
  if (!onGooglePress) {
    return null;
  }

  return (
    <GoogleSignInButton
      onPress={onGooglePress}
      loading={googleLoading}
      disabled={!onGooglePress}
    />
  );
};

export default SocialLoginButtons;
