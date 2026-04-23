import AuthHeader from "@/components/AuthHeader";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import Divider from "@/components/Divider";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import TextInputField from "@/components/TextInputField";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { rV } from "@/styles/responsive";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUpScreen = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { isSigningUp, signUp, user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("../(tabs)");
    }
  }, [router, user]);

  const handleSignUp = async () => {
    let hasError = false;
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    setFullNameError("");
    setEmailError("");
    setPasswordError("");
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

    if (hasError) {
      return;
    }

    const result = await signUp({
      fullName,
      email,
      password,
    });

    if (result.success) {
      router.replace("../(tabs)");
      return;
    }

    setFullNameError(result.fieldErrors?.fullName || "");
    setEmailError(result.fieldErrors?.email || "");
    setPasswordError(result.fieldErrors?.password || "");
    setGeneralError(result.fieldErrors?.general || result.message || "");
  };

  const handleGooglePress = () => {
    showToast("Google sign-in is not active in Expo Go right now.");
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="bg-white flex-1"
    >
      <AuthHeader
        title="Sign Up"
        header="Create an account"
        subtitle="Lorem ipsum dolor sit amet, consectetur"
      />

      <View className="p-5">
        <TextInputField
          label="Full name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (fullNameError) {
              setFullNameError("");
            }
            if (generalError) {
              setGeneralError("");
            }
          }}
          errorMessage={fullNameError}
          autoCapitalize="words"
        />
        <TextInputField
          label="Email Address"
          placeholder="Enter your email"
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
        <TextInputField
          label="Password"
          placeholder="Enter your password"
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
          autoCapitalize="none"
          autoCorrect={false}
        />

        {generalError ? (
          <View
            style={{
              backgroundColor: "#FDF1F1",
              borderColor: "#F2C7C7",
              borderWidth: 1,
              borderRadius: rV(16),
              paddingHorizontal: rV(14),
              paddingVertical: rV(12),
              marginTop: rV(4),
            }}
          >
            <Text
              style={{
                color: "#B93838",
                fontSize: 13,
              }}
            >
              {generalError}
            </Text>
          </View>
        ) : null}

        <PrimaryButton
          title={isSigningUp ? "Creating Account..." : "Create Account"}
          onPress={handleSignUp}
          disabled={
            isSigningUp || !fullName.trim() || !email.trim() || !password
          }
        />

        <View
          className="flex flex-row justify-center"
          style={{ marginTop: rV(18) }}
        >
          <Text className="font-montserrat-light">Have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/signin")}>
            <Text className="text-primary font-montserrat-extraBold">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        <View
          className="items-center"
          style={{ marginTop: rV(10), marginBottom: rV(18) }}
        >
          <Divider />
          <SocialLoginButtons onGooglePress={handleGooglePress} />
        </View>

        <Text
          className="text-center text-lg text-primary"
          style={{ marginTop: rV(24) }}
        >
          By signing up you agree to our{" "}
          <Text className="font-bold text-primary">Terms</Text> and{" "}
          <Text className="text-primary font-bold">Conditions of Use</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default SignUpScreen;
