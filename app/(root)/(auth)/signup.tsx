import AuthHeader from "@/components/AuthHeader";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import Divider from "@/components/Divider";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import TextInputField from "@/components/TextInputField";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const SignUpScreen = () => {
  const router = useRouter();

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
        <TextInputField label="Full name" placeholder="Enter your full name" />
        <TextInputField label="Email Address" placeholder="Enter your email" />
        <TextInputField
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
        />

        <View className="flex flex-row justify-between mt-2">
          <TouchableOpacity>
            <Text className="text-secondary font-montserrat pl-4">
              Remember Me
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-secondary font-montserrat">
              Forgot Password
            </Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title="Create Account"
          onPress={() => {
            router.push("/verification");
          }}
        />

        <View className="flex flex-row justify-center mt-6">
          <Text className="font-montserrat-light">Have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/signin")}>
            <Text className="text-primary font-montserrat-extraBold">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-2 mb-4 items-center">
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

export default SignUpScreen;
