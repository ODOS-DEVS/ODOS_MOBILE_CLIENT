import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export const OTP_LENGTH = 6;

type OtpCodeInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
  onComplete?: () => void;
};

export default function OtpCodeInput({ value, onChange, onComplete }: OtpCodeInputProps) {
  const { colors } = useTheme();
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const sanitized = text.replace(/\D/g, "");
    const next = [...value];

    if (!sanitized) {
      next[index] = "";
      onChange(next);
      return;
    }

    if (sanitized.length > 1) {
      const merged = [...value];
      sanitized
        .slice(0, OTP_LENGTH)
        .split("")
        .forEach((char, offset) => {
          const targetIndex = index + offset;
          if (targetIndex < OTP_LENGTH) {
            merged[targetIndex] = char;
          }
        });
      onChange(merged);
      const nextIndex = Math.min(index + sanitized.length, OTP_LENGTH - 1);
      inputs.current[nextIndex]?.focus();
      if (merged.every((digit) => digit.length === 1)) {
        onComplete?.();
      }
      return;
    }

    next[index] = sanitized;
    onChange(next);

    if (index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (next.every((digit) => digit.length === 1)) {
      onComplete?.();
    }
  };

  const handleKeyPress = (
    event: { nativeEvent: { key: string } },
    index: number,
  ) => {
    if (event.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {value.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={index === 0 ? OTP_LENGTH : 1}
          style={[
            styles.cell,
            {
              backgroundColor: colors.inputBg,
              borderColor: digit ? colors.primary : colors.inputBorder,
              color: colors.text,
            },
          ]}
          selectionColor={colors.primary}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: rS(8),
    marginBottom: rV(22),
  },
  cell: {
    width: rS(46),
    height: rV(54),
    borderRadius: rMS(14),
    borderWidth: 1.5,
    textAlign: "center",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(22),
  },
});
