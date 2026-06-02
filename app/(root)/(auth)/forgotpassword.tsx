import AuthErrorBanner from "@/components/auth/AuthErrorBanner";
import AuthFormCard from "@/components/auth/AuthFormCard";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import TextInputField from "@/components/TextInputField";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import Fonts from "@/constants/Fonts";
import { rMS, rV } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const { requestPasswordResetCode, isRequestingPasswordReset } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    const routeEmail = Array.isArray(params.email) ? params.email[0] : params.email;
    if (routeEmail) {
      setEmail(routeEmail);
    }
  }, [params.email]);

  const handleNext = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    setEmailError("");
    setGeneralError("");

    if (!trimmedEmail) {
      setEmailError("Enter your email address.");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    const result = await requestPasswordResetCode(trimmedEmail);
    if (!result.success) {
      setGeneralError(result.fieldErrors?.general || "We couldn't send a reset code.");
      return;
    }

    showToast(result.message || "Reset code sent.");
    router.replace({
      pathname: "/verification",
      params: {
        email: trimmedEmail,
        mode: "password-reset",
      },
    });
  };

  return (
    <AuthScreenLayout
      mode="plain"
      plain={{
        title: "Forgot password?",
        subtitle:
          "Enter the email on your account. We'll send a 6-digit code to reset your password.",
        onBack: () => goBackOr(router, { fallback: "/signin" }),
      }}
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

        <AuthErrorBanner message={generalError} />

        <PrimaryButton
          title="Send reset code"
          onPress={handleNext}
          isLoading={isRequestingPasswordReset}
          disabled={isRequestingPasswordReset || !email.trim()}
          className="mt-2"
        />
      </AuthFormCard>

      <TouchableOpacity
        onPress={() => router.replace("/signin")}
        style={styles.backToSignIn}
      >
        <Text style={[styles.link, { color: colors.primary }]}>Back to sign in</Text>
      </TouchableOpacity>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  backToSignIn: {
    alignItems: "center",
    marginTop: rV(22),
    paddingVertical: rV(8),
  },
  link: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
});
