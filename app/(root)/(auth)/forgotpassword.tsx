import PrimaryButton from "@/components/buttons/PrimaryButton";
import TextInputField from "@/components/TextInputField";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { rMS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";

const ForgotPasswordScreen = () => {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    const result = await requestPasswordResetCode(trimmedEmail);
    if (!result.success) {
      setGeneralError(result.fieldErrors?.general || "We couldn't send a reset code.");
      return;
    }

    showToast(result.message || "Reset code sent.");
    router.push({
      pathname: "/verification",
      params: {
        email: trimmedEmail,
        mode: "password-reset",
      },
    });
  };

  return (
    <View className="flex-1 bg-white px-6 pt-24">
      <StatusBar barStyle={"dark-content"} />
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
      >
        <Ionicons name="arrow-back" size={20} className="" />
      </TouchableOpacity>

      <Text className="text-primary text-2xl font-extrabold text-center mb-4">
        Forgot Password
      </Text>

      <Text className="text-center text-primary mb-10">
        Recover your account password
      </Text>
      <View className="px-4">
        <TextInputField
          label="Email"
          placeholder="Enter your email address"
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) {
              setEmailError("");
            }
            if (generalError) {
              setGeneralError("");
            }
          }}
          errorMessage={emailError}
          autoCapitalize="none"
          autoCorrect={false}
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
          title={isRequestingPasswordReset ? "Sending code..." : "Next"}
          onPress={handleNext}
          disabled={isRequestingPasswordReset || !email.trim()}
        />
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;
