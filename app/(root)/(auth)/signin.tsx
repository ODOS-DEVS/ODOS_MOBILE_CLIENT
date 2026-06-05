import AuthDivider from "@/components/auth/AuthDivider";
import AuthErrorBanner from "@/components/auth/AuthErrorBanner";
import AuthFormCard from "@/components/auth/AuthFormCard";
import AuthGoogleSignInBlock from "@/components/auth/AuthGoogleSignInBlock";
import AuthLegalFooter from "@/components/auth/AuthLegalFooter";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import TextInputField from "@/components/TextInputField";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuthScreenRedirect } from "@/hooks/useAuthScreenRedirect";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { rMS, rV } from "@/styles/responsive";
import {
  exitAuthToHome,
  goToEmailVerification,
  goToSignUp,
  openForgotPassword,
} from "@/utils/authNavigation";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isSigningIn, signIn } = useAuth();
  useAuthScreenRedirect();
  useBlockBackNavigation(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const handleSignIn = async () => {
    let hasError = false;
    const trimmedEmail = email.trim();

    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (!trimmedEmail) {
      setEmailError("Enter your email address.");
      hasError = true;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Enter your password.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const result = await signIn({ email, password });

    if (result.success) {
      if (result.requiresVerification) {
        goToEmailVerification(router, email.trim().toLowerCase());
      }
      return;
    }

    setEmailError(result.fieldErrors?.email || "");
    setPasswordError(result.fieldErrors?.password || "");
    setGeneralError(result.fieldErrors?.general || result.message || "");
  };

  return (
    <AuthScreenLayout
      hero={{
        title: "Sign in",
        header: "Welcome back",
        subtitle:
          "Shop local stores, track orders, and use your wallet — all in one place.",
      }}
      footer={<AuthLegalFooter action="signin" />}
    >
      <AuthFormCard>
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
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError("");
            if (generalError) setGeneralError("");
          }}
          errorMessage={passwordError}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <AuthErrorBanner message={generalError} />

        <View style={styles.row}>
          <TouchableOpacity hitSlop={8}>
            <Text style={[styles.rowLink, { color: colors.textMuted }]}>
              Remember me
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => openForgotPassword(router)}
          >
            <Text style={[styles.rowLinkBold, { color: colors.primary }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title="Sign in"
          onPress={handleSignIn}
          isLoading={isSigningIn}
          disabled={isSigningIn || !email.trim() || !password}
          className="mt-2"
        />
      </AuthFormCard>

      <View style={styles.switchRow}>
        <Text style={[styles.switchMuted, { color: colors.textMuted }]}>
          {"Don't have an account? "}
        </Text>
        <TouchableOpacity onPress={() => goToSignUp(router)}>
          <Text style={[styles.switchAction, { color: colors.primary }]}>Sign up</Text>
        </TouchableOpacity>
      </View>

      <AuthDivider />
      <AuthGoogleSignInBlock variant="signin" />

      <TouchableOpacity
        onPress={() => exitAuthToHome(router)}
        style={styles.browseLink}
      >
        <Text style={[styles.browseText, { color: colors.primary }]}>
          Browse without signing in
        </Text>
      </TouchableOpacity>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rV(4),
    paddingHorizontal: rMS(2),
  },
  rowLink: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
  },
  rowLinkBold: {
    fontFamily: Fonts.title,
    fontSize: rMS(13),
  },
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
  browseLink: {
    alignItems: "center",
    marginTop: rV(18),
    paddingVertical: rV(6),
  },
  browseText: {
    fontFamily: Fonts.title,
    fontSize: rMS(14),
  },
});
