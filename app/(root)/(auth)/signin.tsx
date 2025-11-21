import AuthHeader from "@/components/AuthHeader";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import Divider from "@/components/Divider";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import TextInputField from "@/components/TextInputField";
import { rMS, rS, rV } from "@/styles/responsive";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const SignInScreen = () => {
  const router = useRouter();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="bg-white flex-1"
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
        />
        <TextInputField
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
        />

        <View
          className="flex flex-row justify-between"
          style={{ marginTop: rV(15) }}
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
          onPress={() => {
            router.replace("../(tabs)/");
          }}
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
          style={{ marginTop: rV(20), marginBottom: rV(30) }}
        >
          <Divider />
          <SocialLoginButtons />
        </View>

        <Text
          className="text-center text-primary"
          style={{ fontSize: rMS(15), lineHeight: rV(22) }}
        >
          By signing up you agree to our{" "}
          <Text className="font-bold text-primary">Terms</Text> and{" "}
          <Text className="font-bold text-primary">Conditions of Use</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default SignInScreen;
