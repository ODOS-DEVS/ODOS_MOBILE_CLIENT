import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useEffect, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export const OTP_LENGTH = 6;

type OtpCodeInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
  onComplete?: (code: string) => void;
  /** Compact cells for inline phone verification panels. */
  compact?: boolean;
  autoFocus?: boolean;
  editable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

function digitsToArray(code: string) {
  const chars = code.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
  return Array.from({ length: OTP_LENGTH }, (_, index) => chars[index] ?? "");
}

export default function OtpCodeInput({
  value,
  onChange,
  onComplete,
  compact = false,
  autoFocus = false,
  editable = true,
  containerStyle,
}: OtpCodeInputProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput | null>(null);
  const joined = value.join("");
  const cellStyles = compact ? compactStyles : defaultStyles;

  useEffect(() => {
    if (autoFocus && editable) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, editable]);

  const updateFromString = (text: string) => {
    const sanitized = text.replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = digitsToArray(sanitized);
    onChange(next);
    if (sanitized.length === OTP_LENGTH) {
      onComplete?.(sanitized);
    }
  };

  return (
    <Pressable
      style={[cellStyles.row, containerStyle]}
      onPress={() => editable && inputRef.current?.focus()}
    >
      <TextInput
        ref={inputRef}
        value={joined}
        onChangeText={updateFromString}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={OTP_LENGTH}
        editable={editable}
        caretHidden
        style={cellStyles.hiddenInput}
        selectionColor={colors.primary}
        blurOnSubmit={false}
      />
      {value.map((digit, index) => (
        <View
          key={index}
          style={[
            cellStyles.cell,
            {
              backgroundColor: colors.inputBg,
              borderColor: digit ? colors.primary : colors.inputBorder,
            },
            !editable && cellStyles.cellDisabled,
          ]}
        >
          <Text style={[cellStyles.cellText, { color: colors.text }]}>{digit || " "}</Text>
        </View>
      ))}
    </Pressable>
  );
}

const defaultStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: rS(8),
    marginBottom: rV(18),
    position: "relative",
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.02,
    fontSize: 1,
  },
  cell: {
    width: rS(44),
    height: rV(50),
    borderRadius: rMS(12),
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cellDisabled: {
    opacity: 0.85,
  },
  cellText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
    lineHeight: rMS(24),
  },
});

const compactStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: rS(5),
    marginBottom: rV(8),
    position: "relative",
    minHeight: rV(40),
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.02,
    fontSize: 1,
  },
  cell: {
    width: rS(32),
    height: rV(38),
    borderRadius: rMS(10),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cellDisabled: {
    opacity: 0.85,
  },
  cellText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    lineHeight: rMS(20),
  },
});
