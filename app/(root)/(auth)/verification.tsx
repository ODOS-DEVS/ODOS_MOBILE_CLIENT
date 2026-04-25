import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const { user } = useAuth();
  const routeEmail = Array.isArray(params.email) ? params.email[0] : params.email;
  const displayEmail = routeEmail || user?.email || "your email address";

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
    <View
      className="flex-1 bg-white"
      style={{ paddingHorizontal: rS(20), paddingTop: rV(50) }}
    >
      <StatusBar barStyle={"dark-content"} />
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
      >
        <Ionicons name="arrow-back" size={20} className="" />
      </TouchableOpacity>
      <Text
        className="text-primary text-2xl font-extrabold text-center"
        style={{ marginBottom: rV(16) }}
      >
        Enter OTP
      </Text>

      <Text
        className="text-center text-primary"
        style={{ marginBottom: rV(16) }}
      >
        We have sent a 4-digit code to your email{" "}
        <Text className="font-extrabold text-primary">{displayEmail}</Text>
      </Text>

      <View
        className="flex-row gap-2 justify-center space-x-4"
        style={{ marginBottom: rV(36) }}
      >
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
            className="border border-primary rounded-xl text-center text-xl"
            style={{ width: rS(40), height: rV(40) }}
          />
        ))}
      </View>

      <PrimaryButton title="Continue" onPress={handleContinue} />

      <Text className="text-center text-primary" style={{ marginTop: rV(20) }}>
        Didn’t receive code?{" "}
        <Text className="text-primary font-bold">Resend Code</Text>
      </Text>
    </View>
  );
}
