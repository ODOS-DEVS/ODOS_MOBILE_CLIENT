import React from "react";
import { Text, View } from "react-native";

interface AuthHeaderProps {
  title?: string;
  header?: string;
  subtitle?: string;
  onBack?: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, header, subtitle }) => {
  return (
    <View className="bg-primary pt-16 pb-6 px-8">
      <Text className="font-bold text-yellow-50, text-white text-center text-lg mb-8">
        {title}
      </Text>
      <Text className="font-extrabold text-white text-3xl mb-4">
        { header }
      </Text>
      <Text className="font-light text-white">{subtitle}</Text>
    </View>
  );
};

export default AuthHeader;
