import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  roundedFull?: boolean;
  className?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  roundedFull,
  className = "",
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`bg-primary ${roundedFull ? "rounded-full" : "rounded-[8px]"} py-6 items-center mt-8 ${className}`}
  >
    <Text className="text-white text-lg font-bold">{title}</Text>
  </TouchableOpacity>
);

export default PrimaryButton;
