import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

// Extends TextInputProps rather than naming a fixed list, so a screen can reach
// the platform behaviour it needs without editing this file. The closed list
// this replaced made two things impossible everywhere the component is used:
// password managers (textContentType / autoComplete), so iOS Keychain and
// Android Autofill never offered saved credentials and iOS never prompted to
// save one; and keyboard submission (returnKeyType / onSubmitEditing plus a ref
// to move focus), so every form had to be submitted by dismissing the keyboard
// and reaching for the button.
type TextInputFieldProps = Omit<TextInputProps, "style"> & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  errorMessage?: string;
  helperText?: string;
};

const TextInputField = forwardRef<TextInput, TextInputFieldProps>(function TextInputField(
  {
    label,
    icon,
    secureTextEntry = false,
    errorMessage,
    helperText,
    autoCapitalize = "sentences",
    autoCorrect = true,
    editable = true,
    multiline = false,
    numberOfLines = 1,
    accessibilityLabel,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.inputBg,
            borderColor: errorMessage ? colors.dangerText : colors.inputBorder,
          },
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={colors.iconMuted}
            style={styles.icon}
          />
        ) : null}

        <TextInput
          {...rest}
          ref={ref}
          placeholderTextColor={colors.placeholder}
          style={[
            styles.input,
            { color: colors.text },
            multiline ? styles.inputMultiline : null,
          ]}
          secureTextEntry={secureTextEntry && !isVisible}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
          selectionColor={colors.primary}
          // The visible label sits in a sibling Text, which a screen reader
          // reads separately from the field it belongs to.
          accessibilityLabel={accessibilityLabel ?? label}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsVisible(!isVisible)}
            disabled={!editable}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={isVisible ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={isVisible ? "eye" : "eye-off"}
              size={20}
              color={colors.iconMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {errorMessage ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.errorText, { color: colors.dangerText }]}
        >
          {errorMessage}
        </Text>
      ) : null}
      {!errorMessage && helperText ? (
        <Text style={[styles.helperText, { color: colors.textMuted }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

export default TextInputField;

const styles = StyleSheet.create({
  container: {
    marginBottom: rV(16),
  },
  label: {
    marginBottom: rV(6),
    paddingLeft: rS(4),
    fontFamily: Fonts.title,
    fontSize: rMS(13),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: rMS(16),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
  },
  icon: {
    marginRight: rS(8),
  },
  input: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    margin: 0,
    padding: 0,
  },
  inputMultiline: {
    minHeight: rV(90),
    paddingTop: rV(2),
  },
  errorText: {
    marginTop: rV(6),
    paddingLeft: rS(4),
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  helperText: {
    marginTop: rV(6),
    paddingLeft: rS(4),
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
  },
});
