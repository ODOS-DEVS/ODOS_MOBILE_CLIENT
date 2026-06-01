import AuthHeader from "@/components/AuthHeader";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import Divider from "@/components/Divider";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import TextInputField from "@/components/TextInputField";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignInScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const { isSigningIn, signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (user?.is_verified) {
      router.replace("../(tabs)");
    }
  }, [router, user]);

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

    const result = await signIn({
      email,
      password,
    });

    if (result.success) {
      if (result.requiresVerification) {
        router.replace({
          pathname: "/verification",
          params: { email: email.trim().toLowerCase() },
        });
      } else {
        router.replace("../(tabs)");
      }
      return;
    }

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
      style={{ flex: 1, backgroundColor: colors.screen }}
      contentContainerStyle={{ paddingBottom: rV(30) }}
    >
      <AuthHeader
        title="Sign In"
        header="Hi, Welcome Back! 👋"
        subtitle="Lorem ipsum dolor sit amet, consectetur"
      />

      <View style={{ padding: rS(20) }}>
        <TextInputField
          label="Email Address"
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
                fontSize: rMS(13),
              }}
            >
              {generalError}
            </Text>
          </View>
        ) : null}

        <View
          className="flex flex-row justify-between"
          style={{ marginTop: rV(2) }}
        >
          <TouchableOpacity>
            <Text
              className="text-secondary font-montserrat"
              style={{ fontSize: rMS(13), paddingLeft: rS(10) }}
            >
              Remember Me
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              router.push("/forgotpassword");
            }}
          >
            <Text
              className="text-secondary font-montserrat"
              style={{ fontSize: rMS(13) }}
            >
              Forgot Password
            </Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title="Sign In"
          onPress={handleSignIn}
          isLoading={isSigningIn}
          disabled={isSigningIn || !email.trim() || !password}
        />

        <View
          className="flex flex-row justify-center"
          style={{ marginTop: rV(15) }}
        >
          <Text className="font-montserrat-light" style={{ fontSize: rMS(14) }}>
            Dont have an account?{" "}
          </Text>

          <TouchableOpacity onPress={() => router.replace("/signup")}>
            <Text
              className="text-primary font-montserrat-extraBold"
              style={{ fontSize: rMS(14) }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View
          className="items-center"
          style={{ marginTop: rV(20), marginBottom: rV(12) }}
        >
          <Divider />
          <SocialLoginButtons onGooglePress={handleGooglePress} />
        </View>

        <Text
          className="text-center text-primary"
          style={{ fontSize: rMS(15), lineHeight: rV(22), marginTop: rV(30) }}
        >
          By continuing you agree to our{" "}
          <Text className="font-bold text-primary">Terms</Text> and{" "}
          <Text className="font-bold text-primary">Conditions of Use</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default SignInScreen;
