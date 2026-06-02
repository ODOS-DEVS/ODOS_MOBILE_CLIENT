import AuthConsentCheckbox from "@/components/auth/AuthConsentCheckbox";
import AuthDivider from "@/components/auth/AuthDivider";
import AuthErrorBanner from "@/components/auth/AuthErrorBanner";
import AuthFormCard from "@/components/auth/AuthFormCard";
import AuthGoogleSignInBlock from "@/components/auth/AuthGoogleSignInBlock";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import TextInputField from "@/components/TextInputField";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuthScreenRedirect } from "@/hooks/useAuthScreenRedirect";
import { rMS, rV } from "@/styles/responsive";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isSigningUp, signUp } = useAuth();
  useAuthScreenRedirect();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasConsented, setHasConsented] = useState(false);
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [consentError, setConsentError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const canSubmitForm =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    hasConsented;

  const handleSignUp = async () => {
    let hasError = false;
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    setFullNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setConsentError("");
    setGeneralError("");

    if (!trimmedFullName) {
      setFullNameError("Enter your full name.");
      hasError = true;
    } else if (trimmedFullName.length < 2) {
      setFullNameError("Full name must be at least 2 characters.");
      hasError = true;
    }

    if (!trimmedEmail) {
      setEmailError("Enter your email address.");
      hasError = true;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Create a password.");
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Confirm your password.");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      hasError = true;
    }

    if (!hasConsented) {
      setConsentError("Please accept the Terms and Privacy Policy to continue.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const result = await signUp({ fullName, email, password });

    if (result.success) {
      if (result.requiresVerification) {
        router.replace({
          pathname: "/verification",
          params: { email: email.trim().toLowerCase() },
        });
      }
      return;
    }

    setFullNameError(result.fieldErrors?.fullName || "");
    setEmailError(result.fieldErrors?.email || "");
    setPasswordError(result.fieldErrors?.password || "");
    setGeneralError(result.fieldErrors?.general || result.message || "");
  };

  return (
    <AuthScreenLayout
      hero={{
        title: "Sign up",
        header: "Create your account",
        subtitle:
          "Join ODOS to save favourites, track deliveries, and pay with your in-app wallet.",
      }}
    >
      <AuthFormCard>
        <TextInputField
          label="Full name"
          icon="person-outline"
          placeholder="How should we greet you?"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (fullNameError) setFullNameError("");
            if (generalError) setGeneralError("");
          }}
          errorMessage={fullNameError}
          autoCapitalize="words"
        />
        <TextInputField
          label="Email"
          icon="mail-outline"
          placeholder="you@example.com"
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError("");
            if (generalError) setGeneralError("");
          }}
          errorMessage={emailError}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInputField
          label="Password"
          icon="lock-closed-outline"
          placeholder="At least 8 characters"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError("");
            if (confirmPasswordError && confirmPassword) setConfirmPasswordError("");
            if (generalError) setGeneralError("");
          }}
          errorMessage={passwordError}
          helperText="Use 8+ characters with a mix you will remember."
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInputField
          label="Confirm password"
          icon="shield-checkmark-outline"
          placeholder="Re-enter your password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) setConfirmPasswordError("");
            if (generalError) setGeneralError("");
          }}
          errorMessage={confirmPasswordError}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <AuthConsentCheckbox
          checked={hasConsented}
          onToggle={(next) => {
            setHasConsented(next);
            if (consentError) setConsentError("");
          }}
          error={consentError}
        />

        <AuthErrorBanner message={generalError} />

        <PrimaryButton
          title="Create account"
          onPress={handleSignUp}
          isLoading={isSigningUp}
          disabled={isSigningUp || !canSubmitForm}
          className="mt-2"
        />
      </AuthFormCard>

      <View style={styles.switchRow}>
        <Text style={[styles.switchMuted, { color: colors.textMuted }]}>
          Already have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => router.replace("/signin")}>
          <Text style={[styles.switchAction, { color: colors.primary }]}>Sign in</Text>
        </TouchableOpacity>
      </View>

      <AuthDivider />
      <AuthGoogleSignInBlock variant="signup" disabled={!hasConsented} />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: rV(20),
  },
  switchMuted: {
    fontFamily: Fonts.text,
    fontSize: rMS(14),
  },
  switchAction: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
});
