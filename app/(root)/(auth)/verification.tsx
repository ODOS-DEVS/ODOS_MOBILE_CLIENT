import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { rMS, rS, rV } from "@/styles/responsive";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const OTP_LENGTH = 6;

export default function VerificationScreen() {
  const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ""));
  const [generalError, setGeneralError] = useState("");
  const inputs = useRef<(TextInput | null)[]>([]);
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
  const displayEmail = routeEmail || user?.email || "your email address";
  const joinedCode = otp.join("");

  useEffect(() => {
    if (!isPasswordResetMode && user?.is_verified) {
      router.replace("../(tabs)");
    }
  }, [isPasswordResetMode, router, user?.is_verified]);

  const handleChange = (text: string, index: number) => {
    const sanitized = text.replace(/\D/g, "");
    const newOtp = [...otp];

    if (!sanitized) {
      newOtp[index] = "";
      setOtp(newOtp);
      setGeneralError("");
      return;
    }

    if (sanitized.length > 1) {
      const merged = [...otp];
      sanitized
        .slice(0, OTP_LENGTH)
        .split("")
        .forEach((char, offset) => {
          const targetIndex = index + offset;
          if (targetIndex < OTP_LENGTH) {
            merged[targetIndex] = char;
          }
        });
      setOtp(merged);
      const nextIndex = Math.min(index + sanitized.length, OTP_LENGTH - 1);
      inputs.current[nextIndex]?.focus();
      setGeneralError("");
      return;
    }

    newOtp[index] = sanitized;
    setOtp(newOtp);
    setGeneralError("");

    if (index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    event: { nativeEvent: { key: string } },
    index: number,
  ) => {
    if (event.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleContinue = async () => {
    if (joinedCode.length !== OTP_LENGTH) {
      setGeneralError("Enter the full 6-digit verification code.");
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
      showToast("Email verified successfully.");
      router.replace("../(tabs)");
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
        inputs.current[0]?.focus();
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
      inputs.current[0]?.focus();
      return;
    }

    setGeneralError(
      result.fieldErrors?.general || "We couldn't send a new code right now.",
    );
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingHorizontal: rS(20), paddingTop: rV(50) }}
    >
      <StatusBar barStyle="dark-content" />

      <View style={{ marginTop: rV(18) }}>
        <Text
          className="text-primary text-center font-montserrat-extraBold"
          style={{ fontSize: rMS(26), marginBottom: rV(14) }}
        >
          {isPasswordResetMode ? "Enter reset code" : "Verify your email"}
        </Text>

        <Text
          className="text-center text-primary font-montserrat"
          style={{ fontSize: rMS(14), lineHeight: rV(22), marginBottom: rV(26) }}
        >
          {isPasswordResetMode
            ? "We sent a 6-digit password reset code to "
            : "We sent a 6-digit verification code to "}
          <Text className="font-montserrat-extraBold text-primary">
            {displayEmail}
          </Text>
        </Text>
      </View>

      <Text
        className="text-center text-secondary font-montserrat"
        style={{ fontSize: rMS(13), lineHeight: rV(20), marginBottom: rV(16) }}
      >
        Stay on this screen until the code is confirmed so the verification flow is not interrupted.
      </Text>

      <View
        className="flex-row justify-center"
        style={{ gap: rS(8), marginBottom: rV(22) }}
      >
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={index === 0 ? OTP_LENGTH : 1}
            className="border border-primary rounded-2xl text-center font-montserrat-extraBold text-primary"
            style={{
              width: rS(44),
              height: rV(52),
              fontSize: rMS(22),
              backgroundColor: "#F5F5F5",
            }}
          />
        ))}
      </View>

      {generalError ? (
        <View
          style={{
            backgroundColor: "#FDF1F1",
            borderColor: "#F2C7C7",
            borderWidth: 1,
            borderRadius: rV(16),
            paddingHorizontal: rV(14),
            paddingVertical: rV(12),
            marginBottom: rV(18),
          }}
        >
          <Text
            style={{
              color: "#B93838",
              fontSize: rMS(13),
            }}
          >
            {generalError}
          </Text>
        </View>
      ) : null}

      <PrimaryButton
        title={isPasswordResetMode ? "Continue" : "Verify Email"}
        onPress={handleContinue}
        isLoading={isPasswordResetMode ? isVerifyingResetCode : isVerifyingEmail}
        disabled={
          isVerifyingEmail || isVerifyingResetCode || joinedCode.length !== OTP_LENGTH
        }
      />

      <View
        className="items-center"
        style={{ marginTop: rV(20), gap: rV(10) }}
      >
        <Text
          className="text-center text-primary font-montserrat"
          style={{ fontSize: rMS(14), lineHeight: rV(22) }}
        >
          Didn’t receive the code?
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
            className="text-primary font-montserrat-extraBold"
            style={{
              fontSize: rMS(14),
              opacity:
                isPasswordResetMode
                  ? isRequestingPasswordReset
                    ? 0.6
                    : 1
                  : isResendingVerificationCode
                    ? 0.6
                    : 1,
            }}
          >
            {isPasswordResetMode
              ? isRequestingPasswordReset
                ? "Sending new code..."
                : "Resend Code"
              : isResendingVerificationCode
                ? "Sending new code..."
                : "Resend Code"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="items-center" style={{ marginTop: rV(14) }}>
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
        >
          <Text
            className="text-primary font-montserrat-extraBold"
            style={{ fontSize: rMS(13.5) }}
          >
            {isPasswordResetMode ? "Use another email" : "Use a different account"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
