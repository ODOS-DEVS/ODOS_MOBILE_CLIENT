import AuthErrorBanner from "@/components/auth/AuthErrorBanner";
import AuthFormCard from "@/components/auth/AuthFormCard";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import TextInputField from "@/components/TextInputField";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import Fonts from "@/constants/Fonts";
import { rMS, rV } from "@/styles/responsive";
import {
  openForgotPassword,
  resetAuthStackToSignIn,
} from "@/utils/authNavigation";
import {
  clearPasswordResetSession,
  getPasswordResetToken,
  loadPasswordResetToken,
} from "@/utils/passwordResetSession";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CreatePasswordScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    email?: string | string[];
    resetToken?: string | string[];
  }>();
  const { resetPassword, isResettingPassword } = useAuth();
  const { showToast } = useToast();
  const routeEmail = Array.isArray(params.email) ? params.email[0] : params.email;
  const legacyRouteToken = Array.isArray(params.resetToken)
    ? params.resetToken[0]
    : params.resetToken;
  const [resetToken, setResetToken] = useState<string | null>(
    () => getPasswordResetToken(routeEmail) ?? legacyRouteToken ?? null,
  );
  const [isResolvingSession, setIsResolvingSession] = useState(!resetToken);
  const [sessionMissing, setSessionMissing] = useState(false);
  useBlockBackNavigation(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadPasswordResetToken(routeEmail);
      if (cancelled) return;
      const next = stored ?? legacyRouteToken ?? null;
      setResetToken(next);
      setSessionMissing(!routeEmail || !next);
      setIsResolvingSession(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [legacyRouteToken, routeEmail]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const restartReset = () => {
    clearPasswordResetSession();
    openForgotPassword(router, routeEmail, { replace: true });
  };

  const handleSubmit = async () => {
    setPasswordError("");
    setConfirmPasswordError("");
    setGeneralError("");

    if (!routeEmail || !resetToken) {
      setSessionMissing(true);
      return;
    }

    if (!password) {
      setPasswordError("Enter your new password.");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    const result = await resetPassword(routeEmail, resetToken, password);
    if (!result.success) {
      setPasswordError(result.fieldErrors?.password || "");
      setGeneralError(
        result.fieldErrors?.general ||
          result.fieldErrors?.password ||
          "We couldn't update your password right now.",
      );
      return;
    }

    clearPasswordResetSession();
    showToast(result.message || "Password updated successfully.");
    resetAuthStackToSignIn(router);
  };

  if (isResolvingSession) {
    return (
      <AuthScreenLayout
        mode="plain"
        plain={{
          title: "Create new password",
          subtitle: "Checking your reset session…",
          onBack: restartReset,
        }}
      >
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AuthScreenLayout>
    );
  }

  if (sessionMissing) {
    return (
      <AuthScreenLayout
        mode="plain"
        plain={{
          title: "Reset session expired",
          subtitle:
            "This password reset link is no longer valid. Request a new code to continue.",
          onBack: restartReset,
        }}
      >
        <AuthFormCard>
          <PrimaryButton title="Start password reset again" onPress={restartReset} />
        </AuthFormCard>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      mode="plain"
      plain={{
        title: "Create new password",
        subtitle:
          "Choose a strong password you haven't used on ODOS before. Finish here so your reset stays valid.",
        onBack: restartReset,
      }}
    >
      <AuthFormCard>
        <TextInputField
          label="New password"
          icon="lock-closed-outline"
          placeholder="At least 8 characters"
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

        <AuthErrorBanner message={generalError} />

        <PrimaryButton
          title="Save new password"
          onPress={handleSubmit}
          isLoading={isResettingPassword}
          disabled={isResettingPassword || !password || !confirmPassword}
          className="mt-2"
        />
      </AuthFormCard>

      <TouchableOpacity onPress={restartReset} style={styles.restart}>
        <Text style={[styles.link, { color: colors.primary }]}>
          Start password reset again
        </Text>
      </TouchableOpacity>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    minHeight: rV(120),
    alignItems: "center",
    justifyContent: "center",
  },
  restart: {
    alignItems: "center",
    marginTop: rV(22),
    paddingVertical: rV(8),
  },
  link: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
});
