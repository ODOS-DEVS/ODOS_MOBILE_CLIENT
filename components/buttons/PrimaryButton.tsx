import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-primary rounded-[8px] py-6 items-center mt-8"
  >
    <Text className="text-white text-lg font-bold" >{title}</Text>
  </TouchableOpacity>
);

export default PrimaryButton;
