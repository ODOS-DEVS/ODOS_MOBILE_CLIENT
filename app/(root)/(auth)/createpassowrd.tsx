import PrimaryButton from "@/components/buttons/PrimaryButton";
import TextInputField from "@/components/TextInputField";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { rMS, rV } from "@/styles/responsive";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";

const CreatePasswordScreen = () => {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{
    email?: string | string[];
    resetToken?: string | string[];
  }>();
  const { resetPassword, isResettingPassword } = useAuth();
  const { showToast } = useToast();
  const routeEmail = Array.isArray(params.email) ? params.email[0] : params.email;
  const resetToken = Array.isArray(params.resetToken)
    ? params.resetToken[0]
    : params.resetToken;
  useBlockBackNavigation(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const handleSubmit = async () => {
    setPasswordError("");
    setConfirmPasswordError("");
    setGeneralError("");

    if (!routeEmail || !resetToken) {
      setGeneralError("This password reset session is missing some details. Start again.");
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
      setGeneralError(
        result.fieldErrors?.general || "We couldn't update your password right now.",
      );
      return;
    }

    showToast(result.message || "Password updated successfully.");
    router.replace("/signin");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.screen,
        paddingHorizontal: 24,
        paddingTop: 96,
      }}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <Text className="text-primary text-2xl font-extrabold text-center mb-4">
        Create new password
      </Text>

      <Text className="text-center text-primary mb-10">
        Enter your new password
      </Text>
      <Text
        className="text-center text-secondary mb-6"
        style={{ fontSize: rMS(13), lineHeight: rV(20) }}
      >
        Finish this password update here so the reset session stays valid from start to finish.
      </Text>
      <View className="px-4">
        <TextInputField
          label="New Password"
          placeholder="Enter your new password"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) {
              setPasswordError("");
            }
            if (generalError) {
              setGeneralError("");
            }
          }}
          errorMessage={passwordError}
        />
        <TextInputField
          label="Confirm Password"
          placeholder="Confirm your new password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) {
              setConfirmPasswordError("");
            }
            if (generalError) {
              setGeneralError("");
            }
          }}
          errorMessage={confirmPasswordError}
        />
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
            marginHorizontal: 16,
            marginBottom: rV(12),
          }}
        >
          <Text style={{ color: "#B93838", fontSize: rMS(13) }}>
            {generalError}
          </Text>
        </View>
      ) : null}
      <View className="px-4">
        <PrimaryButton
          title="Create new password"
          onPress={handleSubmit}
          isLoading={isResettingPassword}
          disabled={isResettingPassword || !password || !confirmPassword}
        />
      </View>
      <View className="items-center mt-5">
        <TouchableOpacity
          onPress={() =>
            router.replace({
              pathname: "/forgotpassword",
              params: routeEmail ? { email: routeEmail } : undefined,
            })
          }
        >
          <Text
            className="text-primary font-montserrat-extraBold"
            style={{ fontSize: rMS(13.5) }}
          >
            Start password reset again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreatePasswordScreen;
