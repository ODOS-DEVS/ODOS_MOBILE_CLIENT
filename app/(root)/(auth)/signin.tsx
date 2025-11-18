import AuthHeader from "@/components/AuthHeader";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import Divider from "@/components/Divider";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import TextInputField from "@/components/TextInputField";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const SignInScreen = () => {
  const router = useRouter();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="bg-white flex-1"
    >
      <AuthHeader
        title="Sign In"
        header="Hi, Welcome Back! 👋"
        subtitle="Lorem ipsum dolor sit amet, consectetur"
      />

      <View className="p-6">
        <TextInputField
          label="Email Address"
          placeholder="Enter your email address"
        />
        <TextInputField
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
        />

        <View className="flex flex-row justify-between mt-6">
          <TouchableOpacity>
            <Text className="text-secondary font-montserrat pl-4">
              Remember Me
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              router.push("/forgotpassword");
            }}
          >
            <Text className="text-secondary font-montserrat">
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

        <View className="flex flex-row justify-center mt-10">
          <Text className="font-montserrat-light">Dont have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/signup")}>
            <Text className="text-primary font-montserrat-extraBold">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-10 mb-10 items-center">
          <Divider />
          <SocialLoginButtons />
        </View>

        <Text className="text-center text-lg text-primary">
          By signing up you agree to our{" "}
          <Text className="font-bold text-primary">Terms</Text> and{" "}
          <Text className="text-primary font-bold">Conditions of Use</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default SignInScreen;
