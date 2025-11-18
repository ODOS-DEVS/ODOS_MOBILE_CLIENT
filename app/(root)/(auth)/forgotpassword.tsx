import PrimaryButton from "@/components/PrimaryButton";
import TextInputField from "@/components/TextInputField";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";

const ForgotPasswordScreen = () => {
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
        />
      </View>
      <View className="px-4">
        <PrimaryButton
          title="Next"
          onPress={() => {
            router.push("/createpassowrd");
          }}
        />
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;
