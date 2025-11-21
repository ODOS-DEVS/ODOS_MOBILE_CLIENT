import AuthHeader from "@/components/AuthHeader";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import Divider from "@/components/Divider";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import TextInputField from "@/components/TextInputField";
import { rV } from "@/styles/responsive";
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

        <PrimaryButton
          title="Create Account"
          onPress={() => {
            router.push("/verification");
          }}
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
