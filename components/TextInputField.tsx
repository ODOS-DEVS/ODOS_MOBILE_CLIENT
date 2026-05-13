import  { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
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
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          errorMessage ? styles.inputWrapperError : null,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={AppColors.secondary}
            style={styles.icon}
          />
        )}

        <TextInput
          placeholder={placeholder}
          placeholderTextColor={AppColors.secondary}
          value={value}
          onChangeText={onChangeText}
          style={[styles.input, multiline ? styles.inputMultiline : null]}
          secureTextEntry={secureTextEntry && !isVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsVisible(!isVisible)}
            disabled={!editable}
          >
            <Ionicons
              name={isVisible ? "eye" : "eye-off"}
              size={20}
              color={AppColors.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {!errorMessage && helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
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
    paddingLeft: rS(8),
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
    color: AppColors.primary,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#D1D1D1",
    borderRadius: rMS(22),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
  },

  inputWrapperError: {
    borderColor: "#D64545",
  },

  icon: {
    marginRight: rS(8),
  },

  input: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    color: AppColors.text,
    margin: 0,
    padding: 0
  },

  inputMultiline: {
    minHeight: rV(90),
    paddingTop: rV(2),
  },

  errorText: {
    marginTop: rV(6),
    paddingLeft: rS(8),
    color: "#D64545",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },

  helperText: {
    marginTop: rV(6),
    paddingLeft: rS(8),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
  },
});
