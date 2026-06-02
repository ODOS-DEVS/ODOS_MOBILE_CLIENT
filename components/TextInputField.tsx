import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TextInputFieldProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  errorMessage?: string;
  helperText?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry = false,
  errorMessage,
  helperText,
  autoCapitalize = "sentences",
  autoCorrect = true,
  editable = true,
  multiline = false,
  numberOfLines = 1,
}) => {
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
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          style={[
            styles.input,
            { color: colors.text },
            multiline ? styles.inputMultiline : null,
          ]}
          secureTextEntry={secureTextEntry && !isVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
          selectionColor={colors.primary}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsVisible(!isVisible)}
            disabled={!editable}
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
        <Text style={[styles.errorText, { color: colors.dangerText }]}>
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
};

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
