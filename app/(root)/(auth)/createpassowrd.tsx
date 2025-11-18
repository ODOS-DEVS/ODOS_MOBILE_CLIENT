import PrimaryButton from "@/components/buttons/PrimaryButton";
import TextInputField from "@/components/TextInputField";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";

const CreatePasswordScreen = () => {
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
        Create new password
      </Text>

      <Text className="text-center text-primary mb-10">
        Enter your new password
      </Text>
      <View className="px-4">
        <TextInputField
          label="New Password"
          placeholder="Enter your new password"
          secureTextEntry
        />
        <TextInputField
          label="Confirm Password"
          placeholder="Confirm your new password"
          secureTextEntry
        />
      </View>
      <View className="px-4">
        <PrimaryButton
          title="Create new password"
          onPress={() => {
            alert("You have created your new password");
          }}
        />
      </View>
    </View>
  );
};

export default CreatePasswordScreen;
