import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { rS } from "@/styles/responsive";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  roundedFull?: boolean;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  roundedFull,
  className = "",
  disabled = false,
  isLoading = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || isLoading}
    className={`bg-primary ${roundedFull ? "rounded-full" : "rounded-[8px]"} py-6 items-center mt-8 ${className}`}
    style={{
      opacity: disabled || isLoading ? 0.7 : 1,
    }}
  >
    <View style={styles.content}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color="#FFFFFF"
          style={styles.spinner}
        />
      ) : null}
      <Text className="text-white text-lg font-bold">{title}</Text>
    </View>
  </TouchableOpacity>
);

export default PrimaryButton;

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: rS(20),
  },
  spinner: {
    marginRight: rS(10),
  },
});
