import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
}) => {
  const { colors } = useTheme();
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.88}
      className={`mt-8 ${className}`}
      style={[
        styles.button,
        {
          backgroundColor: colors.inverseSurface,
          borderRadius: roundedFull ? 999 : rMS(14),
          opacity: isDisabled ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.onInverseSurface}
            style={styles.spinner}
          />
        ) : null}
        <Text style={[styles.label, { color: colors.onInverseSurface }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    paddingVertical: rV(16),
    paddingHorizontal: rS(20),
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: rS(20),
  },
  spinner: {
    marginRight: rS(10),
  },
  label: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
  },
});
