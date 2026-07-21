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
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { rMS, rV } from "@/styles/responsive";
import { goToEmailVerification, goToSignIn } from "@/utils/authNavigation";
import { buildFullName, validateNameParts } from "@/utils/fullName";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isSigningUp, signUp } = useAuth();
  useAuthScreenRedirect();
  useBlockBackNavigation(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasConsented, setHasConsented] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [consentError, setConsentError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const canSubmitForm =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    hasConsented;

  const handleSignUp = async () => {
    let hasError = false;
    const trimmedEmail = email.trim();
    const fullName = buildFullName({ firstName, lastName, otherNames });

    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setConsentError("");
    setGeneralError("");

    const nameErrors = validateNameParts({ firstName, lastName });
    if (nameErrors) {
      if (nameErrors.firstName) setFirstNameError(nameErrors.firstName);
      if (nameErrors.lastName) setLastNameError(nameErrors.lastName);
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
        goToEmailVerification(router, email.trim().toLowerCase());
      }
      return;
    }

    setFirstNameError(result.fieldErrors?.fullName || "");
    setLastNameError("");
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
          label="First name"
          icon="person-outline"
          placeholder="First name"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            if (firstNameError) setFirstNameError("");
            if (generalError) setGeneralError("");
          }}
          errorMessage={firstNameError}
          autoCapitalize="words"
        />
        <TextInputField
          label="Last name"
          icon="person-outline"
          placeholder="Last name"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            if (lastNameError) setLastNameError("");
            if (generalError) setGeneralError("");
          }}
          errorMessage={lastNameError}
          autoCapitalize="words"
        />
        <TextInputField
          label="Other names (optional)"
          icon="person-outline"
          placeholder="Middle or other names"
          value={otherNames}
          onChangeText={(text) => {
            setOtherNames(text);
            if (generalError) setGeneralError("");
          }}
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
        <TouchableOpacity onPress={() => goToSignIn(router)}>
          <Text style={[styles.switchAction, { color: colors.primary }]}>Sign in</Text>
        </TouchableOpacity>
      </View>

      <AuthDivider />
      <AuthGoogleSignInBlock
        variant="signup"
        beforeSignIn={() => {
          if (hasConsented) {
            if (consentError) {
              setConsentError("");
            }
            return true;
          }
          setConsentError("Please accept the Terms and Privacy Policy to continue.");
          return false;
        }}
      />
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
