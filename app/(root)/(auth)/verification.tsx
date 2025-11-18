import PrimaryButton from "@/components/buttons/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OTPScreen() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleContinue = () => {
    const code = otp.join("");
    if (code.length === 4) {
      alert("OTP entered: " + code);
      router.replace("/signin");
    }
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
        Enter OTP
      </Text>

      <Text className="text-center text-primary mb-10">
        We have sent a 4-digit code to your email{" "}
        <Text className="font-extrabold text-primary">example@gmail.com</Text>
      </Text>

      <View className="flex-row gap-2 justify-center mb-12 space-x-4">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
            className="w-14 h-14 border border-primary rounded-xl text-center text-xl"
          />
        ))}
      </View>

      <PrimaryButton title="Continue" onPress={handleContinue} />

      <Text className="text-center text-primary mt-8">
        Didn’t receive code?{" "}
        <Text className="text-primary font-bold">Resend Code</Text>
      </Text>
    </View>
  );
}
