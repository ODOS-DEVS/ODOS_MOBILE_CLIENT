import AuthErrorBanner from "@/components/auth/AuthErrorBanner";
import AuthFormCard from "@/components/auth/AuthFormCard";
import EmailVerificationSuccess from "@/components/auth/EmailVerificationSuccess";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";
import OtpCodeInput, { OTP_LENGTH } from "@/components/auth/OtpCodeInput";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function VerificationScreen() {
  const { colors } = useTheme();
  const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ""));
  const [generalError, setGeneralError] = useState("");
  const [phase, setPhase] = useState<"input" | "success">("input");
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string | string[];
    mode?: string | string[];
  }>();
  const { showToast } = useToast();
  const {
    user,
    isVerifyingEmail,
    isResendingVerificationCode,
    isVerifyingResetCode,
    isRequestingPasswordReset,
    verifyEmail,
    resendVerificationCode,
    requestPasswordResetCode,
    verifyPasswordResetCode,
  } = useAuth();
  const routeEmail = Array.isArray(params.email) ? params.email[0] : params.email;
  const routeMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const isPasswordResetMode = routeMode === "password-reset";
  useBlockBackNavigation(true);
  const displayEmail = routeEmail || user?.email || "your email";
  const joinedCode = otp.join("");

  useEffect(() => {
    if (!isPasswordResetMode && user?.is_verified) {
      router.replace("/(root)/(tabs)");
    }
  }, [isPasswordResetMode, router, user?.is_verified]);

  const handleContinue = async () => {
    if (joinedCode.length !== OTP_LENGTH) {
      setGeneralError("Enter the full 6-digit code.");
      return;
    }

    if (isPasswordResetMode) {
      if (!routeEmail) {
        setGeneralError("We couldn't tell which account you're resetting.");
        return;
      }

      const result = await verifyPasswordResetCode(routeEmail, joinedCode);
      if (result.success && result.resetToken) {
        showToast("Reset code confirmed.");
        router.replace({
          pathname: "/createpassowrd",
          params: {
            email: routeEmail,
            resetToken: result.resetToken,
          },
        });
        return;
      }

      setGeneralError(
        result.fieldErrors?.general || "That reset code could not be verified.",
      );
      return;
    }

    const result = await verifyEmail(joinedCode);
    if (result.success) {
      setPhase("success");
      return;
    }

    setGeneralError(result.fieldErrors?.general || "That code could not be verified.");
  };

  const handleResend = async () => {
    setGeneralError("");

    if (isPasswordResetMode) {
      if (!routeEmail) {
        setGeneralError("We couldn't tell which account you're resetting.");
        return;
      }

      const result = await requestPasswordResetCode(routeEmail);
      if (result.success) {
        showToast(result.message || "A new reset code is on the way.");
        setOtp(Array.from({ length: OTP_LENGTH }, () => ""));
        return;
      }

      setGeneralError(
        result.fieldErrors?.general || "We couldn't send a new reset code right now.",
      );
      return;
    }

    const result = await resendVerificationCode();
    if (result.success) {
      showToast(result.message || "A new code is on the way.");
      setOtp(Array.from({ length: OTP_LENGTH }, () => ""));
      return;
    }

    setGeneralError(
      result.fieldErrors?.general || "We couldn't send a new code right now.",
    );
  };

  if (!isPasswordResetMode && phase === "success") {
    return (
      <EmailVerificationSuccess
        email={displayEmail}
        onContinue={() => router.replace("/(root)/(tabs)")}
      />
    );
  }

  return (
    <AuthScreenLayout
      mode="plain"
      plain={{
        title: isPasswordResetMode ? "Check your email" : "Verify your email",
        subtitle: isPasswordResetMode
          ? `Enter the 6-digit reset code we sent to ${displayEmail}.`
          : `Enter the 6-digit code we sent to ${displayEmail} to activate your account.`,
        onBack: () => {
          if (isPasswordResetMode) {
            router.replace({
              pathname: "/forgotpassword",
              params: routeEmail ? { email: routeEmail } : undefined,
            });
            return;
          }
          router.replace("/signin");
        },
      }}
    >
      <AuthFormCard>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Codes expire after a few minutes. Keep this screen open until you're done.
        </Text>

        <OtpCodeInput
          value={otp}
          onChange={(next) => {
            setOtp(next);
            if (generalError) setGeneralError("");
          }}
        />

        <AuthErrorBanner message={generalError} />

        <PrimaryButton
          title={isPasswordResetMode ? "Continue" : "Verify email"}
          onPress={handleContinue}
          isLoading={isPasswordResetMode ? isVerifyingResetCode : isVerifyingEmail}
          disabled={
            isVerifyingEmail ||
            isVerifyingResetCode ||
            joinedCode.length !== OTP_LENGTH
          }
          className="mt-0"
        />
      </AuthFormCard>

      <View style={styles.resendBlock}>
        <Text style={[styles.resendLabel, { color: colors.textMuted }]}>
          Didn&apos;t receive the code?
        </Text>
        <TouchableOpacity
          onPress={handleResend}
          disabled={
            isPasswordResetMode
              ? isRequestingPasswordReset
              : isResendingVerificationCode
          }
        >
          <Text
            style={[
              styles.resendAction,
              {
                color: colors.primary,
                opacity:
                  isPasswordResetMode
                    ? isRequestingPasswordReset
                      ? 0.5
                      : 1
                    : isResendingVerificationCode
                      ? 0.5
                      : 1,
              },
            ]}
          >
            {isPasswordResetMode
              ? isRequestingPasswordReset
                ? "Sending…"
                : "Resend code"
              : isResendingVerificationCode
                ? "Sending…"
                : "Resend code"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => {
          if (isPasswordResetMode) {
            router.replace({
              pathname: "/forgotpassword",
              params: routeEmail ? { email: routeEmail } : undefined,
            });
            return;
          }
          router.replace("/signin");
        }}
        style={styles.altAction}
      >
        <Text style={[styles.altActionText, { color: colors.primary }]}>
          {isPasswordResetMode ? "Use another email" : "Use a different account"}
        </Text>
      </TouchableOpacity>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
    marginBottom: rV(18),
    textAlign: "center",
    paddingHorizontal: rS(4),
  },
  resendBlock: {
    alignItems: "center",
    marginTop: rV(22),
    gap: rV(8),
  },
  resendLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(14),
  },
  resendAction: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  altAction: {
    alignItems: "center",
    marginTop: rV(14),
    paddingVertical: rV(8),
  },
  altActionText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
  },
});
