import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  roundedFull?: boolean;
  className?: string;
  disabled?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  roundedFull,
  className = "",
  disabled = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`bg-primary ${roundedFull ? "rounded-full" : "rounded-[8px]"} py-6 items-center mt-8 ${className}`}
    style={{
      opacity: disabled ? 0.65 : 1,
    }}
  >
    <Text className="text-white text-lg font-bold">{title}</Text>
  </TouchableOpacity>
);

export default PrimaryButton;
